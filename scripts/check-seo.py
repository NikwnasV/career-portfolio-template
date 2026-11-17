"""Validate the actual built pages and crawler endpoints with Python's standard library."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
import json
import struct
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1] / 'dist'
origin = 'https://nvarsakis.gr'

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.meta, self.links, self.ids, self.schemas = {}, {}, set(), []
        self.h1s = 0
        self.json_text = None
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta': self.meta[attrs.get('name', attrs.get('property'))] = attrs.get('content')
        if tag == 'link': self.links[attrs.get('rel')] = attrs.get('href')
        if tag == 'h1': self.h1s += 1
        if 'id' in attrs: self.ids.add(attrs['id'])
        if tag == 'script' and attrs.get('type') == 'application/ld+json': self.json_text = ''
    def handle_data(self, data):
        if self.json_text is not None: self.json_text += data
    def handle_endtag(self, tag):
        if tag == 'script' and self.json_text is not None:
            self.schemas.append(json.loads(self.json_text))
            self.json_text = None

sitemap = ET.parse(root / 'sitemap.xml')
urls = [element.text for element in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(urls) == len(set(urls)) == 2
assert all(url.startswith(origin + '/') and url.endswith('/') for url in urls)
robots = (root / 'robots.txt').read_text()
assert 'User-agent: *' in robots and 'Allow: /' in robots
assert 'Disallow: /' not in robots
assert f'Sitemap: {origin}/sitemap.xml' in robots
pages = {}
for url in urls:
    path = urlparse(url).path
    page = Page((root / path.lstrip('/') / 'index.html').read_text())
    assert page.h1s == 1, f'Expected one primary heading: {url}'
    assert page.links.get('canonical') == url
    assert page.meta.get('og:url') == url
    assert 'noindex' not in page.meta.get('robots', '')
    assert page.links.get('icon') == '/favicon-96x96.png'
    assert page.links.get('shortcut icon') == '/favicon.ico'
    assert page.links.get('apple-touch-icon') == '/apple-touch-icon.png'
    assert page.meta.get('description') and page.meta.get('og:description') == page.meta['description']
    assert page.meta.get('og:image') == origin + '/social-card.png'
    assert page.meta.get('twitter:card') == 'summary_large_image'
    assert page.schemas and page.schemas[0].get('@context') == 'https://schema.org'
    pages[path] = page
assert pages['/'].meta['description'] != pages['/demos/carevisit/'].meta['description']
graph = pages['/'].schemas[0]['@graph']
assert any(node['@type'] == 'Person' and node['name'] == 'Nikonas Varsakis' for node in graph)
profile = next(node for node in graph if node['@type'] == 'ProfilePage')
for item in profile['hasPart']['itemListElement']:
    assert urlparse(item['item']['url']).fragment in pages['/'].ids
missing = Page((root / '404.html').read_text())
assert 'noindex' in missing.meta['robots'] and 'canonical' not in missing.links
png = (root / 'social-card.png').read_bytes()
assert png[:8] == b'\x89PNG\r\n\x1a\n' and struct.unpack('>II', png[16:24]) == (1200, 630)
print('PASS: sitemap, robots, canonical URLs, indexability, JSON-LD, project fragments, unique descriptions, 404 noindex, social image.')

for filename, size in [('favicon-96x96.png', 96), ('apple-touch-icon.png', 180)]:
    data = (root / filename).read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n' and struct.unpack('>II', data[16:24]) == (size, size)
ico = (root / 'favicon.ico').read_bytes()
assert ico[:4] == b'\0\0\1\0'
entries = struct.unpack('<H', ico[4:6])[0]
assert any(ico[6 + 16 * i] == 96 and ico[7 + 16 * i] == 96 for i in range(entries))
print('PASS: stable favicon links, 96px PNG, 180px touch icon and multi-resolution ICO.')
