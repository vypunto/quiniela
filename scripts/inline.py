#!/usr/bin/env python3
import os, re, base64

dist = os.path.join(os.path.dirname(__file__), '..', 'dist')

html = open(os.path.join(dist, 'index.html')).read()

# Inline CSS
def inline_css(m):
    href = m.group(1)
    path = os.path.join(dist, href.lstrip('./'))
    css = open(path).read()
    return f'<style>{css}</style>'

html = re.sub(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>', inline_css, html)

# Inline JS — move to before </body> with defer
def inline_js(m):
    src = m.group(1)
    path = os.path.join(dist, src.lstrip('./'))
    js = open(path).read()
    return ''  # remove from <head>

js_src_match = re.search(r'<script[^>]+src="([^"]+)"[^>]*></script>', html)
if js_src_match:
    js_src = js_src_match.group(1)
    js_path = os.path.join(dist, js_src.lstrip('./'))
    js_content = open(js_path).read()
    html = re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>', '', html)
    html = html.replace('</body>', f'<script defer>{js_content}</script>\n</body>')

# Inline favicon as data URI
favicon_path = os.path.join(dist, 'favicon.svg')
if os.path.exists(favicon_path):
    favicon_data = base64.b64encode(open(favicon_path, 'rb').read()).decode()
    html = html.replace('./favicon.svg', f'data:image/svg+xml;base64,{favicon_data}')

out = os.path.join(dist, 'calendapp.html')
open(out, 'w').write(html)
print(f'Written: {out} ({os.path.getsize(out):,} bytes)')
