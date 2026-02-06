"""OpenAI API を利用して自然文を予定データに変換するモジュール。"""

from __future__ import annotations

import json
from datetime import datetime

from openai import OpenAI

from config import OPENAI_API_KEY, validate_required_settings


SYSTEM_PROMPT = """
あなたは日本語の予定文を厳密なJSONに変換するアシスタントです。
以下のルールに従ってください。
- 出力は必ず有効なJSONのみ（説明文やMarkdownは不要）。
- JSONのキーは必ず次の7つ:
  title, date, start_time, end_time, location, description, remind_before_minutes
- dateは YYYY-MM-DD、start_time/end_timeは HH:MM（24時間表記）にする。
- 日付が曖昧（例: 来週の火曜）の場合は、入力時点の今日を基準に具体日付へ変換する。
- 終了時刻が不明な場合は開始時刻から1時間後にする。
- リマインド指定がない場合は remind_before_minutes を 30 にする。
- location, description が不明な場合は空文字にする。
""".strip()


class EventParseError(Exception):
    """自然文の予定解析に失敗した場合の例外。"""


def parse_natural_language_to_event(text: str) -> dict:
    """日本語の自然文からイベント情報dictを生成する。"""
    validate_required_settings()

    if not text.strip():
        raise EventParseError("予定文が空です。予定内容を入力してください。")

    client = OpenAI(api_key=OPENAI_API_KEY)
    today_text = datetime.now().strftime("%Y-%m-%d")

    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"今日の日付: {today_text}\n予定文: {text}",
                },
            ],
            temperature=0,
        )
    except Exception as exc:
        raise EventParseError(f"OpenAI API呼び出しに失敗しました: {exc}") from exc

    raw_output = (response.output_text or "").strip()
    if not raw_output:
        raise EventParseError("AIの応答が空でした。別の表現でお試しください。")

    try:
        event = json.loads(raw_output)
    except json.JSONDecodeError as exc:
        raise EventParseError(
            f"AI出力をJSONとして解釈できませんでした: {raw_output}"
        ) from exc

    required_keys = {
        "title",
        "date",
        "start_time",
        "end_time",
        "location",
        "description",
        "remind_before_minutes",
    }
    missing = required_keys - set(event.keys())
    if missing:
        missing_str = ", ".join(sorted(missing))
        raise EventParseError(f"解析結果に必須キーが不足しています: {missing_str}")

    return event
