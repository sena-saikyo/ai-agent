"""設定値の読み込みを担うモジュール。"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


# 実行ディレクトリ差異を吸収するため、モジュールと同階層の .env を優先して読み込む。
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
# 念のためカレントディレクトリ側の .env も読む（存在すれば上書き可能）。
load_dotenv()


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GOOGLE_CLIENT_SECRET_FILE = os.getenv("GOOGLE_CLIENT_SECRET_FILE", "")
GOOGLE_CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID", "primary")
TIMEZONE = os.getenv("TIMEZONE", "Asia/Tokyo")


TOKEN_FILE = BASE_DIR / "token.json"
SCOPES = ["https://www.googleapis.com/auth/calendar"]


def validate_required_settings() -> None:
    """最低限必要な設定値があるかをチェックする。"""
    missing = []
    if not OPENAI_API_KEY:
        missing.append("OPENAI_API_KEY")
    if not GOOGLE_CLIENT_SECRET_FILE:
        missing.append("GOOGLE_CLIENT_SECRET_FILE")

    if missing:
        joined = ", ".join(missing)
        raise ValueError(f"必須環境変数が不足しています: {joined}")
