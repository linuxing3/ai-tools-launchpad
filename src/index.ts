import { toolifyData } from "./toolify-data.ts";
import { heroImageDataUri } from "./hero-image.ts";

interface Env {}

type Locale = "en" | "zh";
type Theme = "dark" | "light";
type ProductItem = { readonly rank: number; readonly name: string; readonly description?: string; readonly icon?: string; readonly website?: string; readonly toolifyUrl?: string; readonly visits?: string };
type CategoryItem = { readonly rank: number; readonly name: string; readonly description?: string; readonly url?: string; readonly signals?: string };

const html = String.raw;
const host = "https://tools.efwmcstyle.ccwu.cc";

const dictionary = {
  en: {
    title: "AI Tools Market Radar",
    kicker: "Toolify signals · hourly refreshed",
    subtitle: "Five market-validated AI tool rankings for builders, affiliates, and micro-SaaS hunters.",
    theme: "Theme",
    language: "中文",
    updated: "Updated",
    visit: "Visit",
    dataApi: "Data API",
    sitemap: "Sitemap",
    pet: "XiaoTian Dog",
    sections: {
      "top-tools": ["Top AI Tools", "Front-rank products already validated by search, traffic and usage."],
      "high-traffic-categories": ["High-Traffic Categories", "Categories with broad search demand and repeatable content angles."],
      "fast-growth-tools": ["Fast-Growth Tools", "Rising products and tool ideas worth watching before they saturate."],
      "paid-products": ["Paid Products", "Products with subscription or payment-platform evidence."],
      "competitive-tracks": ["Competitive Tracks", "Crowded but proven lanes where demand has already been educated."],
    },
  },
  zh: {
    title: "AI 工具市场雷达",
    kicker: "Toolify 信号 · 每小时刷新",
    subtitle: "为工具站、联盟营销和 Micro-SaaS 选品准备的 5 类市场验证榜单。",
    theme: "配色",
    language: "English",
    updated: "更新时间",
    visit: "访问",
    dataApi: "数据 API",
    sitemap: "站点地图",
    pet: "啸天犬",
    sections: {
      "top-tools": ["榜单靠前 AI 工具", "已经被搜索、访问量和真实使用验证过的头部产品。"],
      "high-traffic-categories": ["访问量高分类", "搜索需求广、内容角度多、适合持续做页面的分类。"],
      "fast-growth-tools": ["增长快工具", "在赛道饱和前值得观察和拆解的新工具/新方向。"],
      "paid-products": ["已经有人付费产品", "有订阅、支付平台或明确付费信号的产品。"],
      "competitive-tracks": ["竞品很多赛道", "虽然拥挤，但用户认知已经完成、需求被验证的赛道。"],
    },
  },
} as const;

const brandHosts: Record<string, string> = {
  "claude 2": "claude.ai",
  claude: "claude.ai",
  "gemini & gemini advanced": "gemini.google.com",
  gemini: "gemini.google.com",
  deepseek: "deepseek.com",
  "magnific (formerly freepik)": "freepik.com",
  magnific: "magnific.ai",
  meshy: "meshy.ai",
  janitorai: "janitorai.com",
  "spicychat ai": "spicychat.ai",
  polybuzz: "polybuzz.ai",
  "meta ai": "meta.ai",
  "use ai": "useai.com",
  chatgpt: "chatgpt.com",
  openai: "openai.com",
  "perplexity ai": "perplexity.ai",
  notion: "notion.so",
  "notion ai": "notion.so",
  "remove.bg": "remove.bg",
  grammarly: "grammarly.com",
  capcut: "capcut.com",
  quillbot: "quillbot.com",
  elevenlabs: "elevenlabs.io",
  adobe: "adobe.com",
  hubspot: "hubspot.com",
  replit: "replit.com",
  "hugging face": "huggingface.co",
  openrouter: "openrouter.ai",
  "poe": "poe.com",
  "gptzero": "gptzero.me",
  "zerogpt": "zerogpt.com",
  "photoroom": "photoroom.com",
  "veed.io": "veed.io",
};

function escapeHtml(value: string): string {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function localeFromPath(pathname: string): Locale {
  return pathname === "/zh" ? "zh" : "en";
}

function oppositeLocale(locale: Locale): string {
  return locale === "zh" ? "/" : "/zh";
}

function themeFromUrl(url: URL): Theme {
  return url.searchParams.get("theme") === "light" ? "light" : "dark";
}

function withTheme(path: string, theme: Theme): string {
  return `${path}?theme=${theme === "dark" ? "light" : "dark"}`;
}

function domainFromUrl(url?: string): string {
  if (!url) return "";
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function inferBrandDomain(item: ProductItem): string {
  const direct = domainFromUrl(item.website);
  if (direct && direct !== "toolify.ai") return direct;
  const key = item.name.toLowerCase().trim();
  if (brandHosts[key]) return brandHosts[key];
  const simplified = key.replace(/\s*\([^)]*\)\s*/g, "").trim();
  if (brandHosts[simplified]) return brandHosts[simplified];
  const first = simplified.split(/\s+/)[0];
  if (brandHosts[first]) return brandHosts[first];
  return `${simplified.replace(/[^a-z0-9]/g, "") || "ai"}.com`;
}

function iconFor(item: ProductItem): string {
  const domain = inferBrandDomain(item);
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;
}

function itemUrl(item: ProductItem): string {
  return item.website || item.toolifyUrl || `https://${inferBrandDomain(item)}`;
}

function localizeSection(locale: Locale, key: string, fallbackTitle: string, fallbackSubtitle: string): readonly [string, string] {
  return (dictionary[locale].sections as Record<string, readonly [string, string]>)[key] || [fallbackTitle, fallbackSubtitle];
}

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data, null, 2), { ...init, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...init.headers } });
}

function renderProductCard(item: ProductItem, accent: number, locale: Locale): string {
  const t = dictionary[locale];
  const url = itemUrl(item);
  const domain = inferBrandDomain(item);
  return html`<a class="product-card accent-${accent % 5}" href="${escapeHtml(url)}" target="_blank" rel="nofollow noopener">
    <div class="card-top"><span class="rank">#${item.rank}</span><img src="${escapeHtml(iconFor(item))}" alt="${escapeHtml(item.name)} icon" loading="lazy" referrerpolicy="no-referrer" /></div>
    <h3>${escapeHtml(item.name)}</h3>
    <p>${escapeHtml(item.description || "Market-validated AI product discovered from Toolify ranking signals.")}</p>
    <footer><span>${escapeHtml(item.visits || domain)}</span><em>${escapeHtml(t.visit)} →</em></footer>
  </a>`;
}

function renderCategoryCard(item: CategoryItem, accent: number): string {
  const url = item.url || `/?keyword=${encodeURIComponent(item.name)}`;
  return html`<a class="category-card accent-${accent % 5}" href="${escapeHtml(url)}" target="_blank" rel="nofollow noopener">
    <span>#${item.rank}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description || item.signals || "Crowded category with proven demand.")}</p><em>${escapeHtml(item.signals || "high search intent")}</em>
  </a>`;
}

function renderMarketSections(locale: Locale): string {
  return html`<section class="market" id="toolify-market">
    ${toolifyData.sections.map((section, sectionIndex) => {
      const [title, subtitle] = localizeSection(locale, section.key, section.title, section.subtitle);
      return html`<section class="market-block" id="${escapeHtml(section.key)}">
        <div class="block-title"><div><span>0${sectionIndex + 1}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle)}</p></div></div>
        <div class="cards ${section.kind === "products" ? "products" : "categories"}">
          ${section.items.map((item, itemIndex) => section.kind === "products" ? renderProductCard(item as ProductItem, itemIndex, locale) : renderCategoryCard(item as CategoryItem, itemIndex)).join("")}
        </div>
      </section>`;
    }).join("")}
  </section>`;
}

function renderPet(locale: Locale): string {
  return html`<div class="pet" aria-label="${escapeHtml(dictionary[locale].pet)}"><div class="dog"><span class="ear l"></span><span class="ear r"></span><span class="face"><i></i><i></i><b></b></span><span class="body"></span><span class="tail"></span><span class="leg a"></span><span class="leg b"></span></div><strong>${escapeHtml(dictionary[locale].pet)}</strong></div>`;
}

function renderHome(url: URL, locale: Locale): Response {
  const theme = themeFromUrl(url);
  const t = dictionary[locale];
  const jsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: t.title, url: host, description: t.subtitle, inLanguage: locale === "zh" ? "zh-CN" : "en" };
  return new Response(html`<!doctype html><html lang="${locale === "zh" ? "zh-CN" : "en"}" data-theme="${theme}"><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(t.title)} · Toolify Ranking Radar</title>
  <meta name="description" content="${escapeHtml(t.subtitle)}" />
  <meta name="keywords" content="AI tools, Toolify, AI ranking, AI tool directory, AI products, AI SaaS" />
  <link rel="canonical" href="${host}${locale === "zh" ? "/zh" : "/"}" />
  <meta property="og:title" content="${escapeHtml(t.title)}" /><meta property="og:description" content="${escapeHtml(t.subtitle)}" /><meta property="og:type" content="website" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${style()}</style>
</head><body id="top">
  <header class="hero">
    <nav><strong>${escapeHtml(t.title)}</strong><div><a href="${escapeHtml(withTheme(url.pathname, theme))}">${escapeHtml(t.theme)}: ${theme === "dark" ? "Dark" : "Light"}</a><a href="${escapeHtml(oppositeLocale(locale))}">${escapeHtml(t.language)}</a><a href="/api/toolify">${escapeHtml(t.dataApi)}</a></div></nav>
    <div class="hero-grid"><div><p class="eyebrow">${escapeHtml(t.kicker)}</p><h1>${escapeHtml(t.title)}</h1><p class="subtitle">${escapeHtml(t.subtitle)}</p><p class="updated">${escapeHtml(t.updated)} · ${escapeHtml(toolifyData.updatedAt)}</p></div><figure class="hero-image"><img src="${heroImageDataUri}" alt="AI tools market radar hero image" /></figure></div>
  </header>
  <main>${renderMarketSections(locale)}</main>
  ${renderPet(locale)}
  <footer>Cloudflare Workers · ${escapeHtml(t.updated)} ${escapeHtml(toolifyData.updatedAt)} · <a href="/sitemap.xml">${escapeHtml(t.sitemap)}</a></footer>
</body></html>`, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } });
}

function sitemap(): Response {
  const urls = ["/", "/zh", "/api/toolify"];
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${host}${u}</loc><lastmod>${toolifyData.updatedAt.slice(0, 10)}</lastmod><changefreq>hourly</changefreq><priority>${u === "/" ? "1.0" : "0.7"}</priority></url>`).join("")}</urlset>`;
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}

function robots(): Response {
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${host}/sitemap.xml\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

function style(): string {
  return String.raw`
:root{--bg:#090c12;--bg2:#111827;--panel:rgba(255,255,255,.06);--text:#f6efe4;--muted:#a8b0c2;--line:rgba(255,255,255,.14);--hot:#ff6b35;--gold:#ffd166;--green:#7bd88f;--blue:#79c0ff;--pink:#ff7ab6;--shadow:rgba(0,0,0,.38)}
:root[data-theme="light"]{--bg:#f6f0e6;--bg2:#fffaf0;--panel:rgba(255,255,255,.72);--text:#151820;--muted:#5f6775;--line:rgba(28,32,42,.15);--hot:#d94f21;--gold:#a66a00;--green:#16834a;--blue:#176bb3;--pink:#c43878;--shadow:rgba(38,31,20,.12)}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 14% 0,color-mix(in srgb,var(--blue) 28%,transparent),transparent 32%),radial-gradient(circle at 86% 8%,color-mix(in srgb,var(--hot) 22%,transparent),transparent 28%),linear-gradient(135deg,var(--bg),var(--bg2));color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit}.hero{padding:28px clamp(20px,5vw,72px) 54px}nav{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:54px}nav strong{font-family:Georgia,serif;font-size:22px}nav div{display:flex;gap:10px;flex-wrap:wrap}nav a{text-decoration:none;color:var(--muted);border:1px solid var(--line);background:var(--panel);padding:9px 14px;border-radius:999px;backdrop-filter:blur(12px)}.hero-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.78fr);gap:42px;align-items:center}.eyebrow{letter-spacing:.16em;text-transform:uppercase;color:var(--gold);font-size:12px;font-weight:900}h1{font-family:Georgia,serif;font-size:clamp(56px,10vw,132px);letter-spacing:-.07em;line-height:.86;margin:0 0 24px;max-width:980px}h2{font-family:Georgia,serif;font-size:clamp(34px,5vw,72px);line-height:.95;letter-spacing:-.045em;margin:0 0 14px}h3{font-size:20px;margin:0}.subtitle{font-size:clamp(18px,2.1vw,26px);line-height:1.55;color:var(--muted);max-width:760px}.updated{display:inline-flex;margin-top:22px;color:var(--green);border:1px solid var(--line);border-radius:999px;padding:10px 14px;background:var(--panel)}.hero-image{margin:0;border:1px solid var(--line);padding:10px;border-radius:34px;background:linear-gradient(180deg,var(--panel),transparent);box-shadow:0 32px 90px var(--shadow);transform:rotate(1deg)}.hero-image img{display:block;width:100%;border-radius:25px;aspect-ratio:16/9;object-fit:cover}main{padding:0 clamp(20px,5vw,72px) 86px}.market{border-top:1px solid var(--line);padding-top:22px}.market-block{padding-top:44px;margin-top:20px}.block-title{display:grid;grid-template-columns:120px minmax(0,1fr);gap:22px;align-items:end;margin-bottom:22px}.block-title span{font-family:Georgia,serif;font-size:78px;line-height:.8;color:var(--hot)}.block-title p{color:var(--muted);line-height:1.6;max-width:840px}.cards{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}.product-card,.category-card{position:relative;min-height:262px;text-decoration:none;border:1px solid var(--line);border-radius:28px;padding:20px;background:linear-gradient(180deg,var(--panel),color-mix(in srgb,var(--panel) 46%,transparent));box-shadow:0 18px 60px var(--shadow);display:flex;flex-direction:column;gap:14px;overflow:hidden;transition:.2s transform,.2s border-color}.product-card:before,.category-card:before{content:"";position:absolute;inset:0 0 auto;height:4px;background:var(--hot)}.product-card:hover,.category-card:hover{transform:translateY(-5px);border-color:var(--gold)}.card-top{display:flex;justify-content:space-between;align-items:center}.rank,.category-card span{color:var(--gold);font-weight:950}.product-card img{width:46px;height:46px;border-radius:14px;background:white;border:1px solid var(--line);padding:4px}.product-card p,.category-card p{color:var(--muted);line-height:1.5;font-size:14px}.product-card footer{margin-top:auto;display:flex;justify-content:space-between;color:var(--muted);border:0;padding:0}.product-card em,.category-card em{color:var(--green);font-style:normal}.accent-1:before{background:var(--gold)}.accent-2:before{background:var(--blue)}.accent-3:before{background:var(--green)}.accent-4:before{background:var(--pink)}footer{border-top:1px solid var(--line);padding:28px clamp(20px,5vw,72px);color:var(--muted)}.pet{position:fixed;right:22px;bottom:18px;z-index:10;display:flex;align-items:center;gap:10px;border:1px solid var(--line);background:color-mix(in srgb,var(--bg2) 82%,transparent);border-radius:999px;padding:10px 14px;box-shadow:0 16px 50px var(--shadow);backdrop-filter:blur(10px)}.pet strong{font-size:13px;color:var(--muted)}.dog{position:relative;width:48px;height:36px;image-rendering:pixelated;animation:bob 1.1s steps(2,end) infinite}.face{position:absolute;left:9px;top:8px;width:25px;height:22px;background:#f6efe4;border:3px solid #222;border-radius:4px}.face i{position:absolute;top:6px;width:4px;height:4px;background:#111}.face i:first-child{left:5px}.face i:nth-child(2){right:5px}.face b{position:absolute;left:10px;bottom:4px;width:5px;height:3px;background:#111}.ear{position:absolute;top:1px;width:10px;height:12px;background:#222}.ear.l{left:7px;transform:skewY(-18deg)}.ear.r{left:27px;transform:skewY(18deg)}.body{position:absolute;left:20px;top:18px;width:24px;height:14px;background:#f6efe4;border:3px solid #222;border-radius:3px}.tail{position:absolute;right:0;top:13px;width:12px;height:6px;background:#222;transform-origin:left center;animation:wag .45s steps(2,end) infinite}.leg{position:absolute;top:29px;width:5px;height:8px;background:#222}.leg.a{left:24px}.leg.b{left:38px;animation:step .6s steps(2,end) infinite}@keyframes wag{50%{transform:rotate(-28deg)}}@keyframes bob{50%{transform:translateY(-3px)}}@keyframes step{50%{transform:translateY(-3px)}}@media(max-width:1180px){.cards{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:820px){.hero-grid,.cards,.block-title{grid-template-columns:1fr}h1{font-size:56px}.pet{right:10px;bottom:10px}.pet strong{display:none}}
`;
}

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true, service: "ai-tools-launchpad", updatedAt: toolifyData.updatedAt });
    if (url.pathname === "/api/toolify") return json(toolifyData);
    if (url.pathname === "/sitemap.xml") return sitemap();
    if (url.pathname === "/robots.txt") return robots();
    if (url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/zh") return renderHome(url, localeFromPath(url.pathname));
    return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  },
};
