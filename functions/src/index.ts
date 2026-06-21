import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import * as nodemailer from "nodemailer";

initializeApp();
const db = getFirestore();

const httpOptions = { cors: true, invoker: "public" as const };

// ── GET /available-slots?date=2026-06-25 ──
export const getAvailableSlots = onRequest(httpOptions, async (req, res) => {
  const { date } = req.query;
  if (!date || typeof date !== "string") {
    res.status(400).json({ success: false, message: "date parameter is required (YYYY-MM-DD)" });
    return;
  }

  const slotsSnap = await db
    .collection("slots")
    .where("date", "==", date)
    .where("available", "==", true)
    .orderBy("time")
    .get();

  const slots = slotsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.json({ success: true, slots });
});

// ── POST /create-booking ──
export const createBooking = onRequest(httpOptions, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }

  const { date, time, companyName, name, email, phone, jobTitle, companySize, interest } = req.body;

  if (!date || !time || !companyName || !name || !email) {
    res.status(400).json({ success: false, message: "必須項目が不足しています" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: "メールアドレスの形式が正しくありません" });
    return;
  }

  const slotQuery = await db
    .collection("slots")
    .where("date", "==", date)
    .where("time", "==", time)
    .limit(1)
    .get();

  if (slotQuery.empty) {
    res.status(404).json({ success: false, message: "指定された時間枠が見つかりません" });
    return;
  }

  const slotDoc = slotQuery.docs[0];
  if (!slotDoc.data().available) {
    res.status(409).json({ success: false, message: "この時間はすでに予約済みです" });
    return;
  }

  const bookingRef = db.collection("bookings").doc();
  const bookingData = {
    bookingId: bookingRef.id,
    date,
    time,
    companyName,
    name,
    email,
    phone: phone || "",
    jobTitle: jobTitle || "",
    companySize: companySize || "",
    interest: interest || "",
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const batch = db.batch();
  batch.set(bookingRef, bookingData);
  batch.update(slotDoc.ref, { available: false, bookingId: bookingRef.id });
  await batch.commit();

  res.status(201).json({
    success: true,
    message: "予約を受け付けました",
    bookingId: bookingRef.id,
  });
});

// ── POST /update-booking-status ──
export const updateBookingStatus = onRequest(httpOptions, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "認証が必要です" });
    return;
  }

  try {
    await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);
  } catch {
    res.status(401).json({ success: false, message: "認証トークンが無効です" });
    return;
  }

  const { bookingId, status } = req.body;
  const validStatuses = ["pending", "confirmed", "completed", "cancelled"];

  if (!bookingId || !validStatuses.includes(status)) {
    res.status(400).json({ success: false, message: "無効なパラメータです" });
    return;
  }

  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingSnap = await bookingRef.get();

  if (!bookingSnap.exists) {
    res.status(404).json({ success: false, message: "予約が見つかりません" });
    return;
  }

  await bookingRef.update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (status === "cancelled") {
    const booking = bookingSnap.data()!;
    const slotQuery = await db
      .collection("slots")
      .where("date", "==", booking.date)
      .where("time", "==", booking.time)
      .limit(1)
      .get();
    if (!slotQuery.empty) {
      await slotQuery.docs[0].ref.update({ available: true, bookingId: null });
    }
  }

  res.json({ success: true, message: "ステータスを更新しました" });
});

// ── GET /bookings ──
export const getBookings = onRequest(httpOptions, async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "認証が必要です" });
    return;
  }

  try {
    await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);
  } catch {
    res.status(401).json({ success: false, message: "認証トークンが無効です" });
    return;
  }

  const { status, date } = req.query;
  let query = db.collection("bookings").orderBy("createdAt", "desc") as FirebaseFirestore.Query;

  if (status && typeof status === "string") {
    query = query.where("status", "==", status);
  }
  if (date && typeof date === "string") {
    query = query.where("date", "==", date);
  }

  const snap = await query.limit(100).get();
  const bookings = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
  }));

  res.json({ success: true, bookings });
});

// ── POST /manage-slots ──
export const manageSlots = onRequest(httpOptions, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "認証が必要です" });
    return;
  }

  try {
    await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);
  } catch {
    res.status(401).json({ success: false, message: "認証トークンが無効です" });
    return;
  }

  const { action, date, times } = req.body;

  if (action === "create" && date && Array.isArray(times)) {
    const batch = db.batch();
    for (const time of times) {
      const existing = await db
        .collection("slots")
        .where("date", "==", date)
        .where("time", "==", time)
        .limit(1)
        .get();
      if (existing.empty) {
        const ref = db.collection("slots").doc();
        batch.set(ref, { date, time, available: true, bookingId: null });
      }
    }
    await batch.commit();
    res.json({ success: true, message: "スロットを作成しました" });
    return;
  }

  if (action === "delete" && date && Array.isArray(times)) {
    const batch = db.batch();
    for (const time of times) {
      const snap = await db
        .collection("slots")
        .where("date", "==", date)
        .where("time", "==", time)
        .where("available", "==", true)
        .limit(1)
        .get();
      if (!snap.empty) {
        batch.delete(snap.docs[0].ref);
      }
    }
    await batch.commit();
    res.json({ success: true, message: "スロットを削除しました" });
    return;
  }

  res.status(400).json({ success: false, message: "無効なアクションです" });
});

// ── Firestore Trigger: 予約作成時にメール送信 ──
export const onBookingCreated = onDocumentCreated("bookings/{bookingId}", async (event) => {
  const snap = event.data;
  if (!snap) return;

  const booking = snap.data();
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";
  const salesEmail = process.env.SALES_EMAIL || smtpUser;

  if (!smtpUser || !smtpPass) {
    console.log("SMTP credentials not configured, skipping email");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: `"Demo Booking System" <${smtpUser}>`,
    to: booking.email,
    subject: "【受付完了】デモ予約を承りました",
    html: `
      <h2>デモ予約を受け付けました</h2>
      <p>${booking.name} 様</p>
      <p>以下の内容でデモ予約を承りました。</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>日付</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.date}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>時間</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.time}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>会社名</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.companyName}</td></tr>
      </table>
      <p>担当者より改めてご連絡いたします。</p>
      <p style="color:#888;font-size:12px">※このメールは自動送信です。</p>
    `,
  });

  await transporter.sendMail({
    from: `"Demo Booking System" <${smtpUser}>`,
    to: salesEmail,
    subject: `【新規予約】${booking.companyName} - ${booking.date} ${booking.time}`,
    html: `
      <h2>新しいデモ予約が入りました</h2>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>会社名</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.companyName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>担当者</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>メール</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>電話</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.phone || "未入力"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>日付</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.date}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>時間</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.time}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>役職</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.jobTitle || "未入力"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>会社規模</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.companySize || "未入力"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5"><strong>関心内容</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.interest || "未入力"}</td></tr>
      </table>
    `,
  });

  console.log(`Emails sent for booking ${snap.id}`);
});
