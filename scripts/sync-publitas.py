#!/usr/bin/env python3

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GROUP = "mark-ezra-designs"
API = f"https://api.publitas.com/v1/groups/{GROUP}/publications.json"

print("Fetching Publitas...")

with urllib.request.urlopen(API, timeout=30) as response:
    publications = json.load(response)

inventory = []

for p in publications:
    slug = p["slug"]
    pub_id = str(p["id"])

    detail_url = f"https://api.publitas.com/v1/groups/{GROUP}/publications/{slug}"

    with urllib.request.urlopen(detail_url, timeout=30) as response:
        detail = json.load(response)

    spreads = detail.get("spreads", [])
    pages = spreads[0].get("pages", []) if spreads else []

    if not pages:
        print(f"WARNING: no cover page for {p['title']}")
        continue

    page_path = pages[0]
    cover = f"https://view.publitas.com{page_path}-at200.jpg"

    inventory.append({
        "id": pub_id,
        "title": p["title"],
        "status": "public",
        "url": f"https://view.publitas.com/{GROUP}/{slug}/",
        "cover": cover
    })

data = json.dumps(inventory, indent=2) + "\n"

(ROOT / "publitas-inventory.json").write_text(data, encoding="utf-8")
(ROOT / "docs" / "publitas-inventory.json").write_text(data, encoding="utf-8")

print(f"SYNCED: {len(inventory)} public publications")