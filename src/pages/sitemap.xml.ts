import type { APIRoute } from 'astro';
import { indexablePaths } from '../lib/seo';

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Set the canonical site URL in astro.config.mjs.');
  const xmlEscape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
  const urls = indexablePaths.map(path => `  <url><loc>${xmlEscape(new URL(path, site).href)}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
