import { toolifyData } from "./toolify-data.ts";

interface Env {}

type Locale = "en" | "zh";

type ToolBlueprint = {
  keyword: string;
  slug: string;
  title: string;
  positioning: string;
  audience: string[];
  pains: string[];
  mvp: string[];
  seoPages: string[];
  monetization: string[];
  risks: string[];
  launchChecklist: string[];
  score: number;
};

const html = String.raw;

const examples = ["ai resume optimizer", "ai background remover", "ai ppt maker", "ai humanizer", "youtube summary ai", "invoice generator ai"];

function escapeHtml(value: string): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(input: string): string {
  const slug = input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "ai-tool";
}

function titleCase(input: string): string {
  return input.split(/\s+/).filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
}

function inferBlueprint(keywordInput: string): ToolBlueprint {
  const keyword = keywordInput.trim() || "ai resume optimizer";
  const lower = keyword.toLowerCase();
  const title = titleCase(keyword);
  const slug = slugify(keyword);
  const isResume = /resume|cv|cover letter|job/.test(lower);
  const isImage = /image|photo|background|logo|avatar|poster/.test(lower);
  const isWriting = /humanizer|writer|essay|blog|copy|content|rewrite/.test(lower);
  const isVideo = /youtube|video|subtitle|clip|transcript/.test(lower);
  const isBusiness = /invoice|contract|proposal|email|sales|crm/.test(lower);
  const audience = isResume
    ? ["Job seekers applying to overseas roles", "Career coaches", "International students"]
    : isImage
      ? ["Creators needing quick visual assets", "Small e-commerce sellers", "Marketing operators"]
      : isVideo
        ? ["YouTube learners", "Newsletter writers", "Research assistants"]
        : isBusiness
          ? ["Solo founders", "Freelancers", "Small business operators"]
          : ["Indie hackers", "SEO traffic builders", "Non-technical knowledge workers"];
  const pains = isResume
    ? ["Users do not know why resumes are rejected", "ATS keywords are hard to tune", "Editing for every job is repetitive"]
    : isImage
      ? ["Design tools feel too heavy", "Users want a clean result in one click", "Existing tools often hide exports behind confusing paywalls"]
      : isWriting
        ? ["AI text sounds generic", "Users need tone control", "Manual rewriting wastes time"]
        : isVideo
          ? ["Long videos hide useful details", "Manual notes are slow", "Creators need reusable summaries"]
          : ["The workflow is repetitive", "Generic AI chat gives unstructured output", "Users want a result they can copy or export"];
  const mvp = [`One focused input form for ${keyword}`, "Instant before/after result preview", "Copy result and download as Markdown/Text", "Three preset modes: quick, professional, and SEO-friendly", "Landing page with clear pain point, demo, FAQ, and comparison section"];
  const seoPages = [`/${slug}`, `/${slug}/free`, `/${slug}/alternatives`, `/${slug}/how-to`, `/blog/best-${slug}-tools`];
  const monetization = ["Free daily quota to capture SEO users", "Pro plan for higher limits and export formats", "Template packs or prompt packs as low-ticket products", "Affiliate links to adjacent SaaS tools after trust is built"];
  const risks = ["Keyword may have high SEO competition; start with long-tail pages", "Model/API cost can eat margin; cache deterministic examples", "Avoid claiming guaranteed outcomes; use careful wording", "Ship a narrow workflow first instead of a generic AI toolbox"];
  const launchChecklist = ["Validate keyword with Google autocomplete and Trends rising terms", "Study top 5 ranking pages and identify missing UX angles", "Publish the MVP page plus 3 long-tail SEO pages", "Add analytics, search console, and conversion events", "Collect 20 real user sessions before adding login or payment complexity"];
  const specificity = keyword.split(/\s+/).filter(Boolean).length;
  const modifierBonus = /(free|generator|checker|optimizer|remover|maker|template|for)/.test(lower) ? 18 : 8;
  const nicheBonus = specificity >= 3 ? 22 : specificity === 2 ? 16 : 8;
  const score = Math.min(96, 42 + modifierBonus + nicheBonus + (isResume || isImage || isWriting || isVideo || isBusiness ? 10 : 4));
  return { keyword, slug, title, positioning: `A focused micro-tool that turns the search intent “${keyword}” into a one-screen workflow with a concrete output.`, audience, pains, mvp, seoPages, monetization, risks, launchChecklist, score };
}

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data, null, 2), { ...init, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...init.headers } });
}

function renderList(items: readonly string[]): string {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderBlueprintCard(blueprint: ToolBlueprint): string {
  return html`
    <section class="result-card" id="result">
      <div class="result-head"><div><p class="eyebrow">MVP Blueprint</p><h2>${escapeHtml(blueprint.title)}</h2><p>${escapeHtml(blueprint.positioning)}</p></div><div class="score"><span>${blueprint.score}</span><small>/100</small></div></div>
      <div class="grid two">
        <article><h3>Target users</h3><ul>${renderList(blueprint.audience)}</ul></article>
        <article><h3>User pains</h3><ul>${renderList(blueprint.pains)}</ul></article>
        <article><h3>MVP scope</h3><ul>${renderList(blueprint.mvp)}</ul></article>
        <article><h3>SEO pages</h3><ul>${renderList(blueprint.seoPages)}</ul></article>
        <article><h3>Monetization</h3><ul>${renderList(blueprint.monetization)}</ul></article>
        <article><h3>Risks</h3><ul>${renderList(blueprint.risks)}</ul></article>
      </div>
      <article class="checklist"><h3>Launch checklist</h3><ol>${blueprint.launchChecklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></article>
    </section>`;
}

function renderAdSlot(kind: "wide" | "side", label = "Sponsored"): string {
  return html`<aside class="ad-slot ${kind}" aria-label="advertising"><span>${label}</span><strong>Ad space available</strong><p>Google AdSense / cloud-drive offer / AI SaaS affiliate banner.</p></aside>`;
}

type ProductItem = { readonly rank: number; readonly name: string; readonly description?: string; readonly icon?: string; readonly website?: string; readonly toolifyUrl?: string; readonly visits?: string };
type CategoryItem = { readonly rank: number; readonly name: string; readonly description?: string; readonly url?: string; readonly signals?: string };

function renderProductCard(item: ProductItem, accent: number): string {
  const url = item.website || item.toolifyUrl || "#";
  return html`<a class="product-card accent-${accent % 5}" href="${escapeHtml(url)}" target="_blank" rel="nofollow noopener">
    <div class="rank">#${item.rank}</div>
    <img src="${escapeHtml(item.icon || "https://cdn.toolify.ai/default.webp")}" alt="" loading="lazy" />
    <div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description || "Market-validated AI product discovered from Toolify ranking signals.")}</p></div>
    <footer><span>${escapeHtml(item.visits || "validated")}</span><em>Visit →</em></footer>
  </a>`;
}

function renderCategoryCard(item: CategoryItem, accent: number): string {
  const url = item.url || `/?keyword=${encodeURIComponent(item.name)}`;
  return html`<a class="category-card accent-${accent % 5}" href="${escapeHtml(url)}" target="_blank" rel="nofollow noopener">
    <span>#${item.rank}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description || item.signals || "Crowded category with proven demand.")}</p><em>${escapeHtml(item.signals || "high search intent")}</em>
  </a>`;
}

function renderMarketSections(): string {
  return html`<section class="market" id="toolify-market">
    <div class="section-head"><p class="eyebrow">Toolify market radar · hourly refresh</p><h2>Market-validated AI products to copy, remix, or niche down from</h2><p>榜单靠前不代表照抄，而是说明需求已经被市场教育过。这里按顺序展示 5 组信号：头部工具、高流量分类、增长快工具、已付费产品、竞品很多赛道。</p></div>
    ${renderAdSlot("wide", "Top banner")}
    ${toolifyData.sections.map((section, sectionIndex) => html`<section class="market-block" id="${escapeHtml(section.key)}">
      <div class="block-title"><div><span>0${sectionIndex + 1}</span><h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(section.subtitle)}</p></div><a href="#top">Back to top</a></div>
      <div class="cards ${section.kind === "products" ? "products" : "categories"}">
        ${section.items.map((item, itemIndex) => section.kind === "products" ? renderProductCard(item as ProductItem, itemIndex) : renderCategoryCard(item as CategoryItem, itemIndex)).join("")}
      </div>
    </section>`).join("")}
    ${renderAdSlot("wide", "Bottom banner")}
  </section>`;
}

function renderHome(url: URL, locale: Locale): Response {
  const keyword = url.searchParams.get("keyword") || "ai resume optimizer";
  const blueprint = inferBlueprint(keyword);
  const pageTitle = locale === "zh" ? "AI 工具站机会验证器" : "AI Tool Site Opportunity Builder";
  const subtitle = locale === "zh" ? "输入一个关键词，快速生成工具站定位、MVP、SEO 页面和变现路径。" : "Turn one search keyword into a focused AI micro-tool plan: positioning, MVP, SEO pages, risks, and monetization.";
  const jsonLd = { "@context": "https://schema.org", "@type": "WebApplication", name: "AI Tools Launchpad", url: "https://tools.efwmcstyle.ccwu.cc/", applicationCategory: "BusinessApplication", description: "AI tools ranking, market research and opportunity builder for AI micro-tool sites." };

  return new Response(html`<!doctype html><html lang="${locale === "zh" ? "zh-CN" : "en"}"><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pageTitle)} · Toolify AI Ranking Radar</title>
  <meta name="description" content="Hourly-updated AI tools landing page with Toolify ranking signals: top tools, high-traffic categories, fast-growth products, paid products and competitive tracks." />
  <meta name="keywords" content="AI tools, Toolify ranking, AI tool directory, AI startup ideas, AI micro SaaS, AI product research" />
  <link rel="canonical" href="https://tools.efwmcstyle.ccwu.cc/" />
  <meta property="og:title" content="${escapeHtml(pageTitle)} · Toolify Market Radar" /><meta property="og:description" content="${escapeHtml(subtitle)}" /><meta property="og:type" content="website" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${style()}</style>
</head><body id="top">
  <header class="hero"><nav><strong>AI Tools Launchpad</strong><div><a href="#toolify-market">Toolify Radar</a><a href="/api/toolify">Data API</a><a href="/api/blueprint?keyword=${encodeURIComponent(keyword)}">Blueprint API</a></div></nav>
    <div class="hero-grid"><div><p class="eyebrow">Keyword → Tool Site → Launch</p><h1>${escapeHtml(pageTitle)}</h1><p class="subtitle">${escapeHtml(subtitle)}</p>
      <form method="GET" action="/" class="search"><input name="keyword" value="${escapeHtml(keyword)}" placeholder="ai resume optimizer" /><button type="submit">Build blueprint</button></form>
      <div class="chips">${examples.map((item) => `<a href="/?keyword=${encodeURIComponent(item)}#result">${escapeHtml(item)}</a>`).join("")}</div></div>
      <div class="mag-card"><span>01</span><h2>Validated markets beat clever guesses.</h2><p>Use Toolify-style ranking signals to find what users already search, visit, save, and pay for. Then niche down into one painful workflow.</p><small>Last data refresh: ${escapeHtml(toolifyData.updatedAt)}</small></div>
    </div></header>
  <main><section class="method"><p class="eyebrow">Tutorial distilled</p><h2>From overseas search demand to a live tool site</h2><div class="grid four"><article><b>1. Find demand</b><p>Use rankings, Trends, autocomplete, competitor pages, and sitemap updates.</p></article><article><b>2. Write MVP</b><p>Define audience, pain, scope, page structure, and success signals.</p></article><article><b>3. Build narrow</b><p>Make one workflow excellent before adding login, payment, and templates.</p></article><article><b>4. Monetize carefully</b><p>AdSense, net-disk ads, affiliates, templates, and paid quotas can be layered after traffic.</p></article></div></section>
    ${renderMarketSections()}
    ${renderBlueprintCard(blueprint)}
  </main><footer>Built on Cloudflare Workers · hourly Toolify radar · <a href="/zh">中文</a> · <a href="/">English</a> · <a href="/sitemap.xml">Sitemap</a></footer>
</body></html>`, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } });
}

function sitemap(): Response {
  const urls = ["/", "/zh", "/api/toolify", ...examples.map((x) => `/?keyword=${encodeURIComponent(x)}`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>https://tools.efwmcstyle.ccwu.cc${u.replaceAll("&", "&amp;")}</loc><lastmod>${toolifyData.updatedAt.slice(0, 10)}</lastmod><changefreq>hourly</changefreq><priority>${u === "/" ? "1.0" : "0.7"}</priority></url>`).join("")}</urlset>`;
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}

function robots(): Response {
  return new Response("User-agent: *\nAllow: /\nSitemap: https://tools.efwmcstyle.ccwu.cc/sitemap.xml\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
}

function style(): string {
  return String.raw`:root{--bg:#0b0e14;--panel:#121723;--text:#f4efe6;--muted:#a9b2c3;--line:#2a3447;--hot:#ff6b35;--gold:#ffd166;--green:#7bd88f;--blue:#79c0ff;--pink:#ff7ab6}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0,#253454 0,transparent 30%),linear-gradient(135deg,#080a0f,#121723 45%,#0d111a);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit}nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:72px;gap:20px}nav div{display:flex;gap:10px;flex-wrap:wrap}nav a{color:var(--muted);text-decoration:none;border:1px solid var(--line);padding:8px 14px;border-radius:999px}.hero{padding:28px clamp(20px,5vw,72px) 72px}.hero-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:48px;align-items:end}.eyebrow{letter-spacing:.16em;text-transform:uppercase;color:var(--gold);font-size:12px;font-weight:800}h1{font-family:Georgia,serif;font-size:clamp(48px,9vw,104px);line-height:.9;margin:0 0 24px;max-width:980px}h2{font-family:Georgia,serif;font-size:clamp(30px,4vw,54px);line-height:1;margin:0 0 18px}h3{margin:0 0 12px;font-size:18px}.subtitle{font-size:20px;color:var(--muted);max-width:760px;line-height:1.6}.search{display:flex;gap:12px;margin:34px 0 20px;max-width:760px}.search input{flex:1;padding:18px 20px;border-radius:18px;border:1px solid var(--line);background:#0e1320;color:var(--text);font-size:18px}.search button{border:0;border-radius:18px;background:linear-gradient(135deg,var(--hot),#ff9f1c);color:#1b0c04;font-weight:900;padding:0 24px;font-size:16px;cursor:pointer}.chips{display:flex;gap:10px;flex-wrap:wrap}.chips a{color:var(--muted);text-decoration:none;background:rgba(255,255,255,.06);border:1px solid var(--line);padding:8px 12px;border-radius:999px}.mag-card{border:1px solid var(--line);border-radius:32px;padding:34px;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.03));box-shadow:0 30px 80px rgba(0,0,0,.35)}.mag-card span{font-family:Georgia,serif;font-size:82px;color:var(--hot)}.mag-card p,.method p,li,.section-head p,.block-title p{color:var(--muted);line-height:1.6}.mag-card small{color:var(--green)}main{padding:0 clamp(20px,5vw,72px) 72px}.method,.result-card,.market{border-top:1px solid var(--line);padding-top:46px;margin-top:28px}.grid{display:grid;gap:18px}.grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}article{background:rgba(255,255,255,.045);border:1px solid var(--line);border-radius:24px;padding:22px}.section-head{max-width:980px}.ad-slot{border:1px dashed rgba(255,209,102,.55);border-radius:28px;background:linear-gradient(135deg,rgba(255,209,102,.13),rgba(121,192,255,.07));padding:20px;margin:26px 0;color:var(--muted)}.ad-slot span{display:block;color:var(--gold);font-size:12px;text-transform:uppercase;letter-spacing:.14em}.ad-slot strong{color:var(--text);font-size:22px}.market-block{margin-top:40px}.block-title{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:18px}.block-title span{font-family:Georgia,serif;color:var(--hot);font-size:56px}.block-title a{color:var(--muted);text-decoration:none}.cards{display:grid;gap:16px}.cards.products{grid-template-columns:repeat(5,minmax(0,1fr))}.cards.categories{grid-template-columns:repeat(5,minmax(0,1fr))}.product-card,.category-card{min-height:250px;text-decoration:none;border:1px solid var(--line);border-radius:26px;padding:20px;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.035));display:flex;flex-direction:column;gap:14px;transition:.2s transform,.2s border-color}.product-card:hover,.category-card:hover{transform:translateY(-4px);border-color:var(--gold)}.product-card img{width:48px;height:48px;border-radius:14px;background:#fff}.product-card .rank,.category-card span{color:var(--gold);font-weight:900}.product-card p,.category-card p{color:var(--muted);line-height:1.5;font-size:14px}.product-card footer{margin-top:auto;display:flex;justify-content:space-between;color:var(--muted);border:0;padding:0}.product-card em,.category-card em{color:var(--green);font-style:normal}.accent-0{box-shadow:inset 0 3px 0 var(--hot)}.accent-1{box-shadow:inset 0 3px 0 var(--gold)}.accent-2{box-shadow:inset 0 3px 0 var(--blue)}.accent-3{box-shadow:inset 0 3px 0 var(--green)}.accent-4{box-shadow:inset 0 3px 0 var(--pink)}.result-head{display:flex;justify-content:space-between;gap:24px;align-items:start;margin-bottom:22px}.result-head p{color:var(--muted);max-width:760px}.score{min-width:132px;height:132px;border-radius:50%;display:grid;place-content:center;text-align:center;background:radial-gradient(circle,var(--green),#174a2b);color:#061308;font-weight:900}.score span{font-size:46px}.score small{font-size:14px}ul,ol{padding-left:20px;margin:0}.checklist{margin-top:18px;background:linear-gradient(135deg,rgba(255,209,102,.12),rgba(255,107,53,.08))}footer{border-top:1px solid var(--line);padding:28px clamp(20px,5vw,72px);color:var(--muted)}@media(max-width:1180px){.cards.products,.cards.categories{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:900px){.hero-grid,.grid.two,.grid.four,.cards.products,.cards.categories{grid-template-columns:1fr}.search{flex-direction:column}.search button{padding:16px}.result-head,.block-title{flex-direction:column;align-items:start}.score{width:112px;height:112px}}`;
}

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true, service: "ai-tools-launchpad", updatedAt: toolifyData.updatedAt });
    if (url.pathname === "/api/blueprint") return json(inferBlueprint(url.searchParams.get("keyword") || "ai resume optimizer"));
    if (url.pathname === "/api/toolify") return json(toolifyData);
    if (url.pathname === "/sitemap.xml") return sitemap();
    if (url.pathname === "/robots.txt") return robots();
    if (url.pathname === "/zh") return renderHome(url, "zh");
    if (url.pathname === "/" || url.pathname === "/index.html") return renderHome(url, "en");
    return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  },
};
