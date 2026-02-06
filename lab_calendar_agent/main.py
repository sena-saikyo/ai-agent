"""AIカレンダー秘書エージェントのCLIエントリーポイント。"""

from __future__ import annotations

import argparse
import sys

from event_parser import EventParseError, parse_natural_language_to_event
from google_calendar import (
    CalendarApiError,
    add_event,
    get_events_for_today,
    get_events_for_tomorrow,
)


def build_parser() -> argparse.ArgumentParser:
    """CLI引数パーサーを構築する。"""
    parser = argparse.ArgumentParser(
        description="Googleカレンダーを公式データソースとするAIカレンダー秘書CLI"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    add_parser = subparsers.add_parser("add", help="自然文を解析して予定を追加")
    add_parser.add_argument("text", help="例: 来週の火曜15時から中山先生と打ち合わせ")

    list_parser = subparsers.add_parser("list", help="予定一覧を表示")
    list_parser.add_argument("when", choices=["today", "tomorrow"], help="today か tomorrow")

    return parser


def handle_add(text: str) -> int:
    """add コマンドを処理する。"""
    try:
        event = parse_natural_language_to_event(text)
        event_id = add_event(event)
    except EventParseError as exc:
        print(f"[解析エラー] {exc}")
        return 1
    except CalendarApiError as exc:
        print(f"[カレンダーエラー] {exc}")
        return 1
    except ValueError as exc:
        print(f"[設定エラー] {exc}")
        return 1

    print("予定を登録しました。")
    print(f"- ID: {event_id}")
    print(f"- タイトル: {event['title']}")
    print(f"- 日時: {event['date']} {event['start_time']}〜{event['end_time']}")
    return 0


def handle_list(when: str) -> int:
    """list コマンドを処理する。"""
    try:
        events = get_events_for_today() if when == "today" else get_events_for_tomorrow()
    except CalendarApiError as exc:
        print(f"[カレンダーエラー] {exc}")
        return 1
    except ValueError as exc:
        print(f"[設定エラー] {exc}")
        return 1

    label = "今日" if when == "today" else "明日"
    print(f"{label}の予定:")

    if not events:
        print("- 予定はありません。")
        return 0

    for ev in events:
        loc_suffix = f" @ {ev['location']}" if ev.get("location") else ""
        print(f"- {ev['start_time']}〜{ev['end_time']} {ev['title']}{loc_suffix}")

    return 0


def main() -> int:
    """CLIエントリーポイント。"""
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "add":
        return handle_add(args.text)
    if args.command == "list":
        return handle_list(args.when)

    parser.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
