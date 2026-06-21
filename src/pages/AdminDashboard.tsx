import { useState, useEffect, useCallback } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { fetchBookings, updateBookingStatus, manageSlots } from "../lib/api";
import { format, addDays } from "date-fns";
import { ja } from "date-fns/locale";

type Booking = {
  id: string;
  bookingId: string;
  date: string;
  time: string;
  companyName: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  companySize: string;
  interest: string;
  status: string;
  createdAt: string | null;
};

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "待確認", color: "#b8860b", bg: "#fff8dc" },
  confirmed: { label: "確認済", color: "#228b22", bg: "#f0fff0" },
  completed: { label: "完了", color: "#4169e1", bg: "#f0f0ff" },
  cancelled: { label: "キャンセル", color: "#cd5c5c", bg: "#fff0f0" },
};

const defaultTimes = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

export default function AdminDashboard() {
  const [tab, setTab] = useState<"bookings" | "slots">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();

  // Slots management
  const [slotDate, setSlotDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [selectedSlotTimes, setSelectedSlotTimes] = useState<string[]>([]);
  const [slotMessage, setSlotMessage] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/admin/login");
        return;
      }
      const t = await user.getIdToken();
      setToken(t);
    });
    return unsub;
  }, [navigate]);

  const loadBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchBookings(token, filterStatus ? { status: filterStatus } : undefined);
      setBookings(data.bookings || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleStatusChange = async (bookingId: string, status: string) => {
    await updateBookingStatus(token, bookingId, status);
    setSelectedBooking(null);
    loadBookings();
  };

  const handleCreateSlots = async () => {
    if (selectedSlotTimes.length === 0) return;
    const result = await manageSlots(token, "create", slotDate, selectedSlotTimes);
    setSlotMessage(result.message || "完了");
    setSelectedSlotTimes([]);
    setTimeout(() => setSlotMessage(""), 3000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  const toggleSlotTime = (time: string) => {
    setSelectedSlotTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Header */}
      <header style={{ background: "#302b63", color: "#fff", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Demo Booking 管理画面</h1>
        <button onClick={handleLogout} style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}>
          ログアウト
        </button>
      </header>

      {/* Tabs */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 20px 0" }}>
        <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
          {[
            { key: "bookings" as const, label: "予約一覧" },
            { key: "slots" as const, label: "スロット管理" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: "10px 24px",
                border: "none",
                borderBottom: tab === key ? "3px solid #e94560" : "3px solid transparent",
                background: "transparent",
                fontWeight: tab === key ? "bold" : "normal",
                color: tab === key ? "#302b63" : "#888",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 40px" }}>
        {tab === "bookings" && (
          <>
            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6 }}
              >
                <option value="">すべてのステータス</option>
                <option value="pending">待確認</option>
                <option value="confirmed">確認済</option>
                <option value="completed">完了</option>
                <option value="cancelled">キャンセル</option>
              </select>
              <button
                onClick={loadBookings}
                style={{ padding: "8px 16px", border: "1px solid #ddd", borderRadius: 6, background: "#fff", cursor: "pointer" }}
              >
                更新
              </button>
            </div>

            {loading ? (
              <p style={{ color: "#888", padding: 20 }}>読み込み中...</p>
            ) : bookings.length === 0 ? (
              <p style={{ color: "#888", padding: 20 }}>予約がありません</p>
            ) : (
              <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                      <th style={thStyle}>予約ID</th>
                      <th style={thStyle}>会社名</th>
                      <th style={thStyle}>担当者</th>
                      <th style={thStyle}>日時</th>
                      <th style={thStyle}>ステータス</th>
                      <th style={thStyle}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => {
                      const st = statusLabels[b.status] || statusLabels.pending;
                      return (
                        <tr key={b.id} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={tdStyle}>{b.bookingId?.slice(0, 8).toUpperCase()}</td>
                          <td style={tdStyle}>{b.companyName}</td>
                          <td style={tdStyle}>{b.name}</td>
                          <td style={tdStyle}>{b.date} {b.time}</td>
                          <td style={tdStyle}>
                            <span style={{ background: st.bg, color: st.color, padding: "4px 12px", borderRadius: 12, fontSize: "0.85rem", fontWeight: "bold" }}>
                              {st.label}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <button
                              onClick={() => setSelectedBooking(b)}
                              style={{ padding: "6px 12px", border: "1px solid #ddd", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: "0.85rem" }}
                            >
                              詳細
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Detail Modal */}
            {selectedBooking && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: 500, maxHeight: "80vh", overflowY: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ margin: 0 }}>予約詳細</h3>
                    <button onClick={() => setSelectedBooking(null)} style={{ border: "none", background: "transparent", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {[
                        ["予約ID", selectedBooking.bookingId?.slice(0, 8).toUpperCase()],
                        ["会社名", selectedBooking.companyName],
                        ["担当者", selectedBooking.name],
                        ["メール", selectedBooking.email],
                        ["電話", selectedBooking.phone || "—"],
                        ["役職", selectedBooking.jobTitle || "—"],
                        ["会社規模", selectedBooking.companySize || "—"],
                        ["日時", `${selectedBooking.date} ${selectedBooking.time}`],
                        ["関心内容", selectedBooking.interest || "—"],
                      ].map(([label, value]) => (
                        <tr key={label}>
                          <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", fontWeight: "bold", width: "35%" }}>{label}</td>
                          <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontWeight: "bold", marginBottom: 8 }}>ステータス変更</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Object.entries(statusLabels).map(([key, val]) => (
                        <button
                          key={key}
                          disabled={selectedBooking.status === key}
                          onClick={() => handleStatusChange(selectedBooking.bookingId, key)}
                          style={{
                            padding: "6px 16px",
                            border: `1px solid ${val.color}`,
                            borderRadius: 6,
                            background: selectedBooking.status === key ? val.bg : "#fff",
                            color: val.color,
                            cursor: selectedBooking.status === key ? "default" : "pointer",
                            fontWeight: selectedBooking.status === key ? "bold" : "normal",
                            opacity: selectedBooking.status === key ? 0.6 : 1,
                          }}
                        >
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "slots" && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ marginBottom: 16 }}>予約枠を作成</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: "bold", fontSize: "0.9rem" }}>日付</label>
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, fontSize: "1rem" }}
              />
              <span style={{ marginLeft: 12, color: "#888" }}>
                {slotDate && format(new Date(slotDate), "M/d（E）", { locale: ja })}
              </span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: "bold", fontSize: "0.9rem" }}>時間帯を選択</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {defaultTimes.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleSlotTime(t)}
                    style={{
                      padding: "10px 20px",
                      border: selectedSlotTimes.includes(t) ? "2px solid #302b63" : "1px solid #ddd",
                      borderRadius: 8,
                      background: selectedSlotTimes.includes(t) ? "#f0f0ff" : "#fff",
                      cursor: "pointer",
                      fontWeight: selectedSlotTimes.includes(t) ? "bold" : "normal",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                disabled={selectedSlotTimes.length === 0}
                onClick={handleCreateSlots}
                style={{
                  background: selectedSlotTimes.length > 0 ? "#302b63" : "#ccc",
                  color: "#fff",
                  padding: "10px 24px",
                  border: "none",
                  borderRadius: 8,
                  cursor: selectedSlotTimes.length > 0 ? "pointer" : "not-allowed",
                }}
              >
                スロットを作成
              </button>
              {slotMessage && <span style={{ color: "#228b22", fontWeight: "bold" }}>{slotMessage}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "0.85rem",
  color: "#666",
  fontWeight: "bold",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "0.9rem",
};
