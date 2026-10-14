import { Link } from "react-router-dom";

const features = [
  { title: "24時間オンライン予約", desc: "顧客がいつでもWebから予約でき、電話・メール対応の手間を大幅に削減します。" },
  { title: "ステータス管理", desc: "待確認・確認済・完了・キャンセルの4段階で予約のライフサイクルを一元管理します。" },
  { title: "空き枠の柔軟な管理", desc: "日付ごとに予約可能な時間枠を自由に作成・削除。営業日や時間帯を簡単に調整できます。" },
];

const cases = [
  { company: "ABCクリニック", result: "電話予約対応を80%削減し、受付スタッフの負担を軽減", industry: "クリニック" },
  { company: "DEFヘアサロン", result: "オンライン予約導入で新規顧客の予約率が2倍に向上", industry: "美容院" },
  { company: "GHIコンサルティング", result: "相談予約の自動受付で月20時間の事務工数を削減", industry: "士業" },
];

const plans = [
  { name: "Lite", price: "¥5,000/月", features: ["予約受付（月100件まで）", "メール通知", "基本レポート"] },
  { name: "Standard", price: "¥15,000/月", features: ["予約受付 無制限", "SMS通知", "スタッフ管理", "カスタムフォーム"], recommended: true },
  { name: "Premium", price: "お問い合わせ", features: ["全機能利用可能", "複数店舗対応", "API連携", "専任サポート"] },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: "#1a1a2e" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", color: "#fff", padding: "80px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: 16 }}>予約管理をもっとシンプルに</h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.85, marginBottom: 32, maxWidth: 600, margin: "0 auto 32px" }}>
          顧客向け予約フォームと管理者ダッシュボードで、<br />予約受付から管理までを一元化します。
        </p>
        <Link to="/booking" style={{ background: "#e94560", color: "#fff", padding: "16px 40px", borderRadius: 8, textDecoration: "none", fontSize: "1.1rem", fontWeight: "bold" }}>
          無料デモを予約する
        </Link>
      </section>

      {/* Features */}
      <section style={{ padding: "60px 20px", maxWidth: 960, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: 40 }}>主な機能</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: "#f8f9fa", borderRadius: 12, padding: 24 }}>
              <h3 style={{ color: "#302b63", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "#555", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cases */}
      <section style={{ padding: "60px 20px", background: "#f0f0f5" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", marginBottom: 40 }}>導入事例</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {cases.map((c) => (
              <div key={c.company} style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: 4 }}>{c.industry}</p>
                <h3 style={{ marginBottom: 8 }}>{c.company}</h3>
                <p style={{ color: "#302b63", fontWeight: "bold" }}>{c.result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "60px 20px", maxWidth: 960, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: 40 }}>料金プラン</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {plans.map((p) => (
            <div key={p.name} style={{ border: p.recommended ? "2px solid #e94560" : "1px solid #ddd", borderRadius: 12, padding: 24, textAlign: "center", position: "relative" }}>
              {p.recommended && <span style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#e94560", color: "#fff", padding: "4px 16px", borderRadius: 12, fontSize: "0.8rem" }}>おすすめ</span>}
              <h3 style={{ marginBottom: 8 }}>{p.name}</h3>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#302b63", marginBottom: 16 }}>{p.price}</p>
              <ul style={{ listStyle: "none", padding: 0, textAlign: "left" }}>
                {p.features.map((f) => <li key={f} style={{ padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>✓ {f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#302b63", color: "#fff", padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ marginBottom: 16 }}>まずは無料デモでお試しください</h2>
        <p style={{ opacity: 0.85, marginBottom: 32 }}>30分のデモで、予約管理がどう変わるかをお見せします。</p>
        <Link to="/booking" style={{ background: "#e94560", color: "#fff", padding: "16px 40px", borderRadius: 8, textDecoration: "none", fontSize: "1.1rem", fontWeight: "bold" }}>
          デモを予約する
        </Link>
      </section>

      <footer style={{ textAlign: "center", padding: 24, color: "#888", fontSize: "0.85rem" }}>
        © 2026 Demo Booking System. All rights reserved.
      </footer>
    </div>
  );
}
