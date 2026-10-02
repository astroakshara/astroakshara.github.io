#!/usr/bin/env python3
"""Update the copyright month and year in this site's top-level HTML files."""

from datetime import date
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parent.parent
MONTHS = (
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
)
DATE_PATTERN = re.compile(r"(last modified )([A-Z][a-z]{2} \d{4})")


def main() -> None:
    today = date.today()
    current_date = f"{MONTHS[today.month - 1]} {today.year}"
    updated = 0

    for html_file in sorted(ROOT.glob("*.html")):
        original = html_file.read_text(encoding="utf-8")
        revised, replacements = DATE_PATTERN.subn(
            lambda match: f"{match.group(1)}{current_date}", original
        )
        if replacements and revised != original:
            html_file.write_text(revised, encoding="utf-8")
            print(f"Updated {html_file.name}")
            updated += 1

    print(f"Copyright dates now show {current_date} ({updated} file(s) updated).")


if __name__ == "__main__":
    main()
