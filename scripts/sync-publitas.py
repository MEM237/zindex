#!/usr/bin/env python3

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INVENTORY = ROOT / "publitas-inventory.json"

with INVENTORY.open("r", encoding="utf-8") as f:
    publications = json.load(f)

public = sum(p.get("status") == "public" for p in publications)
private = sum(p.get("status") == "private" for p in publications)

print(f"TOTAL: {len(publications)}")
print(f"PUBLIC: {public}")
print(f"PRIVATE: {private}")
