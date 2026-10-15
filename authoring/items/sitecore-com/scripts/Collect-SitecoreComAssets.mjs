#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../../..');
const projectRoot = path.join(repoRoot, 'design-screenshots/sitecore-com');
const manifest = JSON.parse(await readFile(path.join(projectRoot, 'manifest.json'), 'utf8'));
const require = createRequire(path.join(repoRoot, '.cursor/package.json'));
const { chromium } = require('playwright');
const pages = [];

for (const entry of manifest) {
  const htmlPath = path.join(entry.dir, 'page.html');
  const html = await readFile(htmlPath, 'utf8');
  pages.push({ slug: entry.slug, html });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const assets = await page.evaluate((capturedPages) => {
  const found = new Map();
  for (const captured of capturedPages) {
    const document = new DOMParser().parseFromString(captured.html, 'text/html');
    for (const image of document.querySelectorAll('img')) {
      const rawUrl = image.getAttribute('src') || image.getAttribute('data-src') || image.getAttribute('data-lazy-src');
      if (!rawUrl || !/^https?:\/\//i.test(rawUrl) || /^data:/i.test(rawUrl)) continue;
      const url = new URL(rawUrl);
      if (!/sitecore\.com$|sitecorecontenthub\.cloud$/i.test(url.hostname)) continue;
      const record = found.get(url.href) ?? { url: url.href, alt: image.getAttribute('alt') || '', pages: [] };
      if (!record.alt && image.getAttribute('alt')) record.alt = image.getAttribute('alt');
      if (!record.pages.includes(captured.slug)) record.pages.push(captured.slug);
      found.set(url.href, record);
    }
  }
  return [...found.values()];
}, pages);
await browser.close();

const outputPath = path.join(projectRoot, 'media-assets.json');
await mkdir(projectRoot, { recursive: true });
await writeFile(outputPath, JSON.stringify(assets, null, 2));
console.log(`Collected ${assets.length} unique image URLs from ${pages.length} captured pages.`);
console.log(`Asset manifest: ${path.relative(repoRoot, outputPath)}`);