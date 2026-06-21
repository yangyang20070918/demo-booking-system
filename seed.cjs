const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

initializeApp({ projectId: "demo-booking-system" });
const db = getFirestore();
const auth = getAuth();

async function seed() {
  console.log("Seeding slots...");

  const today = new Date();
  const times = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const day = d.getDay();
    if (day === 0 || day === 6) continue;

    const dateStr = d.toISOString().split("T")[0];
    for (const time of times) {
      const ref = db.collection("slots").doc();
      await ref.set({ date: dateStr, time, available: true, bookingId: null });
    }
    console.log(`  ${dateStr}: ${times.length} slots created`);
  }

  console.log("\nCreating admin user...");
  try {
    await auth.createUser({
      uid: "admin-user",
      email: "admin@demo.com",
      password: "admin123",
      displayName: "Admin",
    });
    console.log("  Admin user created: admin@demo.com / admin123");
  } catch (e) {
    console.log("  Admin user already exists");
  }

  console.log("\nSeeding sample bookings...");
  const sampleBookings = [
    {
      companyName: "株式会社ABC",
      name: "田中太郎",
      email: "tanaka@abc.co.jp",
      phone: "03-1234-5678",
      jobTitle: "営業部長",
      companySize: "51〜200名",
      interest: "業務の自動化について相談したい",
      status: "confirmed",
    },
    {
      companyName: "DEF株式会社",
      name: "佐藤花子",
      email: "sato@def.co.jp",
      phone: "06-9876-5432",
      jobTitle: "DX推進担当",
      companySize: "201〜500名",
      interest: "データ分析の導入を検討中",
      status: "pending",
    },
    {
      companyName: "GHI商事",
      name: "鈴木一郎",
      email: "suzuki@ghi.co.jp",
      phone: "052-111-2222",
      jobTitle: "情報システム課長",
      companySize: "11〜50名",
      interest: "既存システムとのAPI連携について",
      status: "pending",
    },
  ];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 2);
  while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }

  for (let i = 0; i < sampleBookings.length; i++) {
    const bookDate = new Date(tomorrow);
    bookDate.setDate(bookDate.getDate() + i);
    while (bookDate.getDay() === 0 || bookDate.getDay() === 6) {
      bookDate.setDate(bookDate.getDate() + 1);
    }
    const dateStr = bookDate.toISOString().split("T")[0];
    const time = times[i + 1];

    const ref = db.collection("bookings").doc();
    await ref.set({
      bookingId: ref.id,
      date: dateStr,
      time,
      ...sampleBookings[i],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    const slotSnap = await db.collection("slots")
      .where("date", "==", dateStr)
      .where("time", "==", time)
      .limit(1)
      .get();
    if (!slotSnap.empty) {
      await slotSnap.docs[0].ref.update({ available: false, bookingId: ref.id });
    }

    console.log(`  ${sampleBookings[i].companyName} - ${dateStr} ${time} [${sampleBookings[i].status}]`);
  }

  console.log("\nSeed complete!");
}

seed().catch(console.error);
