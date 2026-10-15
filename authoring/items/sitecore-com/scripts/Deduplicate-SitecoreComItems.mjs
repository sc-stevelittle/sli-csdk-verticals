#!/usr/bin/env node
import { readdir, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../../..');
const siteRoot = path.join(repoRoot, 'authoring/items/sitecore-com/serialized-content/sitecore-com');

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.name.endsWith('.yml')) files.push(fullPath);
  }
  return files;
}

const files = await walk(siteRoot);
const records = [];
const referencedIds = new Set();
for (const file of files) {
  const yaml = await readFile(file, 'utf8');
  const pathValue = yaml.match(/^Path: "([^"]+)"/m)?.[1];
  const id = yaml.match(/^ID: "([^"]+)"/m)?.[1];
  if (pathValue && id) records.push({ file, path: pathValue, id });
  for (const match of yaml.matchAll(/s:ds="([0-9a-f-]{36})"/gi)) referencedIds.add(match[1].toLowerCase());
}

const groups = new Map();
for (const record of records) {
  const group = groups.get(record.path) ?? [];
  group.push(record);
  groups.set(record.path, group);
}

let removed = 0;
for (const [sitecorePath, group] of groups) {
  if (group.length < 2) continue;
  const referenced = group.filter((record) => referencedIds.has(record.id.toLowerCase()));
  if (referenced.length > 1) {
    throw new Error(`Multiple duplicate IDs are referenced for ${sitecorePath}: ${referenced.map((record) => record.id).join(', ')}`);
  }
  const keeper = referenced[0] ?? group.find((record) => !/[A-F0-9]{16}/.test(path.relative(siteRoot, record.file))) ?? group[0];
  for (const record of group) {
    if (record.file === keeper.file) continue;
    await unlink(record.file);
    console.log(`Removed unreferenced duplicate: ${path.relative(repoRoot, record.file)}`);
    removed += 1;
  }
}

console.log(`Removed ${removed} duplicate YAML file(s); retained layout-referenced item IDs.`);