# AIエージェント（Electron + React + TypeScript）

プロトタイプ v0.2 に向けた開発用スケルトンです。Electron のメインプロセスと Vite + React のレンダラーを分けた構成になっています。

## プロジェクト構成（推奨）

```
.
├─ electron/          # メインプロセス & preload（TypeScript）
├─ renderer/          # React + Vite レンダラー
├─ dist/              # ビルド成果物（vite build で生成）
├─ package.json       # ルートのスクリプトと依存関係
└─ tsconfig.base.json # 共通 TS 設定
```

- レンダラー: Vite + React + TypeScript（`renderer/`）
- メイン: Electron (TypeScript, ts-node 実行)
- 通信: preload を介した IPC（今後のステップで実装）

## 使い方（開発）

```bash
npm install
npm run dev
```

- `npm run dev` : Vite 開発サーバーと Electron を並列起動
- `npm run dev:renderer` : Vite のみ
- `npm run dev:main` : Electron のみ（`VITE_DEV_SERVER_URL` に合わせて調整）

## 進め方（ステップ）
1. プロジェクト構成と package.json（このステップ）
2. Electron メインプロセス: 右下ウィンドウ生成、モード別サイズ
3. preload + IPC 設計
4. React 側: モード切り替え UI・ステート管理
5. Firebase Auth 連携
6. Google Calendar API 連携（今日の予定取得）
7. 通知機能（イベント開始前のリマインド）

## メモ
- `node_modules` や `dist` は `.gitignore` 済み
- 将来の `Google Calendar` / `Firebase` 設定値は環境変数経由で注入する方針です
