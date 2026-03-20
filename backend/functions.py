from datetime import datetime, timezone, timedelta


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def expires_in_minutes(minutes: int) -> datetime:
    return utc_now() + timedelta(minutes=minutes)


def expires_in_days(days: int) -> datetime:
    return utc_now() + timedelta(days=days)