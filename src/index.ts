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
    kicker: "Independent market signals · hourly refreshed",
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
    kicker: "独立市场信号 · 每小时刷新",
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

function cleanDirectUrl(url: string): string {
  try {
    const parsed = new URL(url);
    for (const key of [...parsed.searchParams.keys()]) {
      if (key.toLowerCase().startsWith("utm_") || key.toLowerCase() === "ref") parsed.searchParams.delete(key);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function itemUrl(item: ProductItem): string {
  const direct = item.website || `https://${inferBrandDomain(item)}`;
  return cleanDirectUrl(domainFromUrl(direct) === "toolify.ai" ? `https://${inferBrandDomain(item)}` : direct);
}

function slugify(input: string): string {
  const slug = input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "ai-tools";
}

function localPageUrl(locale: Locale, sectionKey: string, item: CategoryItem): string {
  const prefix = locale === "zh" ? "/zh" : "";
  return `${prefix}/radar/${escapeHtml(sectionKey)}/${escapeHtml(slugify(item.name))}`;
}

function findSection(key: string) {
  return toolifyData.sections.find((section) => section.key === key);
}

function findCategoryLikeItem(sectionKey: string, slug: string): CategoryItem | undefined {
  const section = findSection(sectionKey);
  if (!section || section.kind === "products") return undefined;
  return (section.items as readonly CategoryItem[]).find((item) => slugify(item.name) === slug);
}

function relatedProducts(seed: string): ProductItem[] {
  const words = seed.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 1 && !["ai", "tools", "tool", "assistant", "generator"].includes(word));
  const allProducts = toolifyData.sections.flatMap((section) => section.kind === "products" ? [...(section.items as readonly ProductItem[])] : []);
  const scored = allProducts.map((item) => {
    const haystack = `${item.name} ${item.description || ""}`.toLowerCase();
    const score = words.reduce((sum, word) => sum + (haystack.includes(word) ? 2 : 0), 0) + (item.visits ? 1 : 0);
    return { item, score };
  }).sort((a, b) => b.score - a.score || a.item.rank - b.item.rank);
  const selected = scored.filter((x) => x.score > 0).map((x) => x.item);
  const fallback = scored.map((x) => x.item);
  const seen = new Set<string>();
  return [...selected, ...fallback].filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10).map((item, idx) => ({ ...item, rank: idx + 1 }));
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

function renderCategoryCard(item: CategoryItem, accent: number, locale: Locale, sectionKey: string): string {
  const url = localPageUrl(locale, sectionKey, item);
  return html`<a class="category-card accent-${accent % 5}" href="${url}">
    <span>#${item.rank}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description || item.signals || "Crowded category with proven demand.")}</p><em>${escapeHtml(item.signals || "open collection →")}</em>
  </a>`;
}

function renderMarketSections(locale: Locale): string {
  return html`<section class="market" id="market-radar">
    ${toolifyData.sections.map((section, sectionIndex) => {
      const [title, subtitle] = localizeSection(locale, section.key, section.title, section.subtitle);
      return html`<section class="market-block" id="${escapeHtml(section.key)}">
        <div class="block-title"><span class="section-no">0${sectionIndex + 1}</span><div class="section-copy"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle)}</p></div></div>
        <div class="cards ${section.kind === "products" ? "products" : "categories"}">
          ${section.items.map((item, itemIndex) => section.kind === "products" ? renderProductCard(item as ProductItem, itemIndex, locale) : renderCategoryCard(item as CategoryItem, itemIndex, locale, section.key)).join("")}
        </div>
      </section>`;
    }).join("")}
  </section>`;
}

function renderPet(locale: Locale): string {
  return html`<div class="pet" aria-label="${escapeHtml(dictionary[locale].pet)}"><div class="dog"><span class="ear l"></span><span class="ear r"></span><span class="face"><i></i><i></i><b></b></span><span class="body"></span><span class="tail"></span><span class="leg a"></span><span class="leg b"></span></div><strong>${escapeHtml(dictionary[locale].pet)}</strong></div>`;
}

function renderPageShell(url: URL, locale: Locale, body: string, extraTitle = ""): Response {
  const theme = themeFromUrl(url);
  const t = dictionary[locale];
  const jsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: t.title, url: host, description: t.subtitle, inLanguage: locale === "zh" ? "zh-CN" : "en" };
  return new Response(html`<!doctype html><html lang="${locale === "zh" ? "zh-CN" : "en"}" data-theme="${theme}"><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(extraTitle ? `${extraTitle} · ${t.title}` : `${t.title} · AI Ranking Radar`)}</title>
  <meta name="description" content="${escapeHtml(t.subtitle)}" />
  <meta name="keywords" content="AI tools, AI ranking, AI tool directory, AI products, AI SaaS, micro SaaS" />
  <link rel="canonical" href="${host}${locale === "zh" ? "/zh" : "/"}" />
  <meta property="og:title" content="${escapeHtml(t.title)}" /><meta property="og:description" content="${escapeHtml(t.subtitle)}" /><meta property="og:type" content="website" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${style()}</style>
</head><body id="top">
  ${body}
  ${renderPet(locale)}
  <footer>${escapeHtml(t.title)} · ${escapeHtml(t.updated)} ${escapeHtml(toolifyData.updatedAt)} · <a href="/sitemap.xml">${escapeHtml(t.sitemap)}</a></footer>
  <script>document.addEventListener('pointermove',function(e){document.documentElement.style.setProperty('--pet-y',e.clientY+'px')},{passive:true});</script>
</body></html>`, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } });
}

function renderNav(url: URL, locale: Locale, theme: Theme): string {
  const t = dictionary[locale];
  return html`<nav><a class="brand" href="${locale === "zh" ? "/zh" : "/"}">${escapeHtml(t.title)}</a><div><a href="${escapeHtml(withTheme(url.pathname, theme))}">${escapeHtml(t.theme)}: ${theme === "dark" ? "Dark" : "Light"}</a><a href="${escapeHtml(oppositeLocale(locale))}">${escapeHtml(t.language)}</a></div></nav>`;
}

function renderHome(url: URL, locale: Locale): Response {
  const theme = themeFromUrl(url);
  const t = dictionary[locale];
  const body = html`<header class="hero">
    ${renderNav(url, locale, theme)}
    <div class="hero-grid"><div><p class="eyebrow">${escapeHtml(t.kicker)}</p><h1>${escapeHtml(t.title)}</h1><p class="subtitle">${escapeHtml(t.subtitle)}</p><p class="updated">${escapeHtml(t.updated)} · ${escapeHtml(toolifyData.updatedAt)}</p></div><figure class="hero-image"><img src="${heroImageDataUri}" alt="AI tools market radar hero image" /></figure></div>
  </header>
  <main>${renderMarketSections(locale)}</main>`;
  return renderPageShell(url, locale, body);
}

function renderRadarSubPage(url: URL, locale: Locale, sectionKey: string, itemSlug: string): Response {
  const theme = themeFromUrl(url);
  const item = findCategoryLikeItem(sectionKey, itemSlug);
  if (!item) return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  const products = relatedProducts(item.name);
  const [sectionTitle] = localizeSection(locale, sectionKey, sectionKey, "");
  const title = locale === "zh" ? `${item.name} · 项目观察` : `${item.name} · Project Watchlist`;
  const body = html`<header class="hero sub-hero">
    ${renderNav(url, locale, theme)}
    <div class="sub-head"><a class="back" href="${locale === "zh" ? "/zh" : "/"}#${escapeHtml(sectionKey)}">← ${escapeHtml(sectionTitle)}</a><p class="eyebrow">${escapeHtml(dictionary[locale].kicker)}</p><h1>${escapeHtml(item.name)}</h1><p class="subtitle">${escapeHtml(item.description || item.signals || "A proven market lane with multiple active products.")}</p><p class="updated">${escapeHtml(dictionary[locale].updated)} · ${escapeHtml(toolifyData.updatedAt)}</p></div>
  </header>
  <main><section class="market detail"><div class="cards products slider">${products.map((product, index) => renderProductCard(product, index, locale)).join("")}</div></section></main>`;
  return renderPageShell(url, locale, body, title);
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
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 14% 0,color-mix(in srgb,var(--blue) 28%,transparent),transparent 32%),radial-gradient(circle at 86% 8%,color-mix(in srgb,var(--hot) 22%,transparent),transparent 28%),linear-gradient(135deg,var(--bg),var(--bg2));color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit}.hero{padding:28px clamp(20px,5vw,72px) 54px}nav{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:54px;max-width:100%;min-width:0}nav .brand{font-family:Georgia,serif;font-size:22px;text-decoration:none;font-weight:900;white-space:nowrap;min-width:0;max-width:58vw;overflow:hidden;text-overflow:ellipsis}nav div{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;min-width:0}nav a{text-decoration:none;color:var(--muted);border:1px solid var(--line);background:var(--panel);padding:9px 14px;border-radius:999px;backdrop-filter:blur(12px);max-width:100%}.hero-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,.78fr);gap:42px;align-items:center}.eyebrow{letter-spacing:.16em;text-transform:uppercase;color:var(--gold);font-size:12px;font-weight:900}h1{font-family:Georgia,serif;font-size:clamp(44px,7.4vw,112px);letter-spacing:-.055em;line-height:.94;margin:0 0 24px;max-width:1120px;word-break:keep-all;overflow-wrap:normal;text-wrap:balance;writing-mode:horizontal-tb}h2{font-family:Georgia,serif;font-size:clamp(34px,5vw,72px);line-height:.95;letter-spacing:-.045em;margin:0 0 14px}h3{font-size:20px;margin:0}.subtitle{font-size:clamp(18px,2.1vw,26px);line-height:1.55;color:var(--muted);max-width:760px}.updated{display:inline-flex;margin-top:22px;color:var(--green);border:1px solid var(--line);border-radius:999px;padding:10px 14px;background:var(--panel)}.hero-image{margin:0;border:1px solid var(--line);padding:10px;border-radius:34px;background:linear-gradient(180deg,var(--panel),transparent);box-shadow:0 32px 90px var(--shadow);transform:rotate(1deg)}.hero-image img{display:block;width:100%;border-radius:25px;aspect-ratio:16/9;object-fit:cover}main{padding:0 clamp(20px,5vw,72px) 86px}.market{border-top:1px solid var(--line);padding-top:22px}.market-block{padding-top:44px;margin-top:20px}.block-title{display:grid;grid-template-columns:auto minmax(0,1fr);gap:24px;align-items:start;margin-bottom:22px;writing-mode:horizontal-tb}.section-no{display:block;min-width:112px;font-family:Georgia,serif;font-size:78px;line-height:.82;color:var(--hot);white-space:nowrap;writing-mode:horizontal-tb}.section-copy{min-width:0;writing-mode:horizontal-tb}.section-copy h2{white-space:normal;word-break:keep-all;overflow-wrap:normal;text-wrap:balance;writing-mode:horizontal-tb}.block-title p{color:var(--muted);line-height:1.6;max-width:840px;writing-mode:horizontal-tb}.cards{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}.slider{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding-bottom:18px}.slider .product-card{min-width:min(340px,82vw);scroll-snap-align:start}.product-card,.category-card{position:relative;min-height:262px;text-decoration:none;border:1px solid var(--line);border-radius:28px;padding:20px;background:linear-gradient(180deg,var(--panel),color-mix(in srgb,var(--panel) 46%,transparent));box-shadow:0 18px 60px var(--shadow);display:flex;flex-direction:column;gap:14px;overflow:hidden;transition:.2s transform,.2s border-color}.product-card:before,.category-card:before{content:"";position:absolute;inset:0 0 auto;height:4px;background:var(--hot)}.product-card:hover,.category-card:hover{transform:translateY(-5px);border-color:var(--gold)}.sub-hero{padding-bottom:34px}.sub-head{max-width:1180px}.back{display:inline-flex;margin-bottom:18px;text-decoration:none;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:9px 14px;background:var(--panel)}.detail{border-top:0;padding-top:0}.card-top{display:flex;justify-content:space-between;align-items:center}.rank,.category-card span{color:var(--gold);font-weight:950}.product-card img{width:46px;height:46px;border-radius:14px;background:white;border:1px solid var(--line);padding:4px}.product-card p,.category-card p{color:var(--muted);line-height:1.5;font-size:14px}.product-card footer{margin-top:auto;display:flex;justify-content:space-between;color:var(--muted);border:0;padding:0}.product-card em,.category-card em{color:var(--green);font-style:normal}.accent-1:before{background:var(--gold)}.accent-2:before{background:var(--blue)}.accent-3:before{background:var(--green)}.accent-4:before{background:var(--pink)}footer{border-top:1px solid var(--line);padding:28px clamp(20px,5vw,72px);color:var(--muted)}.pet{position:fixed;right:18px;top:clamp(88px,var(--pet-y,50vh),calc(100vh - 88px));transform:translateY(-50%);z-index:10;display:flex;align-items:center;gap:10px;border:1px solid var(--line);background:color-mix(in srgb,var(--bg2) 82%,transparent);border-radius:999px;padding:10px 14px;box-shadow:0 16px 50px var(--shadow);backdrop-filter:blur(10px);pointer-events:none;user-select:none;transition:top .18s ease-out}.pet strong{font-size:13px;color:var(--muted)}.dog{position:relative;width:48px;height:36px;image-rendering:pixelated;animation:bob 1.1s steps(2,end) infinite}.face{position:absolute;left:9px;top:8px;width:25px;height:22px;background:#f6efe4;border:3px solid #222;border-radius:4px}.face i{position:absolute;top:6px;width:4px;height:4px;background:#111}.face i:first-child{left:5px}.face i:nth-child(2){right:5px}.face b{position:absolute;left:10px;bottom:4px;width:5px;height:3px;background:#111}.ear{position:absolute;top:1px;width:10px;height:12px;background:#222}.ear.l{left:7px;transform:skewY(-18deg)}.ear.r{left:27px;transform:skewY(18deg)}.body{position:absolute;left:20px;top:18px;width:24px;height:14px;background:#f6efe4;border:3px solid #222;border-radius:3px}.tail{position:absolute;right:0;top:13px;width:12px;height:6px;background:#222;transform-origin:left center;animation:wag .45s steps(2,end) infinite}.leg{position:absolute;top:29px;width:5px;height:8px;background:#222}.leg.a{left:24px}.leg.b{left:38px;animation:step .6s steps(2,end) infinite}@keyframes wag{50%{transform:rotate(-28deg)}}@keyframes bob{50%{transform:translateY(-3px)}}@keyframes step{50%{transform:translateY(-3px)}}@media(max-width:1180px){.cards{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:820px){.hero{padding:18px 16px 42px}nav{display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:36px;align-items:start}nav .brand{max-width:100%;font-size:19px;white-space:normal;line-height:1.15}nav div{justify-content:flex-start;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:8px}nav div a{text-align:center;padding:10px 8px;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hero-grid,.cards{grid-template-columns:1fr}.block-title{grid-template-columns:auto minmax(0,1fr);gap:14px}.section-no{min-width:54px;font-size:36px}.section-copy h2{font-size:clamp(30px,9vw,48px)}h1{font-size:clamp(38px,13vw,64px);letter-spacing:-.035em}.pet{right:8px;top:clamp(74px,var(--pet-y,50vh),calc(100vh - 74px));padding:8px}.pet strong{display:none}}
`;
}

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true, service: "ai-tools-launchpad", updatedAt: toolifyData.updatedAt });
    if (url.pathname === "/api/toolify") return json(toolifyData);
    if (url.pathname === "/sitemap.xml") return sitemap();
    if (url.pathname === "/robots.txt") return robots();
    const zhSubMatch = url.pathname.match(/^\/zh\/radar\/([^/]+)\/([^/]+)\/?$/);
    if (zhSubMatch) return renderRadarSubPage(url, "zh", zhSubMatch[1], zhSubMatch[2]);
    const subMatch = url.pathname.match(/^\/radar\/([^/]+)\/([^/]+)\/?$/);
    if (subMatch) return renderRadarSubPage(url, "en", subMatch[1], subMatch[2]);
    if (url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/zh") return renderHome(url, localeFromPath(url.pathname));
    return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  },
};
