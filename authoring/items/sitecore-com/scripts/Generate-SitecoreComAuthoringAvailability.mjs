#!/usr/bin/env node
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../../..');
const serializedRoot = path.join(repoRoot, 'authoring/items/sitecore-com/serialized-content');
const siteRoot = path.join(serializedRoot, 'sitecore-com/sitecore-com');
const projectPlaceholderRoot = path.join(serializedRoot, 'placeholder-settings/sitecore-com.yml');
const renderingsRoot = path.join(serializedRoot, 'renderings/sitecore-com');
const sitePresentation = path.join(siteRoot, 'Presentation');
const componentNames = (await import('node:fs/promises')).readdir
  ? await (await import('node:fs/promises')).readdir(renderingsRoot)
  : [];
const renderingIds = [];

for (const file of componentNames.filter((entry) => entry.endsWith('.yml') && !['CustomerStoryListing.yml', 'CustomerStoryListingCard.yml'].includes(entry))) {
  const yaml = await readFile(path.join(renderingsRoot, file), 'utf8');
  const id = yaml.match(/^ID: "([^"]+)"/m)?.[1];
  if (id) renderingIds.push({ name: file.slice(0, -4), id });
}

const renderingIdByName = new Map(renderingIds.map((rendering) => [rendering.name, rendering.id]));
const groups = [
  { key: 'headless-main', name: 'Headless Main', allowed: renderingIds.filter(({ name }) => !name.endsWith('Card') && !name.endsWith('Item') && name !== 'Navigation').map(({ id }) => id) },
  { key: 'headless-header', name: 'Headless Header', allowed: ['CookieBanner', 'TopBar', 'Header'].map((name) => renderingIdByName.get(name)).filter(Boolean) },
  { key: 'headless-footer', name: 'Headless Footer', allowed: ['Footer'].map((name) => renderingIdByName.get(name)).filter(Boolean) },
];

function readId(yaml) {
  return yaml.match(/^ID: "([^"]+)"/m)?.[1];
}

function allowedControls(ids) {
  return ids.map((id) => `    {${id.toUpperCase()}}`).join('\n');
}

function placeholderYaml(id, parentId, itemPath, key, ids) {
  return `---\nID: "${id}"\nParent: "${parentId}"\nTemplate: "5c547d4e-7111-4995-95b0-6b561751bf2e"\nPath: "${itemPath}"\nSharedFields:\n- ID: "7256bdab-1fd2-49dd-b205-cb4873d2917c"\n  Hint: Placeholder Key\n  Value: "${key}"\n- ID: "e391b526-d0c5-439d-803e-17512eae6222"\n  Hint: Allowed Controls\n  Value: |\n${allowedControls(ids)}\nLanguages:\n- Language: en\n  Versions:\n  - Version: 1\n    Fields: []\n`;
}

async function ensureItem(filePath, makeYaml) {
  try {
    await access(filePath);
    return;
  } catch {}
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, makeYaml());
}

const projectRootYaml = await readFile(projectPlaceholderRoot, 'utf8');
const projectRootId = readId(projectRootYaml);
const sitePlaceholderRootYaml = await readFile(path.join(sitePresentation, 'Placeholder Settings.yml'), 'utf8');
const sitePlaceholderRootId = readId(sitePlaceholderRootYaml);
const availableRootYaml = await readFile(path.join(sitePresentation, 'Available Renderings.yml'), 'utf8');
const availableRootId = readId(availableRootYaml);
if (!projectRootId || !sitePlaceholderRootId || !availableRootId) throw new Error('Could not resolve Sitecore presentation roots.');

for (const group of groups) {
  const projectPath = `/sitecore/layout/Placeholder Settings/Project/sitecore-com/${group.name}`;
  const projectFile = path.join(serializedRoot, 'placeholder-settings/sitecore-com', `${group.name}.yml`);
  await ensureItem(projectFile, () => placeholderYaml(randomUUID(), projectRootId, projectPath, group.key, group.allowed));

  const sitePath = `/sitecore/content/sitecore-com/sitecore-com/Presentation/Placeholder Settings/${group.name}`;
  const siteFile = path.join(sitePresentation, 'Placeholder Settings', `${group.name}.yml`);
  await ensureItem(siteFile, () => placeholderYaml(randomUUID(), sitePlaceholderRootId, sitePath, group.key, group.allowed));
}

const groupName = 'Sitecore.com';
const availableGroupPath = path.join(sitePresentation, 'Available Renderings', `${groupName}.yml`);
const availableGroupSitePath = `/sitecore/content/sitecore-com/sitecore-com/Presentation/Available Renderings/${groupName}`;
await ensureItem(availableGroupPath, () => `---\nID: "${randomUUID()}"\nParent: "${availableRootId}"\nTemplate: "76da0a8d-fc7e-42b2-af1e-205b49e43f98"\nPath: "${availableGroupSitePath}"\nSharedFields:\n- ID: "715ae6c0-71c8-4744-ab4f-65362d20ad65"\n  Hint: Renderings\n  Value: |\n${allowedControls(renderingIds.map(({ id }) => id))}\nLanguages:\n- Language: en\n  Versions:\n  - Version: 1\n    Fields: []\n`);

console.log(`Registered ${renderingIds.length} renderings in ${groupName} and wrote ${groups.length * 2} placeholder setting items.`);