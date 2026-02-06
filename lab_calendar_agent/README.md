# lab_calendar_agent

Googleカレンダーを公式カレンダーとして利用する、最小構成のAIカレンダー秘書CLIです。  
自然文から予定を構造化し、Googleカレンダーへ登録できます。さらに、今日/明日の予定一覧を簡単に確認できます。

## 1. 前提

- Python 3.10 以上を推奨
- Googleアカウント
- OpenAI APIキー

## 2. セットアップ

### 2-1. プロジェクトディレクトリへ移動

```bash
cd lab_calendar_agent
```

### 2-2. 仮想環境の作成と有効化

#### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### Windows (PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2-3. 依存ライブラリをインストール

```bash
pip install -r requirements.txt
```

## 3. Google OAuth クライアントID作成（概要）

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. 新規プロジェクト作成（または既存プロジェクト選択）
3. **Google Calendar API** を有効化
4. 「認証情報」→「認証情報を作成」→「OAuth クライアントID」
5. アプリケーション種類は **デスクトップアプリ** を選択
6. ダウンロードしたJSONファイルを `lab_calendar_agent` ディレクトリへ置く
   - 例: `lab_calendar_agent/client_secret.json`

## 4. 環境変数設定

`.env.example` をコピーして `.env` を作成します。

```bash
cp .env.example .env
```

`.env` を編集し、以下を設定してください。

- `OPENAI_API_KEY`: OpenAIのAPIキー
- `GOOGLE_CLIENT_SECRET_FILE`: OAuthクライアントシークレットJSONのパス
  - 例: `./client_secret.json`
- 必要に応じて `GOOGLE_CALENDAR_ID`（通常は `primary`）

## 5. 初回実行時の認証

Googleカレンダーを初めて操作する際、ブラウザが起動してGoogle認証画面が表示されます。  
許可後、`token.json` が生成され、次回以降は基本的に再認証不要です。

## 6. 使い方

### 6-1. 予定を追加（自然文）

```bash
python main.py add "明日の14時から1時間、VR酔いの実験"
```

処理フロー:

1. 自然文をOpenAI APIでJSON化
2. JSONをGoogleカレンダーイベントへ変換
3. イベント登録

### 6-2. 今日の予定を一覧表示

```bash
python main.py list today
```

### 6-3. 明日の予定を一覧表示

```bash
python main.py list tomorrow
```

出力形式（例）:

```text
今日の予定:
- 14:00〜15:00 VR酔いの実験 @ 研究室
- 16:00〜17:00 定例MTG
```

## 7. ファイル構成

```text
lab_calendar_agent/
  main.py
  google_calendar.py
  event_parser.py
  config.py
  requirements.txt
  .env.example
  README.md
```

## 8. 注意点

- 自然文の曖昧さによっては、意図と異なる日時に変換される可能性があります。
- `list` はタイムゾーン設定 (`TIMEZONE`) を基準に当日/翌日を取得します。
- APIキーや `client_secret.json` はGit管理しないでください。
