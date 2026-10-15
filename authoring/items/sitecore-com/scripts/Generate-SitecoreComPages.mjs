#!/usr/bin/env node
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../../..');
const itemsRoot = path.join(repoRoot, 'authoring/items/sitecore-com/serialized-content');
const siteRoot = path.join(itemsRoot, 'sitecore-com/sitecore-com');
const projectName = 'sitecore-com';
const sitePath = '/sitecore/content/sitecore-com/sitecore-com';
const review = JSON.parse(await readFile(path.join(repoRoot, 'design-screenshots/sitecore-com/component-review.json'), 'utf8'));
const tree = JSON.parse(await readFile(path.join(repoRoot, 'design-screenshots/sitecore-com/site-content-tree.json'), 'utf8'));
const media = JSON.parse(await readFile(path.join(repoRoot, 'design-screenshots/sitecore-com/media-mapping.json'), 'utf8'));
const reviewByName = new Map(review.components.map((component) => [component.cmsName, component]));
const homePath = path.join(siteRoot, 'Home.yml');
const homeYaml = await readFile(homePath, 'utf8');
const homeId = homeYaml.match(/^ID: "([^"]+)"/m)?.[1];
const siteId = homeYaml.match(/^Parent: "([^"]+)"/m)?.[1];
const pageTemplateId = homeYaml.match(/^Template: "([^"]+)"/m)?.[1];
if (!homeId || !siteId || !pageTemplateId) throw new Error('Could not read Home item identity fields.');

const globalChrome = [
  { name: 'CookieBanner', fields: { Message: 'We use cookies to improve your experience.', PrivacyLink: { href: '/legal/privacy-policy', text: 'Privacy policy' }, SaveLabel: 'Save preferences', AcceptLabel: 'Accept all', RejectLabel: 'Reject optional', PreferenceToggles: 'Analytics\nPersonalization\nAdvertising' } },
  { name: 'TopBar', fields: { Announcement: 'Meet the AI-powered digital experience platform built for modern marketing teams.', Link: { href: '/platform', text: 'Explore the platform' } } },
  {
    name: 'Header',
    fields: { Logo: 'Sitecore', SearchAction: { href: '/search', text: 'Search' }, LocaleSelector: 'Global', AppLauncher: 'Products', DemoLink: { href: '/request-a-demo', text: 'Request a demo' } },
    children: { name: 'Navigation', items: [{ fields: { Items: 'Platform\nSolutions\nPartners\nResources\nCompany', Labels: 'Platform\nSolutions\nPartners\nResources\nCompany', Links: { href: '/platform', text: 'Explore' } } }] },
  },
  { name: 'Footer', fields: { ClosingTitle: 'Own the moments that matter.', ClosingBody: 'Build connected digital experiences with SitecoreAI.', PrimaryCta: { href: '/request-a-demo', text: 'Request a demo' }, SecondaryCta: { href: '/platform', text: 'Explore the platform' }, QuickLinks: 'Products\nSolutions\nResources\nCompany', LinkColumns: 'Platform\nSolutions\nPartners\nResources\nCompany', LegalLinks: 'Privacy\nTerms\nCookie preferences', Copyright: 'Copyright Sitecore' } },
];

const card = (fields) => ({ fields });
const group = (name, fields, childName, children) => ({ name, fields, children: { name: childName, items: children.map(card) } });

const homeContent = [
  { name: 'HeroBanner', fields: { Eyebrow: 'SitecoreAI', Title: 'Turn every customer moment into a growth moment', Body: 'The digital experience platform that connects content, data, and AI to help teams create experiences people choose.', PrimaryLink: { href: '/request-a-demo', text: 'Request a demo' }, SecondaryLink: { href: '/platform', text: 'Explore the platform' }, BackgroundStyle: 'light' } },
  group('ProductCapabilityCarousel', { Title: 'One platform. Every digital experience.' }, 'ProductCapabilityCard', [
    { Icon: 'AI search icon', Eyebrow: 'Discover', Title: 'AI Search', Description: 'Help your brand show up when customers ask AI for answers.', Link: { href: '/platform/ai-search', text: 'Explore AI Search' } },
    { Icon: 'agents', Eyebrow: 'Orchestrate', Title: 'AI and agents', Description: 'Bring brand-aware AI into the work your teams do every day.', Link: { href: '/platform/ai-and-agents', text: 'Explore AI and agents' } },
    { Icon: 'content management', Eyebrow: 'Create', Title: 'Content management', Description: 'Create and deliver content experiences from one flexible platform.', Link: { href: '/platform/content-management-system', text: 'Explore content management' } },
  ]),
  group('AwardsLogoRail', {}, 'AwardLogoItem', [
    { Image: 'G2 Fall 2026', AltText: 'G2 award badge', Link: { href: '/company/newsroom', text: 'Award details' } },
    { Image: 'CMS Critic Awards', AltText: 'CMS Critic award badge', Link: { href: '/company/newsroom', text: 'Award details' } },
    { Image: 'TrustRadius', AltText: 'TrustRadius award badge', Link: { href: '/company/newsroom', text: 'Award details' } },
    { Image: 'G2 Fall 2026', AltText: 'G2 award badge', Link: { href: '/company/newsroom', text: 'Award details' } },
    { Image: 'CMS Critic Awards', AltText: 'CMS Critic award badge', Link: { href: '/company/newsroom', text: 'Award details' } },
    { Image: 'TrustRadius', AltText: 'TrustRadius award badge', Link: { href: '/company/newsroom', text: 'Award details' } },
  ]),
  { name: 'AiSearchFeatureBlock', fields: { Title: 'AI is deciding who gets discovered.', Body: 'Make your brand easier to find, understand, and trust across the new landscape of AI answers.', Image: 'AI Search', VideoLink: { href: '/platform/ai-search', text: 'Watch the overview' }, Cta: { href: '/platform/ai-search', text: 'Discover AI Search' } } },
  group('ValuePropositionGrid', { Eyebrow: 'Built for teams', Title: 'A better way to move from idea to impact', Intro: 'Bring your people, technology, and content together.' }, 'ValuePropositionCard', [
    { Eyebrow: 'Connect', Title: 'One connected platform', Description: 'Bring customer data and content workflows into one operating model.' },
    { Eyebrow: 'Accelerate', Title: 'Move at the speed of change', Description: 'Give teams flexible tools to launch, learn, and improve faster.' },
    { Eyebrow: 'Grow', Title: 'Make every experience count', Description: 'Turn relevant experiences into stronger customer relationships.' },
  ]),
  group('EventCarousel', { Eyebrow: 'Join the conversation', Title: 'Meet us where ideas move forward', Intro: 'Explore upcoming events, webinars, and community sessions.', ViewAllLink: { href: '/resources/events-webinars', text: 'View all events' } }, 'EventCard', [
    { Image: 'event', Date: 'October 2026', Title: 'Sitecore Symposium', Description: 'A global gathering for digital experience leaders.', Link: { href: '/resources/events-webinars', text: 'Learn more' } },
    { Image: 'webinar', Date: 'November 2026', Title: 'The future of AI discovery', Description: 'A practical conversation about visibility in AI answers.', Link: { href: '/resources/events-webinars', text: 'Register' } },
    { Image: 'experience', Date: 'On demand', Title: 'Build better digital experiences', Description: 'Watch a session on connected content operations.', Link: { href: '/resources/events-webinars', text: 'Watch now' } },
  ]),
  group('CustomerStoryShowcase', { Eyebrow: 'Customer stories', Title: 'Ideas in action', Intro: 'See how ambitious teams bring their digital experiences to life.', FeaturedStory: 'Featured customer story', CustomerLogos: 'Trusted by experience makers', ViewAllLink: { href: '/solutions/customers', text: 'See all customers' } }, 'CustomerStoryItem', [
    { Title: 'A more connected customer journey', Customer: 'Global retail brand', Image: 'retail customer', VideoLink: { href: '/solutions/customers', text: 'Watch the story' }, Link: { href: '/solutions/customers', text: 'Read the story' } },
    { Title: 'Building experiences at global scale', Customer: 'International travel brand', Image: 'travel customer', VideoLink: { href: '/solutions/customers', text: 'Watch the story' }, Link: { href: '/solutions/customers', text: 'Read the story' } },
    { Title: 'Making content work harder', Customer: 'Enterprise technology brand', Image: 'customer', VideoLink: { href: '/solutions/customers', text: 'Watch the story' }, Link: { href: '/solutions/customers', text: 'Read the story' } },
  ]),
  group('AnalystReportList', { Eyebrow: 'Industry perspective', Title: 'Independent insight for what comes next', Intro: 'Explore research and guidance from leading analysts.', ViewAllLink: { href: '/solutions/analyst-reports', text: 'View all reports' } }, 'AnalystReportItem', [
    { Title: 'The 2026 Gartner Magic Quadrant for Content Marketing Platforms', DownloadLink: { href: '/solutions/analyst-reports', text: 'Access the report' }, LinkLabel: 'Read the report' },
    { Title: 'The Forrester Wave: Digital Experience Platforms', DownloadLink: { href: '/solutions/analyst-reports', text: 'Access the report' }, LinkLabel: 'Read the report' },
  ]),
  { name: 'VisibilityCta', fields: { Title: 'Be the brand customers discover.', Body: 'Make your next digital experience easier to find and built to perform.', Cta: { href: '/request-a-demo', text: 'Get your AI visibility snapshot' } } },
];

const productFacts = {
  '/platform': { label: 'SitecoreAI platform', title: 'Turn every digital experience into a driver of growth', body: 'A unified platform for content, data, and AI helps teams deliver connected customer experiences.' },
  '/platform/ai-and-agents': { label: 'AI and agents', title: 'AI and agents that understand your brand', body: 'Create a trusted foundation for brand-aware AI experiences and workflows.' },
  '/platform/ai-search': { label: 'AI Search', title: 'Show up when AI answers', body: 'Understand and improve how your brand appears across AI-powered discovery.' },
  '/platform/content-management-system': { label: 'Content management system', title: 'Create content at the speed of your ideas', body: 'Manage content and experiences with the flexibility to support every team and channel.' },
  '/platform/digital-asset-management': { label: 'Digital asset management', title: 'Make every approved asset work harder', body: 'Keep brand assets organized, approved, and ready to deliver across every experience.' },
};

function productContent(routePath) {
  const fact = productFacts[routePath];
  const pageSlug = tree.pages.find((page) => page.routePath === routePath)?.captureSlug ?? 'sitecore-com--platform';
  return [
    { name: 'ProductHero', fields: { ProductLabel: fact.label, Title: fact.title, Body: fact.body, Media: 'platform', PrimaryLink: { href: '/request-a-demo', text: 'Request a demo' }, SecondaryLink: { href: '/platform', text: 'Explore the platform' } } },
    group('CustomerLogoRail', {}, 'CustomerLogoItem', Array.from({ length: 6 }, (_, index) => ({ Image: `customer ${index + 1}`, AltText: `Sitecore customer ${index + 1}`, Link: { href: '/solutions/customers', text: 'Customer story' } }))),
    group('MetricStatGrid', { Title: 'Experience that makes a measurable difference' }, 'MetricStatItem', [
      { Value: '2x', Label: 'faster content delivery', Customer: 'Customer result', Industry: 'Global' },
      { Value: '40%', Label: 'more efficient workflows', Customer: 'Customer result', Industry: 'Enterprise' },
      { Value: '3x', Label: 'more experiences launched', Customer: 'Customer result', Industry: 'Digital' },
      { Value: '1', Label: 'connected platform', Customer: 'SitecoreAI', Industry: 'Unified' },
    ]),
    { name: 'ProductFeatureSection', fields: { Eyebrow: 'A connected foundation', Title: 'The tools to create, manage, and optimize', Body: fact.body, Image: 'product experience', Bullets: 'Work with the tools your teams already use.\nManage the full content lifecycle.\nLearn from every customer interaction.', Cta: { href: '/request-a-demo', text: 'Talk to an expert' }, LayoutVariant: 'image-right' } },
    group('ProductCapabilityTabs', { Eyebrow: 'Explore the capabilities', Title: 'One platform for every experience', Intro: 'Bring each part of your digital operation into focus.' }, 'ProductCapabilityTab', [
      { Label: 'Create', Title: 'Create with confidence', Body: 'Give content teams flexible tools to plan and publish.', Image: 'create content', Bullets: 'Reusable content\nTeam workflows\nConnected channels', Link: { href: '/request-a-demo', text: 'Learn more' } },
      { Label: 'Manage', Title: 'Keep work in motion', Body: 'Organize assets, content, and approvals across teams.', Image: 'manage content', Bullets: 'Clear governance\nShared assets\nFaster approvals', Link: { href: '/request-a-demo', text: 'Learn more' } },
      { Label: 'Optimize', Title: 'Improve every journey', Body: 'Use data and insight to make experiences more relevant.', Image: 'optimize experience', Bullets: 'Audience insight\nExperimentation\nAI discovery', Link: { href: '/request-a-demo', text: 'Learn more' } },
    ]),
    group('IncludedFeatureGrid', { Title: 'Everything teams need to move forward', Intro: 'Start with the essentials and extend as your needs grow.' }, 'IncludedFeatureItem', [
      { Title: 'Content workflows', Description: 'Plan, create, approve, and publish content.' , Icon: 'workflow'},
      { Title: 'Personalization', Description: 'Deliver relevant experiences to every audience.', Icon: 'personalization' },
      { Title: 'Digital assets', Description: 'Keep approved assets easy to find and reuse.', Icon: 'assets' },
      { Title: 'Analytics', Description: 'Understand what works across the journey.', Icon: 'analytics' },
      { Title: 'AI assistance', Description: 'Help teams work faster with brand-aware tools.', Icon: 'AI' },
      { Title: 'Integrations', Description: 'Connect the systems behind your experiences.', Icon: 'integrations' },
    ]),
    group('ProductCardGrid', { Title: 'Explore more from Sitecore', ViewAllLink: { href: '/platform', text: 'Explore all products' } }, 'ProductContentCard', [
      { Image: 'content management', Eyebrow: 'Create', Title: 'Content management', Description: 'Plan and publish content across every channel.', Link: { href: '/platform/content-management-system', text: 'Explore content management' } },
      { Image: 'AI Search', Eyebrow: 'Discover', Title: 'AI Search', Description: 'Improve your brand visibility in AI discovery.', Link: { href: '/platform/ai-search', text: 'Explore AI Search' } },
      { Image: 'digital asset management', Eyebrow: 'Manage', Title: 'Digital Asset Management', Description: 'Keep every approved asset ready for use.', Link: { href: '/platform/digital-asset-management', text: 'Explore DAM' } },
    ]),
    group('CustomerStoryCarousel', { Title: 'Customer stories', Intro: 'See what teams are building with Sitecore.', ViewAllLink: { href: '/solutions/customers', text: 'See all customers' } }, 'CustomerStoryCard', [
      { Image: 'customer story 1', Industry: 'Retail', Title: 'Connected commerce experiences', Description: 'A global brand brought its digital journey together.', Link: { href: '/solutions/customers', text: 'Read the story' } },
      { Image: 'customer story 2', Industry: 'Travel', Title: 'Content at global scale', Description: 'A travel team made campaigns easier to manage.', Link: { href: '/solutions/customers', text: 'Read the story' } },
      { Image: 'customer story 3', Industry: 'Technology', Title: 'A stronger digital foundation', Description: 'A technology leader improved its content operations.', Link: { href: '/solutions/customers', text: 'Read the story' } },
    ]),
    group('FaqAccordion', { Title: 'Frequently asked questions' }, 'FaqItem', [
      { Question: 'What is SitecoreAI?', Answer: 'SitecoreAI connects content, experience, and AI capabilities for digital teams.' },
      { Question: 'Who is the platform for?', Answer: 'The platform supports marketing, content, and digital experience teams.' },
      { Question: 'Can Sitecore integrate with our tools?', Answer: 'Sitecore is designed to connect with the systems and channels your teams use.' },
    ]),
    { name: 'ConversionCtaBand', fields: { Title: 'Ready to create your next great experience?', Body: 'Talk with our team about your goals.', Cta: { href: '/request-a-demo', text: 'Request a demo' } } },
  ];
}

const contentByRoute = new Map([
  ['/', homeContent],
  ...Object.keys(productFacts).map((route) => [route, productContent(route)]),
]);

function guidFromYaml(yaml) {
  const value = yaml.match(/^ID: "([^"]+)"/m)?.[1];
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value
    : undefined;
}

async function idFromFile(filePath) {
  const yaml = await readFile(filePath, 'utf8');
  const id = guidFromYaml(yaml);
  if (!id) throw new Error(`No ID found in ${filePath}`);
  return { id, yaml };
}

function valueType(fieldName) {
  const lower = fieldName.toLowerCase();
  if (/^(image|media|icon|logo)$/.test(lower)) return 'Image';
  if (/(link|cta|action)$/.test(lower) || lower === 'primarylink' || lower === 'secondarylink') return 'General Link';
  return 'Text';
}

function xmlEscape(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const mediaByPage = new Map();
for (const asset of media) {
  for (const slug of asset.pages ?? []) {
    const list = mediaByPage.get(slug) ?? [];
    list.push(asset);
    mediaByPage.set(slug, list);
  }
}
const imageCursor = new Map();
function imageFor(pageSlug, hint = '') {
  const candidates = mediaByPage.get(pageSlug) ?? media;
  const normalizedHint = String(hint).toLowerCase();
  const match = candidates.find((asset) => normalizedHint && String(asset.alt).toLowerCase().includes(normalizedHint));
  if (match?.mediaId) return match;
  const index = imageCursor.get(pageSlug) ?? 0;
  imageCursor.set(pageSlug, index + 1);
  return candidates[index % candidates.length] ?? media[0];
}

const pageRows = [...tree.pages];
const knownSitePaths = new Set(pageRows.map((page) => page.sitecorePath));
for (const page of tree.pages) {
  const siteSegments = page.sitecorePath.startsWith(`${sitePath}/Home/`)
    ? page.sitecorePath.slice(`${sitePath}/Home/`.length).split('/').filter(Boolean)
    : [];
  const routeSegments = page.routePath.split('/').filter(Boolean);
  for (let index = 1; index < siteSegments.length; index += 1) {
    const ancestorPath = `${sitePath}/Home/${siteSegments.slice(0, index).join('/')}`;
    if (knownSitePaths.has(ancestorPath)) continue;
    const ancestorRoute = `/${routeSegments.slice(0, index).join('/')}`;
    const itemName = siteSegments[index - 1];
    pageRows.push({
      routePath: ancestorRoute,
      sitecorePath: ancestorPath,
      sitecoreSegments: siteSegments.slice(0, index),
      parentSegments: siteSegments.slice(0, index - 1),
      itemName,
      title: itemName,
      navigationTitle: itemName,
      yamlRelativePath: `Home/${siteSegments.slice(0, index).join('/')}.yml`,
      captureSlug: null,
      status: 'stub',
    });
    knownSitePaths.add(ancestorPath);
  }
}
const pageIds = new Map();
const pageYamlByRoute = new Map();
for (const page of pageRows) {
  if (page.routePath === '/') {
    pageIds.set(page.routePath, homeId);
    pageYamlByRoute.set(page.routePath, { ...page, id: homeId, filePath: homePath });
    continue;
  }
  const filePath = path.join(siteRoot, ...page.yamlRelativePath.split('/'));
  let id;
  try {
    id = guidFromYaml(await readFile(filePath, 'utf8')) ?? randomUUID();
  } catch {
    id = randomUUID();
  }
  pageIds.set(page.routePath, id);
  pageYamlByRoute.set(page.routePath, { ...page, id, filePath });
}

const componentFolders = new Map();
async function ensureComponentFolder(componentName) {
  if (componentFolders.has(componentName)) return componentFolders.get(componentName);
  const folderName = `${componentName}s`;
  const folderTemplatePath = path.join(itemsRoot, `templates/sitecore-com/${componentName} Templates/${componentName} Folder.yml`);
  const { id: templateId } = await idFromFile(folderTemplatePath);
  const folderFile = path.join(siteRoot, 'Data', `${folderName}.yml`);
  let folderId;
  try {
    folderId = guidFromYaml(await readFile(folderFile, 'utf8'));
  } catch {}
  if (!folderId) {
    folderId = randomUUID();
    await mkdir(path.dirname(folderFile), { recursive: true });
    await writeFile(folderFile, `---\nID: "${folderId}"\nParent: "4e48aa65-3f69-4842-9a99-9ef09d0afaaf"\nTemplate: "${templateId}"\nPath: "${sitePath}/Data/${folderName}"\nLanguages:\n- Language: en\n  Versions:\n  - Version: 1\n`);
  }
  const result = { folderId, folderName };
  componentFolders.set(componentName, result);
  return result;
}

const dataCache = new Map();
async function createDatasource(componentName, pageSlug, instanceName, fields) {
  const cacheKey = `${componentName}:${instanceName}`;
  if (dataCache.has(cacheKey)) return dataCache.get(cacheKey);
  const { folderId, folderName } = await ensureComponentFolder(componentName);
  const templatePath = path.join(itemsRoot, `templates/sitecore-com/${componentName} Templates/${componentName}.yml`);
  const { id: templateId } = await idFromFile(templatePath);
  const dataItemPath = path.join(siteRoot, 'Data', folderName, `${instanceName}.yml`);
  let dataId;
  try {
    dataId = guidFromYaml(await readFile(dataItemPath, 'utf8'));
  } catch {}
  dataId ??= randomUUID();
  const fieldLines = [];
  for (const [fieldName, rawValue] of Object.entries(fields ?? {})) {
    if (rawValue === undefined || rawValue === null) continue;
    const fieldFile = path.join(itemsRoot, `templates/sitecore-com/${componentName} Templates/${componentName}/Data/${fieldName}.yml`);
    let fieldId;
    try {
      fieldId = guidFromYaml(await readFile(fieldFile, 'utf8'));
    } catch {}
    if (!fieldId) continue;
    const type = valueType(fieldName);
    if (type === 'Image') {
      const asset = imageFor(pageSlug, rawValue);
      if (!asset?.mediaId) continue;
      fieldLines.push(`    - ID: "${fieldId}"\n      Hint: ${fieldName}\n      Value: |\n        <image mediaid="${asset.mediaId}" />`);
    } else if (type === 'General Link') {
      const link = typeof rawValue === 'string' ? { href: rawValue, text: fieldName } : rawValue;
      const internal = !/^https?:\/\//i.test(link.href);
      const targetId = internal ? pageIds.get(link.href) ?? homeId : '';
      const linkType = internal ? 'internal' : 'external';
      const linkXml = `<link class="" querystring="" id="${internal ? `{${targetId.toUpperCase()}}` : ''}" anchor="" target="" title="" linktype="${linkType}" text="${xmlEscape(link.text ?? '')}" url="${xmlEscape(link.href)}" />`;
      fieldLines.push(`    - ID: "${fieldId}"\n      Hint: ${fieldName}\n      Value: |\n        ${linkXml}`);
    } else {
      fieldLines.push(`    - ID: "${fieldId}"\n      Hint: ${fieldName}\n      Value: ${JSON.stringify(String(rawValue))}`);
    }
  }
  const yaml = `---\nID: "${dataId}"\nParent: "${folderId}"\nTemplate: "${templateId}"\nPath: "${sitePath}/Data/${folderName}/${instanceName}"\nLanguages:\n- Language: en\n  Versions:\n  - Version: 1\n    Fields:\n${fieldLines.length ? fieldLines.join('\n') : '    []'}\n`;
  await mkdir(path.dirname(dataItemPath), { recursive: true });
  await writeFile(dataItemPath, yaml);
  dataCache.set(cacheKey, dataId);
  return dataId;
}

const renderingIds = new Map();
for (const file of await (await import('node:fs/promises')).readdir(path.join(itemsRoot, 'renderings/sitecore-com'))) {
  if (!file.endsWith('.yml')) continue;
  const { id } = await idFromFile(path.join(itemsRoot, 'renderings/sitecore-com', file));
  renderingIds.set(file.slice(0, -4), id);
}

function pageSlug(page) {
  return page.captureSlug ?? (page.routePath.replace(/^\//, '').replaceAll('/', '-') || 'home');
}

async function buildRenderings(page, content) {
  const instances = [];
  const lastByPlaceholder = new Map();
  let dynamicPlaceholderId = 0;
  const addNode = async (node, placeholder) => {
    const component = reviewByName.get(node.name);
    const placeholderKey = component?.placeholders?.[0];
    const dynamicId = placeholderKey ? ++dynamicPlaceholderId : null;
    const isGlobal = placeholder === 'headless-header' || placeholder === 'headless-footer' || placeholder.startsWith('/headless-header/');
    const sourceSlug = isGlobal ? 'sitecore-com--home' : pageSlug(page);
    const instanceName = (isGlobal ? `global-${node.name}` : `${pageSlug(page)}-${node.name}-${instances.length + 1}`).toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    const datasourceId = Object.keys(node.fields ?? {}).length
      ? await createDatasource(node.name, sourceSlug, instanceName, node.fields)
      : null;
    const renderingId = renderingIds.get(node.name);
    if (!renderingId) throw new Error(`No rendering item found for ${node.name}.`);
    const uid = randomUUID().toUpperCase();
    const previous = lastByPlaceholder.get(placeholder);
    const position = previous ? `p:after="r[@uid='{${previous}}']"` : placeholder.startsWith('/') ? 'p:after="*[1=2]"' : 'p:before="*"';
    const parameters = dynamicId ? `CSSStyles&amp;DynamicPlaceholderId=${dynamicId}` : 'CSSStyles';
    instances.push(`        <r uid="{${uid}}" ${position}${datasourceId ? ` s:ds="${datasourceId}"` : ''} s:id="{${renderingId.toUpperCase()}}" s:par="${parameters}" s:ph="${placeholder}" />`);
    lastByPlaceholder.set(placeholder, uid);
    if (node.children && placeholderKey) {
      const childPlaceholder = placeholder.startsWith('/')
        ? `${placeholder}/${placeholderKey}-${dynamicId}`
        : `/${placeholder}/${placeholderKey}-${dynamicId}`;
      for (const child of node.children.items) {
        await addNode({ name: node.children.name, fields: child.fields }, childPlaceholder);
      }
    }
  };

  for (const node of globalChrome.slice(0, 3)) await addNode(node, 'headless-header');
  for (const node of content ?? []) await addNode(node, 'headless-main');
  await addNode(globalChrome[3], 'headless-footer');
  return `<r xmlns:p="p" xmlns:s="s" p:p="1">\n  <d id="{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}" l="{96E5F4BA-A2CF-4A4C-A4E7-64DA88226362}">\n${instances.join('\n')}\n  </d>\n</r>`;
}

function setSharedField(yaml, fieldId, hint, value) {
  const sharedIndex = yaml.indexOf('SharedFields:\n');
  const languagesIndex = yaml.indexOf('Languages:\n');
  const fieldBlock = `- ID: "${fieldId}"\n  Hint: ${hint}\n  Value: |\n${value.split('\n').map((line) => `    ${line}`).join('\n')}\n`;
  if (sharedIndex < 0) {
    return `${yaml.slice(0, languagesIndex)}SharedFields:\n${fieldBlock}${yaml.slice(languagesIndex)}`;
  }
  const existingStart = yaml.indexOf(`- ID: "${fieldId}"`);
  if (existingStart >= 0 && existingStart < languagesIndex) {
    const lineStart = yaml.lastIndexOf('\n', existingStart - 1) + 1;
    let lineEnd = yaml.indexOf('\n- ID: "', existingStart + 1);
    if (lineEnd < 0 || lineEnd > languagesIndex) lineEnd = languagesIndex;
    return `${yaml.slice(0, lineStart)}${fieldBlock}${yaml.slice(lineEnd)}`;
  }
  return `${yaml.slice(0, sharedIndex + 'SharedFields:\n'.length)}${fieldBlock}${yaml.slice(sharedIndex + 'SharedFields:\n'.length)}`;
}

for (const page of pageRows) {
  const record = pageYamlByRoute.get(page.routePath);
  const parentSitecorePath = page.sitecorePath.slice(0, page.sitecorePath.lastIndexOf('/'));
  const parentPage = pageRows.find((candidate) => candidate.sitecorePath === parentSitecorePath);
  const parentId = page.routePath === '/' ? siteId : pageIds.get(parentPage?.routePath ?? '/') ?? homeId;
  const routeContent = contentByRoute.get(page.routePath) ?? [];
  const xml = await buildRenderings(page, routeContent);
  let yaml;
  if (page.routePath === '/') {
    yaml = homeYaml;
  } else {
    yaml = `---\nID: "${record.id}"\nParent: "${parentId}"\nTemplate: "${pageTemplateId}"\nPath: "${page.sitecorePath}"\nLanguages:\n- Language: en\n  Versions:\n  - Version: 1\n    Fields:\n    - ID: "d82d25e3-c013-4559-b671-f9fc616dc1f5"\n      Hint: Title\n      Value: ${JSON.stringify(page.title ?? page.itemName)}\n    - ID: "4e0720e9-9d50-4ddc-87cf-ecd65e8e94c8"\n      Hint: NavigationTitle\n      Value: ${JSON.stringify(page.navigationTitle ?? page.title ?? page.itemName)}\n`;
  }
  yaml = setSharedField(yaml, 'f1a1fe9e-a60c-4ddb-a3a0-bb5b29fe732e', '__Renderings', xml);
  await mkdir(path.dirname(record.filePath), { recursive: true });
  await writeFile(record.filePath, yaml);
}

console.log(`Wrote ${pageRows.length} Sitecore route items (${contentByRoute.size} fully captured pages).`);