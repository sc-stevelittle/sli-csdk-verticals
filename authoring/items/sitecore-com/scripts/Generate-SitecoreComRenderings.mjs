#!/usr/bin/env node
import { mkdtemp, readFile, rm, writeFile, mkdir, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../../..');
const reviewPath = path.join(repoRoot, 'design-screenshots/sitecore-com/component-review.json');
const componentRoot = path.join(repoRoot, 'industry-verticals/sitecore-com/src/components/sitecore-com');
const renderingGenerator = path.join(
  repoRoot,
  '.cursor/skills/sitecore-serialization-skills/sitecore-new-rendering-yaml/scripts/Generate-SitecoreRendering.mjs'
);

function pascalCase(value) {
  return value.replace(/(^|[^a-zA-Z0-9])([a-zA-Z0-9])/g, (_, separator, letter) => letter.toUpperCase());
}

function kebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function fieldType(name) {
  const normalized = name.toLowerCase();
  if (/^(image|media|icon|logo)$/.test(normalized)) return 'Image';
  if (/(link|cta|action)$/.test(normalized) || normalized === 'primarylink' || normalized === 'secondarylink') {
    return 'General Link';
  }
  if (/(body|description|intro|answer|message|quicklinks|linkcolumns|legallinks|navigation|items|labels|links|toggles|filteroptions|sortoptions|customerlogos|options|bullets)$/.test(normalized)) {
    return 'Multi-Line Text';
  }
  return 'Single-Line Text';
}

function collectComponents(review) {
  const components = [];
  for (const section of review.components) {
    const allowedComponents = (section.children ?? []).map((child) => child.cmsName);
    if (section.cmsName === 'Header' && (section.placeholders ?? []).includes('site-navigation')) {
      allowedComponents.push('Navigation');
    }
    components.push({
      cmsName: section.cmsName,
      fields: section.fields ?? [],
      placeholders: section.placeholders ?? [],
      allowedComponents,
    });
    for (const child of section.children ?? []) {
      components.push({ cmsName: child.cmsName, fields: child.fields ?? [], parent: section.cmsName });
    }
  }
  return [...new Map(components.map((component) => [component.cmsName, component])).values()];
}

function makeComponentSource(component) {
  const placeholders = component.placeholders ?? [];
  const fields = component.fields.map((field) => ({
    name: pascalCase(field),
    type: fieldType(field),
  }));
  const sdkImports = new Set();
  const sdkTypes = new Set();
  for (const field of fields) {
    if (field.type === 'Image') {
      sdkImports.add('Image as SitecoreImage');
      sdkTypes.add('ImageField');
    } else if (field.type === 'General Link') {
      sdkImports.add('Link as SitecoreLink');
      sdkTypes.add('LinkField');
    } else {
      sdkImports.add('Text');
      sdkTypes.add('TextField');
    }
  }
  if (placeholders.length) sdkImports.add('Placeholder');

  const fieldDeclarations = fields.map((field) => `  ${field.name}?: ${field.type === 'Image' ? 'ImageField' : field.type === 'General Link' ? 'LinkField' : 'TextField'};`);
  const bodyFields = fields.filter((field) => !['Image', 'General Link'].includes(field.type));
  const mediaFields = fields.filter((field) => field.type === 'Image');
  const linkFields = fields.filter((field) => field.type === 'General Link');
  const fieldMarkup = bodyFields.map((field, index) => {
    const isTitle = /title/i.test(field.name);
    const isPageTitle = /HeroBanner|ProductHero|CustomerStoryListing/.test(component.cmsName);
    const tag = isTitle ? (component.parent ? 'h3' : isPageTitle ? 'h1' : 'h2') : 'p';
    return `        {fields.${field.name} && <Text tag="${tag}" field={fields.${field.name}} className="scx-field scx-field--${kebabCase(field.name)}" />}`;
  });
  const mediaMarkup = mediaFields.map((field) => `        {fields.${field.name} && <SitecoreImage field={fields.${field.name}} className="scx-media scx-media--${kebabCase(field.name)}" />}`);
  const linkMarkup = linkFields.map((field) => `        {fields.${field.name}?.value?.href && <SitecoreLink field={fields.${field.name}} className="scx-link scx-link--${kebabCase(field.name)}" />}`);
  const hasPlaceholder = placeholders.length > 0;
  const isCookie = component.cmsName === 'CookieBanner';
  const isCarousel = /Carousel|LogoRail/.test(component.cmsName);
  const isListing = component.cmsName === 'CustomerStoryListing';
  const client = isCookie || isCarousel || isListing;
  const hookImports = [];
  if (isCookie) hookImports.push('useState');
  if (isCarousel) hookImports.push('useRef');
  if (isListing) hookImports.push('useEffect', 'useState');
  const hookLine = hookImports.length ? `import { ${hookImports.join(', ')} } from 'react';\n` : '';
  const clientDirective = client ? "'use client';\n\n" : '';
  const sdkImportLine = sdkImports.size
    ? `import { ${[...sdkImports].sort().join(', ')} } from '@sitecore-content-sdk/nextjs';\n`
    : '';
  const typeImportLine = sdkTypes.size
    ? `import type { ${[...sdkTypes].sort().join(', ')} } from '@sitecore-content-sdk/nextjs';\n`
    : '';
  const placeholderMarkup = hasPlaceholder
    ? `        <div className="scx-items ${isCarousel ? 'scx-items--carousel' : ''}"${isCarousel ? ' ref={itemsRef}' : ''}>\n          <Placeholder name={placeholderName} rendering={props.rendering} />\n        </div>`
    : '';
  const carouselMarkup = isCarousel
    ? `\n      <div className="scx-controls" aria-label="Carousel controls">\n        <button type="button" onClick={() => itemsRef.current?.scrollBy({ left: -360, behavior: 'smooth' })}>Previous</button>\n        <button type="button" onClick={() => itemsRef.current?.scrollBy({ left: 360, behavior: 'smooth' })}>Next</button>\n      </div>`
    : '';
  const cookieMarkup = isCookie
    ? `\n      {!dismissed && <div className="scx-cookie-actions"><button type="button" onClick={() => setDismissed(true)}>Reject optional</button><button type="button" onClick={() => setDismissed(true)}>Accept all</button></div>}`
    : '';
  const listingMarkup = isListing
    ? `\n      <input className="scx-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search customer stories" placeholder={String(fields.SearchPlaceholder?.value ?? 'Search stories')} />`
    : '';
  const listingEffect = isListing
    ? `\n  useEffect(() => {\n    const root = document.getElementById(componentKey);\n    root?.querySelectorAll<HTMLElement>('[data-customer-story-card]').forEach((card) => {\n      card.hidden = !card.textContent?.toLowerCase().includes(query.toLowerCase());\n    });\n  }, [componentKey, query]);\n`
    : '';
  const stateLines = [
    ...(isCookie ? ['  const [dismissed, setDismissed] = useState(false);'] : []),
    ...(isCarousel ? ['  const itemsRef = useRef<HTMLDivElement>(null);'] : []),
    ...(isListing ? ['  const [query, setQuery] = useState(\'\');'] : []),
  ].join('\n');
  const placeholderLine = hasPlaceholder
    ? `  const placeholderName = \`${placeholders[0]}-\${props.params.DynamicPlaceholderId ?? ''}\`;\n`
    : '';
  const fieldInterface = fields.length
    ? `export interface ${component.cmsName}Fields {\n${fieldDeclarations.join('\n')}\n}\n\n`
    : `export interface ${component.cmsName}Fields {}\n\n`;
  const fieldTypeName = `${component.cmsName}Fields`;
  const fieldDestructure = fields.length ? 'params, fields = {}, rendering' : 'params, rendering';
  const rootTag = component.parent ? 'article' : component.cmsName === 'Header' ? 'div' : component.cmsName === 'Navigation' ? 'nav' : component.cmsName === 'Footer' ? 'footer' : 'section';
  const ariaLabel = component.cmsName === 'Navigation' ? ' aria-label="Primary navigation"' : '';
  const dataAttributes = component.cmsName === 'CustomerStoryListingCard' ? ' data-customer-story-card' : '';
  const childrenMarkup = [
    ...fieldMarkup,
    ...mediaMarkup,
    ...linkMarkup,
    ...(listingMarkup ? [listingMarkup.trimStart()] : []),
    ...(placeholderMarkup ? [placeholderMarkup] : []),
  ].join('\n');

  return `${clientDirective}import type { JSX } from 'react';\n${hookLine}${sdkImportLine}${typeImportLine}import { ComponentProps } from 'lib/component-props';\n\n${fieldInterface}type Props = ComponentProps & { fields?: ${fieldTypeName} };\n\nexport const Default = (props: Props): JSX.Element => {\n  const { ${fieldDestructure} } = props;\n  const componentKey = params.RenderingIdentifier ?? rendering?.uid ?? '${kebabCase(component.cmsName)}';\n${stateLines}\n${placeholderLine}${listingEffect}\n  return (\n    <${rootTag} id={componentKey} key={componentKey} className={\`scx-block scx-${kebabCase(component.cmsName)} \${params.styles ?? ''}\`.trim()}${ariaLabel}${dataAttributes}>\n      <div className="scx-inner">\n${childrenMarkup}\n${carouselMarkup}${cookieMarkup}\n      </div>\n    </${rootTag}>\n  );\n};\n\nexport const Animated = (props: Props): JSX.Element => (\n  <div className="scx-animated"><Default {...props} /></div>\n);\n\nexport default Default;\n`;
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Command failed: ${command} ${args.join(' ')}`);
}

async function writePlaceholderArtifacts(components) {
  const itemsRoot = path.join(repoRoot, 'authoring/items/sitecore-com/serialized-content');
  const rootPath = '/sitecore/layout/Placeholder Settings/Project/sitecore-com';
  const rootYaml = await readFile(path.join(itemsRoot, 'placeholder-settings/sitecore-com.yml'), 'utf8');
  const rootId = rootYaml.match(/^ID: "([^"]+)"/m)?.[1];
  if (!rootId) throw new Error('Could not find project placeholder-settings root ID.');

  for (const component of components.filter((entry) => entry.placeholders?.length)) {
    const key = component.placeholders[0];
    const label = key.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
    const placeholderPath = path.join(itemsRoot, 'placeholder-settings/sitecore-com', `${label}.yml`);
    const renderingPath = path.join(itemsRoot, 'renderings/sitecore-com', `${component.cmsName}.yml`);
    const renderingYaml = await readFile(renderingPath, 'utf8');
    const renderingId = renderingYaml.match(/^ID: "([^"]+)"/m)?.[1];
    if (!renderingId) throw new Error(`Could not find rendering ID for ${component.cmsName}.`);

    let placeholderYaml;
    try {
      placeholderYaml = await readFile(placeholderPath, 'utf8');
    } catch {
      const controls = await Promise.all(component.allowedComponents.map(async (name) => {
        const childYaml = await readFile(path.join(itemsRoot, 'renderings/sitecore-com', `${name}.yml`), 'utf8');
        const childId = childYaml.match(/^ID: "([^"]+)"/m)?.[1];
        if (!childId) throw new Error(`Could not find child rendering ID for ${name}.`);
        return `    {${childId.toUpperCase()}}`;
      }));
      placeholderYaml = `---\nID: "${randomUUID()}"\nParent: "${rootId}"\nTemplate: "5c547d4e-7111-4995-95b0-6b561751bf2e"\nPath: "${rootPath}/${label}"\nSharedFields:\n- ID: "7256bdab-1fd2-49dd-b205-cb4873d2917c"\n  Hint: Placeholder Key\n  Value: "${key}-{*}"\n- ID: "e391b526-d0c5-439d-803e-17512eae6222"\n  Hint: Allowed Controls\n  Value: |\n${controls.join('\n')}\nLanguages:\n- Language: en\n  Versions:\n  - Version: 1\n    Fields: []\n`;
      await mkdir(path.dirname(placeholderPath), { recursive: true });
      await writeFile(placeholderPath, placeholderYaml);
    }

    const placeholderId = placeholderYaml.match(/^ID: "([^"]+)"/m)?.[1];
    if (!placeholderId) throw new Error(`Could not find placeholder-setting ID for ${key}.`);
    if (!renderingYaml.includes('Hint: Placeholders')) {
      const reference = `- ID: "069a8361-b1cd-437c-8c32-a3be78941446"\n  Hint: Placeholders\n  Value: |\n    {${placeholderId.toUpperCase()}}\n`;
      await writeFile(renderingPath, renderingYaml.replace('SharedFields:\n', `SharedFields:\n${reference}`));
    }
  }
}

const review = JSON.parse(await readFile(reviewPath, 'utf8'));
const components = collectComponents(review);
const tempDir = await mkdtemp(path.join(os.tmpdir(), 'sitecore-com-fields-'));

try {
  await mkdir(componentRoot, { recursive: true });
  for (const component of components) {
    const fields = component.fields.map((field, index) => ({
      name: pascalCase(field),
      title: field.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()),
      type: fieldType(field),
      sort: (index + 1) * 100,
    }));
    const fieldsPath = path.join(tempDir, `${component.cmsName}.json`);
    await writeFile(fieldsPath, JSON.stringify({ fields }, null, 2));
    await writeFile(path.join(componentRoot, `${component.cmsName}.tsx`), makeComponentSource(component));
    const renderingPath = path.join(
      repoRoot,
      'authoring/items/sitecore-com/serialized-content/renderings/sitecore-com',
      `${component.cmsName}.yml`
    );
    try {
      await access(renderingPath);
      console.log(`Skipping existing rendering YAML: ${component.cmsName}`);
    } catch {
      run(process.execPath, [renderingGenerator, component.cmsName, '--collection', 'sitecore-com', '--fields', fieldsPath], repoRoot);
    }
  }
  await writePlaceholderArtifacts(components);
  run('npm', ['--prefix', 'industry-verticals/sitecore-com', 'run', 'sitecore-tools:generate-map'], repoRoot);
  console.log(`Generated ${components.length} rendering components and field templates.`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}