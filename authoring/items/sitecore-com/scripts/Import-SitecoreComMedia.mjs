#!/usr/bin/env node
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../../..');
const projectRoot = path.join(repoRoot, 'design-screenshots/sitecore-com');
const moduleRoot = path.join(repoRoot, 'authoring/items/sitecore-com/serialized-content');
const mediaRoot = path.join(moduleRoot, 'media-library/sitecore-com/sitecore-com');
const mediaPath = '/sitecore/media library/Project/sitecore-com/sitecore-com';
const input = JSON.parse(await readFile(path.join(projectRoot, 'media-assets.json'), 'utf8'));
const siteMediaYaml = await readFile(path.join(moduleRoot, 'media-library/sitecore-com/sitecore-com.yml'), 'utf8');
const siteRootId = siteMediaYaml.match(/^ID: "([^"]+)"/m)?.[1];
if (!siteRootId) throw new Error('Could not find the generated site media root ID.');

function getImageSize(bytes, mime) {
  if (mime === 'image/png' && bytes.length >= 24) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (mime === 'image/gif' && bytes.length >= 10) {
    return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
  }
  if (mime === 'image/svg+xml') {
    const svg = bytes.toString('utf8');
    const viewBox = svg.match(/viewBox="\s*[\d.]+[ ,]+[\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)\s*"/i);
    if (viewBox) return { width: Math.round(Number(viewBox[1])), height: Math.round(Number(viewBox[2])) };
  }
  if (mime === 'image/jpeg') {
    let offset = 2;
    while (offset < bytes.length) {
      if (bytes[offset] !== 0xff) break;
      const marker = bytes[offset + 1];
      const length = bytes.readUInt16BE(offset + 2);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
      }
      offset += length + 2;
    }
  }
  return { width: 1920, height: 1080 };
}

function mediaType(contentType) {
  const mime = contentType.split(';')[0].trim().toLowerCase();
  const extension = ({
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
    'image/avif': 'avif',
  })[mime];
  if (!extension) throw new Error(`Unsupported image content type: ${contentType}`);
  return { mime, extension };
}

function yamlString(value) {
  return JSON.stringify(value ?? '');
}

await mkdir(mediaRoot, { recursive: true });
const assetFolderPath = path.join(mediaRoot, 'assets');
await mkdir(assetFolderPath, { recursive: true });
const folderYamlPath = path.join(mediaRoot, 'assets.yml');
let folderId;
try {
  const folderYaml = await readFile(folderYamlPath, 'utf8');
  folderId = folderYaml.match(/^ID: "([^"]+)"/m)?.[1];
} catch {
  folderId = randomUUID();
  await writeFile(folderYamlPath, `---\nID: "${folderId}"\nParent: "${siteRootId}"\nTemplate: "fe5dd826-48c6-436d-b87a-7c4210c7413b"\nPath: "${mediaPath}/assets"\nLanguages:\n- Language: en\n  Versions:\n  - Version: 1\n`);
}
if (!folderId) throw new Error('Could not create or read the assets media folder.');

const assetsByPath = new Map();
for (const asset of input) {
  const url = new URL(asset.url);
  const id = url.pathname.split('/').filter(Boolean).at(-1);
  if (!id) continue;
  const current = assetsByPath.get(id);
  if (!current) assetsByPath.set(id, { ...asset, assetId: id });
  else {
    current.pages = [...new Set([...current.pages, ...asset.pages])];
    if (!current.alt && asset.alt) current.alt = asset.alt;
  }
}

const mapping = [];
const queue = [...assetsByPath.values()];
let downloaded = 0;
let reused = 0;
const workers = Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const asset = queue.shift();
    const mediaItemPath = `${mediaPath}/assets/${asset.assetId}`;
    const yamlPath = path.join(assetFolderPath, `${asset.assetId}.yml`);
    try {
      await access(yamlPath);
      const yaml = await readFile(yamlPath, 'utf8');
      const mediaId = yaml.match(/^ID: "([^"]+)"/m)?.[1];
      mapping.push({ ...asset, mediaId, path: mediaItemPath });
      reused += 1;
      continue;
    } catch {}

    const response = await fetch(asset.url, { headers: { Accept: 'image/avif,image/webp,image/*,*/*;q=0.8' } });
    if (!response.ok) throw new Error(`Download failed (${response.status}) for ${asset.url}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const { mime, extension } = mediaType(response.headers.get('content-type') ?? '');
    const { width, height } = getImageSize(bytes, mime);
    const mediaId = randomUUID();
    const blobId = randomUUID();
    const size = bytes.length;
    const alt = String(asset.alt || '').replace(/"/g, '\\"');
    const yaml = `---\nID: "${mediaId}"\nParent: "${folderId}"\nTemplate: "f1828a2c-7e5d-4bbd-98ca-320474871548"\nPath: "${mediaItemPath}"\nSharedFields:\n- ID: "22eac599-f13b-4607-a89d-c091763a467d"\n  Hint: Width\n  Value: ${width}\n- ID: "40e50ed9-ba07-4702-992e-a912738d32dc"\n  Hint: Blob\n  BlobID: "${blobId}"\n  Value: ${bytes.toString('base64')}\n- ID: "6954b7c7-2487-423f-8600-436cb3b6dc0e"\n  Hint: Size\n  Value: ${size}\n- ID: "6f47a0a5-9c94-4b48-abeb-42d38def6054"\n  Hint: Mime Type\n  Value: ${mime}\n- ID: "c06867fe-9a43-4c7d-b739-48780492d06f"\n  Hint: Extension\n  Value: ${extension}\n- ID: "cb09946f-3218-4823-87d2-d5007c199a96"\n  Hint: Dimensions\n  Value: ${width} x ${height}\n- ID: "de2ca9e4-c117-4c8a-a139-1ff4b199d15a"\n  Hint: Height\n  Value: ${height}\nLanguages:\n- Language: en\n  Versions:\n  - Version: 1\n    Fields:\n    - ID: "65885c44-8fcd-4a7f-94f1-ee63703fe193"\n      Hint: Alt\n      Value: ${yamlString(alt)}\n`;
    await writeFile(yamlPath, yaml);
    mapping.push({ ...asset, mediaId, path: mediaItemPath, mime, width, height });
    downloaded += 1;
  }
});

await Promise.all(workers);
mapping.sort((left, right) => left.assetId.localeCompare(right.assetId));
await writeFile(path.join(projectRoot, 'media-mapping.json'), JSON.stringify(mapping, null, 2));
console.log(`Imported ${downloaded} media items; reused ${reused}.`);
console.log(`Media YAML: ${path.relative(repoRoot, mediaRoot)}`);
console.log(`Mapping: ${path.relative(repoRoot, path.join(projectRoot, 'media-mapping.json'))}`);