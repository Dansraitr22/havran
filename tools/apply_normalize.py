
from pathlib import Path
import re
import os

ROOT = Path(__file__).resolve().parents[1]  # repo root (havran)
NORMALIZE = ROOT / 'normalize.css'

if not NORMALIZE.exists():
    print(f"normalize.css not found at {NORMALIZE}")
    raise SystemExit(1)

html_files = [p for p in ROOT.rglob('*.html') if 'sites' in p.parts]
print(f"Found {len(html_files)} HTML files under 'sites/' to check.")

head_open_re = re.compile(r'<head[^>]*>', flags=re.IGNORECASE)
meta_charset_re = re.compile(r'<meta[^>]+charset', flags=re.IGNORECASE)
link_norm_re = re.compile(r'normalize\.css', flags=re.IGNORECASE)

for html in html_files:
    text = html.read_text(encoding='utf-8')
    if link_norm_re.search(text):
        # already contains normalize.css
        continue

    m_head = head_open_re.search(text)
    if not m_head:
        print(f"No <head> found in {html}, skipping")
        continue

    file_dir = html.parent
    rel = Path(os.path.relpath(NORMALIZE, start=file_dir)).as_posix()

    # prefer to insert after existing <meta charset...> if present
    insert_after = None
    m_meta = meta_charset_re.search(text)
    if m_meta:
        insert_pos = m_meta.end()
        insert_str = '\n    <link rel="stylesheet" href="' + rel + '">'
        # insert after meta tag line (find the end of line)
        # find the end of the line following the charset meta
        nl_pos = text.find('\n', insert_pos)
        if nl_pos != -1:
            insert_pos = nl_pos + 1
        text = text[:insert_pos] + insert_str + text[insert_pos:]
    else:
        # insert right after <head>
        insert_pos = m_head.end()
        insert_str = '\n    <meta charset="UTF-8">\n    <link rel="stylesheet" href="' + rel + '">\n'
        text = text[:insert_pos] + insert_str + text[insert_pos:]

    html.write_text(text, encoding='utf-8')
    print(f"Inserted normalize link into {html}")

print('Done.')
