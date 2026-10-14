# Demo Booking System

企業向けのデモ（商談）予約を受け付け、管理するために個人で開発した Web アプリケーションです。
利用者が空いている日時を選んで予約を申し込み、管理者がログインして予約の確認・ステータス更新・予約枠の管理を行えます。

## 技術スタック

| 区分 | 使用技術 |
| --- | --- |
| フロントエンド | React 19 / TypeScript / Vite / React Router / date-fns |
| 認証 | Firebase Authentication（メールアドレス・パスワード） |
| データベース | Cloud Firestore |
| バックエンド | Cloud Functions for Firebase (v2) / Node.js 22 / TypeScript |
| メール送信 | Nodemailer（Gmail SMTP） |
| ホスティング | Firebase Hosting |
| 開発環境 | Firebase Local Emulator Suite / ESLint |

## 主な機能

### 利用者側（`/booking`）

1. **日時選択** — 日付を選ぶと、その日の空き時間枠を API から取得して表示
2. **予約情報入力** — 会社名・氏名・メールアドレス（必須）、電話番号・役職・会社規模・関心内容（任意）
3. **確認** — 入力内容を確認画面で表示
4. **予約送信** — 予約を登録し、該当の時間枠を予約済みに更新（Firestore のバッチ書き込み）

トップページ（`/`）はサービス紹介用のランディングページです（掲載している事例・料金はデモ用の架空の内容です）。

### 管理者側（`/admin/login`, `/admin`）

- **ログイン** — Firebase Authentication によるメールアドレス・パスワード認証
- **予約一覧** — 予約の一覧表示、ステータスによる絞り込み、詳細表示
- **ステータス更新** — 待確認 / 確認済 / 完了 / キャンセル の 4 段階。キャンセル時は時間枠を空きに戻す
- **予約枠管理** — 日付と時間を指定して予約枠を作成（API は削除にも対応）

管理者向け API は、リクエストヘッダーの Firebase ID トークンを Cloud Functions 側で検証しています。

### メール通知（Firestore Trigger）

`bookings` コレクションへのドキュメント作成をトリガー（`onDocumentCreated`）に、以下の 2 通を送信します。

- 予約者への受付完了メール
- 営業担当者への新規予約通知メール

SMTP の認証情報が設定されていない場合は、送信をスキップしてログのみ出力します。

## API 一覧（Cloud Functions / HTTP）

| 関数名 | メソッド | 認証 | 内容 |
| --- | --- | --- | --- |
| `getAvailableSlots` | GET | 不要 | 指定日の空き時間枠を取得 |
| `createBooking` | POST | 不要 | 予約を作成 |
| `getBookings` | GET | 必要 | 予約一覧を取得（ステータス・日付で絞り込み） |
| `updateBookingStatus` | POST | 必要 | 予約ステータスを更新 |
| `manageSlots` | POST | 必要 | 予約枠の作成・削除 |
| `onBookingCreated` | Firestore Trigger | — | 予約作成時のメール送信 |

## ディレクトリ構成

```
.
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx     # トップページ
│   │   ├── BookingPage.tsx     # 予約フロー（日時選択 → 入力 → 確認 → 完了）
│   │   ├── AdminLogin.tsx      # 管理者ログイン
│   │   └── AdminDashboard.tsx  # 予約一覧・ステータス更新・予約枠管理
│   ├── lib/
│   │   ├── firebase.ts         # Firebase 初期化（開発時は Emulator に接続）
│   │   └── api.ts              # Cloud Functions 呼び出し
│   └── App.tsx                 # ルーティング
├── functions/
│   └── src/index.ts            # Cloud Functions（HTTP API / Firestore Trigger）
├── firestore.rules             # Firestore セキュリティルール
├── firestore.indexes.json      # Firestore インデックス定義
├── firebase.json               # Firebase / Emulator 設定
├── seed.cjs                    # Emulator 用のサンプルデータ投入スクリプト
└── .env.example                # 環境変数のサンプル
```

## ローカル開発

### 前提

- Node.js 22
- Firebase CLI（`npm install -g firebase-tools`）

### セットアップ

```bash
# フロントエンドの依存関係
npm install

# Cloud Functions の依存関係とビルド
cd functions
npm install
npm run build
cd ..
```

### Firebase Emulator の起動（概要）

Auth / Firestore / Functions / Hosting の Emulator を使用します（ポート設定は `firebase.json`）。
`vite.config.ts` のプロキシ設定と `seed.cjs` は、プロジェクト ID `demo-booking-system` を前提としています。

```bash
# Emulator を起動（Emulator UI: http://127.0.0.1:4000）
firebase emulators:start --project demo-booking-system

# 別ターミナルでサンプルデータを投入（予約枠・サンプル予約・管理者ユーザー）
node seed.cjs
```

`seed.cjs` で作成される管理者アカウントは Emulator 専用のテスト用アカウントです。

### フロントエンドの起動

```bash
npm run dev
```

http://localhost:5180 で起動します。開発モードでは、Firebase Auth / Firestore は Emulator に接続し、API リクエストは Vite のプロキシ（`/api`）経由で Functions Emulator に転送されます。

### その他のコマンド

```bash
npm run build   # 型チェック + 本番ビルド
```

## 機密情報の取り扱い

- `.env` / `.env.local` などの環境変数ファイルは `.gitignore` に含め、Git 管理対象外としています。必要な項目は `.env.example` を参照してください。
- SMTP のユーザー名・パスワード（`SMTP_USER` / `SMTP_PASS`）や通知先（`SALES_EMAIL`）は、Cloud Functions の環境変数として設定し、リポジトリには含めていません。
- サービスアカウントの秘密鍵などの認証情報はリポジトリに含めていません。
- Firebase Web 設定（apiKey 等）はクライアント側で使用する設定値であり、SMTP パスワードやサービスアカウント秘密鍵などの機密情報はリポジトリに含めていません。
