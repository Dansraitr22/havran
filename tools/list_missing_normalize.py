from pathlib import Path
import re
ROOT = Path('.').resolve()
html_files = [p for p in ROOT.rglob('*.html') if 'sites' in p.parts]
link_norm_re = re.compile(r'normalize\.css', flags=re.IGNORECASE)
missing = []
for h in html_files:
    text = h.read_text(encoding='utf-8')
    if not link_norm_re.search(text):
        missing.append(str(h))
print(f"Total HTML files under sites: {len(html_files)}")
print(f"Files missing normalize.css: {len(missing)}")
for f in missing:
    print(f)
