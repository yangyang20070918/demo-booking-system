import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import { fetchAvailableSlots, createBooking } from "../lib/api";

const companySizes = ["1〜10名", "11〜50名", "51〜200名", "201〜500名", "501名以上"];

export default function BookingPage() {
  const [step, setStep] = useState<"date" | "form" | "confirm" | "done">("date");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<{ id: string; time: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const [form, setForm] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    companySize: "",
    interest: "",
  });

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i + 1);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return null;
    return format(d, "yyyy-MM-dd");
  }).filter(Boolean) as string[];

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime("");
    fetchAvailableSlots(selectedDate)
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await createBooking({
        date: selectedDate,
        time: selectedTime,
        ...form,
      });
      if (result.success) {
        setBookingId(result.bookingId);
        setStep("done");
      } else {
        alert(result.message || "予約に失敗しました");
      }
    } catch {
      alert("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return format(d, "M/d（E）", { locale: ja });
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', sans-serif",
  };

  if (step === "done") {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>✓</div>
          <h2 style={{ color: "#302b63", marginBottom: 16 }}>予約を受け付けました</h2>
          <div style={{ background: "#f8f9fa", borderRadius: 12, padding: 24, textAlign: "left", maxWidth: 400, margin: "0 auto 24px" }}>
            <p><strong>予約ID：</strong>{bookingId.slice(0, 8).toUpperCase()}</p>
            <p><strong>日付：</strong>{formatDateLabel(selectedDate)}</p>
            <p><strong>時間：</strong>{selectedTime}</p>
            <p><strong>会社名：</strong>{form.companyName}</p>
            <p><strong>お名前：</strong>{form.name}</p>
          </div>
          <p style={{ color: "#666", marginBottom: 24 }}>確認メールをお送りしました。<br />担当者より改めてご連絡いたします。</p>
          <Link to="/" style={{ color: "#302b63", textDecoration: "underline" }}>トップページへ戻る</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Link to="/" style={{ color: "#302b63", textDecoration: "none", fontSize: "0.9rem" }}>← トップページ</Link>
      <h1 style={{ color: "#302b63", margin: "24px 0" }}>デモ予約</h1>

      {/* Progress */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {["日時選択", "情報入力", "確認"].map((label, i) => {
          const steps = ["date", "form", "confirm"];
          const active = steps.indexOf(step) >= i;
          return (
            <div key={label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 4, background: active ? "#e94560" : "#ddd", borderRadius: 2, marginBottom: 8 }} />
              <span style={{ fontSize: "0.85rem", color: active ? "#302b63" : "#aaa" }}>{label}</span>
            </div>
          );
        })}
      </div>

      {step === "date" && (
        <>
          <h3 style={{ marginBottom: 16 }}>日付を選択</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {dates.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                style={{
                  padding: "10px 16px",
                  border: selectedDate === d ? "2px solid #e94560" : "1px solid #ddd",
                  borderRadius: 8,
                  background: selectedDate === d ? "#fff0f3" : "#fff",
                  cursor: "pointer",
                  fontWeight: selectedDate === d ? "bold" : "normal",
                }}
              >
                {formatDateLabel(d)}
              </button>
            ))}
          </div>

          {selectedDate && (
            <>
              <h3 style={{ marginBottom: 16 }}>時間を選択</h3>
              {loadingSlots ? (
                <p style={{ color: "#888" }}>読み込み中...</p>
              ) : slots.length === 0 ? (
                <p style={{ color: "#888" }}>この日は予約可能な時間がありません</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                  {slots.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedTime(s.time)}
                      style={{
                        padding: "10px 20px",
                        border: selectedTime === s.time ? "2px solid #e94560" : "1px solid #ddd",
                        borderRadius: 8,
                        background: selectedTime === s.time ? "#fff0f3" : "#fff",
                        cursor: "pointer",
                        fontWeight: selectedTime === s.time ? "bold" : "normal",
                      }}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <button
            disabled={!selectedDate || !selectedTime}
            onClick={() => setStep("form")}
            style={{
              background: selectedDate && selectedTime ? "#e94560" : "#ccc",
              color: "#fff",
              padding: "12px 32px",
              border: "none",
              borderRadius: 8,
              cursor: selectedDate && selectedTime ? "pointer" : "not-allowed",
              fontSize: "1rem",
            }}
          >
            次へ
          </button>
        </>
      )}

      {step === "form" && (
        <>
          <div style={{ display: "grid", gap: 16 }}>
            <Field label="会社名" required value={form.companyName} onChange={(v) => setForm({ ...form, companyName: v })} />
            <Field label="お名前" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="メールアドレス" required type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="電話番号" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="役職" value={form.jobTitle} onChange={(v) => setForm({ ...form, jobTitle: v })} />
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: "bold", fontSize: "0.9rem" }}>会社規模</label>
              <select
                value={form.companySize}
                onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: "1rem" }}
              >
                <option value="">選択してください</option>
                {companySizes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: "bold", fontSize: "0.9rem" }}>ご関心のある内容</label>
              <textarea
                value={form.interest}
                onChange={(e) => setForm({ ...form, interest: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: "1rem", resize: "vertical" }}
                placeholder="例：業務の自動化について相談したい"
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={() => setStep("date")} style={{ padding: "12px 24px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer" }}>戻る</button>
            <button
              disabled={!form.companyName || !form.name || !form.email}
              onClick={() => setStep("confirm")}
              style={{
                background: form.companyName && form.name && form.email ? "#e94560" : "#ccc",
                color: "#fff",
                padding: "12px 32px",
                border: "none",
                borderRadius: 8,
                cursor: form.companyName && form.name && form.email ? "pointer" : "not-allowed",
              }}
            >
              確認画面へ
            </button>
          </div>
        </>
      )}

      {step === "confirm" && (
        <>
          <div style={{ background: "#f8f9fa", borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>予約内容の確認</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["日付", formatDateLabel(selectedDate)],
                  ["時間", selectedTime],
                  ["会社名", form.companyName],
                  ["お名前", form.name],
                  ["メールアドレス", form.email],
                  ["電話番号", form.phone || "—"],
                  ["役職", form.jobTitle || "—"],
                  ["会社規模", form.companySize || "—"],
                  ["ご関心のある内容", form.interest || "—"],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", fontWeight: "bold", width: "40%", verticalAlign: "top" }}>{label}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep("form")} style={{ padding: "12px 24px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer" }}>修正する</button>
            <button
              disabled={submitting}
              onClick={handleSubmit}
              style={{ background: "#e94560", color: "#fff", padding: "12px 32px", border: "none", borderRadius: 8, cursor: submitting ? "not-allowed" : "pointer" }}
            >
              {submitting ? "送信中..." : "予約を確定する"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, required, type = "text", value, onChange }: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 4, fontWeight: "bold", fontSize: "0.9rem" }}>
        {label}{required && <span style={{ color: "#e94560" }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: "1rem", boxSizing: "border-box" }}
      />
    </div>
  );
}
