from pathlib import Path
import re

base = Path(__file__).resolve().parent.parent
chunk = (base / "scripts" / "features-chunk.html").read_text(encoding="utf-8")

# Keep only feature-briefing block
m = re.search(r'(?s)<div class="feature-briefing">.*?</div>\s*</div>\s*</section>', chunk)
if not m:
    # fallback: until CHANGE
    m = re.search(r'(?s)(<div class="feature-briefing">.*?</div>)\s*</div>\s*</section>', chunk)
body = m.group(0) if m else chunk
# trim trailing wrappers from chunk
body = re.search(r'(?s)<div class="feature-briefing">.*?</article>\s*</div>', chunk).group(0)

# remap image filenames with spaces to underscored local paths
def remap(name: str) -> str:
    return "images/features/" + name.replace(" ", "_")

body = re.sub(
    r'(src|data-src)="([^"]+\.png)"',
    lambda m: f'{m.group(1)}="{remap(m.group(2))}"',
    body,
)

section = f'''    <!-- ========== FEATURES ========== -->
    <section class="section section--features" id="features">
      <div class="container">
        <header class="section__head">
          <p class="eyebrow">Features</p>
          <h2 class="section__title">2026년 2학기 주요 업데이트 브리핑</h2>
          <p class="section__desc">2026년 2학기부터 대대적인 기능 업데이트가 진행되고 있습니다.</p>
        </header>

{body}

      </div>
    </section>

    <div class="gallery-lightbox" id="feature-lightbox" hidden>
      <button type="button" class="gallery-lightbox__backdrop" data-lightbox-close aria-label="닫기"></button>
      <button type="button" class="gallery-lightbox__close" data-lightbox-close aria-label="닫기">×</button>
      <figure class="gallery-lightbox__figure">
        <img class="gallery-lightbox__image" src="" alt="" />
        <figcaption class="gallery-lightbox__caption"></figcaption>
      </figure>
    </div>
'''

out = base / "scripts" / "features-section.partial.html"
out.write_text(section, encoding="utf-8")
print("wrote", out, "len", len(section))
