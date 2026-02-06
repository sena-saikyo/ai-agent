"""Google Calendar API のラッパーモジュール。"""

from __future__ import annotations

from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo
from pathlib import Path
from typing import Any

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import Resource, build

from config import (
    GOOGLE_CALENDAR_ID,
    GOOGLE_CLIENT_SECRET_FILE,
    SCOPES,
    TIMEZONE,
    TOKEN_FILE,
    validate_required_settings,
)


class CalendarApiError(Exception):
    """Google Calendar API 操作に失敗した場合の例外。"""


def get_calendar_service() -> Resource:
    """OAuth認証を実行して Google Calendar の service を返す。"""
    validate_required_settings()

    creds: Credentials | None = None

    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            secret_path = Path(GOOGLE_CLIENT_SECRET_FILE)
            flow = InstalledAppFlow.from_client_secrets_file(str(secret_path), SCOPES)
            creds = flow.run_local_server(port=0)

        TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")

    return build("calendar", "v3", credentials=creds)


def _to_rfc3339(date_text: str, time_text: str) -> str:
    """YYYY-MM-DD + HH:MM を Google API向け RFC3339 文字列に変換する。"""
    dt = datetime.strptime(f"{date_text} {time_text}", "%Y-%m-%d %H:%M").replace(
        tzinfo=ZoneInfo(TIMEZONE)
    )
    return dt.isoformat()


def add_event(event: dict[str, Any]) -> str:
    """event dict を元に Google Calendar へ登録し、イベントIDを返す。"""
    try:
        service = get_calendar_service()
        body = {
            "summary": event["title"],
            "description": event.get("description", ""),
            "location": event.get("location", ""),
            "start": {
                "dateTime": _to_rfc3339(event["date"], event["start_time"]),
                "timeZone": TIMEZONE,
            },
            "end": {
                "dateTime": _to_rfc3339(event["date"], event["end_time"]),
                "timeZone": TIMEZONE,
            },
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {
                        "method": "popup",
                        "minutes": int(event.get("remind_before_minutes", 30)),
                    }
                ],
            },
        }

        created = (
            service.events()
            .insert(calendarId=GOOGLE_CALENDAR_ID, body=body)
            .execute()
        )
        return str(created["id"])
    except Exception as exc:
        raise CalendarApiError(f"予定の登録に失敗しました: {exc}") from exc


def get_events_for_date(target_date: date) -> list[dict[str, str]]:
    """指定日のイベント一覧を、表示しやすい形式で返す。"""
    try:
        service = get_calendar_service()

        tz = ZoneInfo(TIMEZONE)
        start_dt = datetime.combine(target_date, time.min, tzinfo=tz).isoformat()
        end_dt = datetime.combine(target_date + timedelta(days=1), time.min, tzinfo=tz).isoformat()

        response = (
            service.events()
            .list(
                calendarId=GOOGLE_CALENDAR_ID,
                timeMin=start_dt,
                timeMax=end_dt,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )

        events = []
        for item in response.get("items", []):
            start_raw = item.get("start", {}).get("dateTime", "")
            end_raw = item.get("end", {}).get("dateTime", "")
            start_time = _extract_hhmm(start_raw)
            end_time = _extract_hhmm(end_raw)

            events.append(
                {
                    "title": item.get("summary", "(無題)"),
                    "start_time": start_time,
                    "end_time": end_time,
                    "location": item.get("location", ""),
                }
            )

        return events
    except Exception as exc:
        raise CalendarApiError(f"予定一覧の取得に失敗しました: {exc}") from exc


def _extract_hhmm(rfc3339: str) -> str:
    """RFC3339形式文字列から HH:MM を取り出す。"""
    if not rfc3339:
        return "--:--"

    try:
        if rfc3339.endswith("Z"):
            rfc3339 = rfc3339.replace("Z", "+00:00")
        dt = datetime.fromisoformat(rfc3339)
        return dt.strftime("%H:%M")
    except ValueError:
        return "--:--"


def get_events_for_today() -> list[dict[str, str]]:
    """今日の予定一覧を返す。"""
    return get_events_for_date(date.today())


def get_events_for_tomorrow() -> list[dict[str, str]]:
    """明日の予定一覧を返す。"""
    return get_events_for_date(date.today() + timedelta(days=1))
