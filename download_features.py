from pathlib import Path
import urllib.parse
import urllib.request

base = Path(__file__).resolve().parent.parent
out = base / "images" / "features"
out.mkdir(parents=True, exist_ok=True)

files = [
    "Mastering math02.png",
    "Mastering math03.png",
    "evaluation.png",
    "dashboard.png",
    "dashboard01.png",
    "dashboard02.png",
    "dashboard03.png",
    "dashboard04.png",
    "game.png",
    "basic.png",
    "avatar.png",
    "avatar01.png",
    "mathboard.png",
    "makeevaluation.png",
    "monitoring.png",
    "summative assessment.png",
    "Teaching materials.png",
    "FAQ.png",
]

root = "https://i-screammedia.github.io/update-briefing/"
for name in files:
    url = root + urllib.parse.quote(name)
    dest = out / name.replace(" ", "_")
    print("GET", name, "->", dest.name)
    urllib.request.urlretrieve(url, dest)
    print(" OK", dest.stat().st_size)
