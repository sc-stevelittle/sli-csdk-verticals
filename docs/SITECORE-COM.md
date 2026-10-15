# Sitecore.com

Sitecore.com is the B2B software marketing demo in this repository. It uses an isolated Sitecore collection and Content SDK host rather than an unrelated retail, healthcare, travel, or energy vertical.

| Setting | Value |
|---------|-------|
| Host folder | `industry-verticals/sitecore-com/` |
| Rendering host key | `sitecore-com` |
| Sitecore site | `/sitecore/content/sitecore-com/sitecore-com` |
| Serialization module | `sitecore-com-scs` |
| Industry guide | [industry-software](../.cursor/skills/industry-software/SKILL.md) |

The current mimic includes the home page, platform overview, AI and agents, AI Search, content management, and digital asset management. The `/solutions/customers` destination remains a stub; customer-story bands on the selected pages are retained. Other linked routes are stub items generated from captured navigation and footer links.

Reference screenshots, HTML, component review, and media mapping are under `design-screenshots/sitecore-com/`. Rendering components are in `industry-verticals/sitecore-com/src/components/sitecore-com/`; authored items and media YAML are in `authoring/items/sitecore-com/`.

Local preview requires Sitecore Deploy Developer settings in `industry-verticals/sitecore-com/.env.local`. Do not commit the Edge Context ID or editing secret. Serialization validation can run locally; push to SitecoreAI requires an authenticated Sitecore CLI connection, and the content must be published to Edge before the app can render Sitecore data.