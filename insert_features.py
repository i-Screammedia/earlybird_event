from pathlib import Path

base = Path(__file__).resolve().parent.parent
index_path = base / "index.html"
partial_path = base / "scripts" / "features-section.partial.html"

index = index_path.read_text(encoding="utf-8")
partial = partial_path.read_text(encoding="utf-8")

if 'id="features"' in index:
    print("already inserted")
    raise SystemExit(0)

marker = "    <!-- ========== 2. BENEFITS ========== -->"
if marker not in index:
    raise SystemExit("marker not found")

index = index.replace(marker, partial + "\n" + marker)

old = '<link rel="stylesheet" href="css/styles.css" />'
new = old + '\n  <link rel="stylesheet" href="css/features.css" />'
if "css/features.css" not in index:
    if old not in index:
        raise SystemExit("styles link not found")
    index = index.replace(old, new)

index_path.write_text(index, encoding="utf-8")
print("ok")
