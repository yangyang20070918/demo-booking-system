import { Link } from "react-router-dom";

const features = [
  { title: "業務自動化", desc: "日常業務をAIとワークフローで自動化し、作業時間を最大80%削減します。" },
  { title: "データ分析", desc: "蓄積されたデータをリアルタイムで可視化し、意思決定をサポートします。" },
  { title: "API連携", desc: "既存システムとシームレスに連携し、データの一元管理を実現します。" },
];

const cases = [
  { company: "株式会社ABC", result: "受発注処理の自動化で月40時間の工数削減", industry: "EC・小売" },
  { company: "DEF株式会社", result: "AIレポート自動生成で報告書作成を90%効率化", industry: "コンサルティング" },
  { company: "GHI商事", result: "在庫管理の最適化で廃棄ロスを60%削減", industry: "食品卸" },
];

const plans = [
  { name: "Starter", price: "¥50,000/月", features: ["基本ワークフロー3本", "メールサポート", "月次レポート"] },
  { name: "Business", price: "¥150,000/月", features: ["ワークフロー無制限", "API連携5件", "優先サポート", "カスタムダッシュボード"], recommended: true },
  { name: "Enterprise", price: "お問い合わせ", features: ["全機能利用可能", "専任サポート", "オンプレ対応", "SLA保証"] },
];

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", color: "#1a1a2e" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", color: "#fff", padding: "80px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: 16 }}>ビジネスを加速する<br />AI業務自動化プラットフォーム</h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.85, marginBottom: 32, maxWidth: 600, margin: "0 auto 32px" }}>
          データ入力、レポート作成、API連携——<br />あらゆる定型業務をAIが自動化します。
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
        <p style={{ opacity: 0.85, marginBottom: 32 }}>30分のデモで、貴社の業務がどう変わるかをお見せします。</p>
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
