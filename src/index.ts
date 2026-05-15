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

const examples = [
  "ai resume optimizer",
  "ai background remover",
  "ai ppt maker",
  "ai humanizer",
  "youtube summary ai",
  "invoice generator ai",
];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "ai-tool";
}

function titleCase(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
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

  const mvp = [
    `One focused input form for ${keyword}`,
    "Instant before/after result preview",
    "Copy result and download as Markdown/Text",
    "Three preset modes: quick, professional, and SEO-friendly",
    "Landing page with clear pain point, demo, FAQ, and comparison section",
  ];

  const seoPages = [
    `/${slug}`,
    `/${slug}/free`,
    `/${slug}/alternatives`,
    `/${slug}/how-to`,
    `/blog/best-${slug}-tools`,
  ];

  const monetization = [
    "Free daily quota to capture SEO users",
    "Pro plan for higher limits and export formats",
    "Template packs or prompt packs as low-ticket products",
    "Affiliate links to adjacent SaaS tools after trust is built",
  ];

  const risks = [
    "Keyword may have high SEO competition; start with long-tail pages",
    "Model/API cost can eat margin; cache deterministic examples",
    "Avoid claiming guaranteed outcomes; use careful wording",
    "Ship a narrow workflow first instead of a generic AI toolbox",
  ];

  const launchChecklist = [
    "Validate keyword with Google autocomplete and Trends rising terms",
    "Study top 5 ranking pages and identify missing UX angles",
    "Publish the MVP page plus 3 long-tail SEO pages",
    "Add analytics, search console, and conversion events",
    "Collect 20 real user sessions before adding login or payment complexity",
  ];

  const specificity = keyword.split(/\s+/).filter(Boolean).length;
  const modifierBonus = /(free|generator|checker|optimizer|remover|maker|template|for)/.test(lower) ? 18 : 8;
  const nicheBonus = specificity >= 3 ? 22 : specificity === 2 ? 16 : 8;
  const score = Math.min(96, 42 + modifierBonus + nicheBonus + (isResume || isImage || isWriting || isVideo || isBusiness ? 10 : 4));

  return {
    keyword,
    slug,
    title,
    positioning: `A focused micro-tool that turns the search intent “${keyword}” into a one-screen workflow with a concrete output.`,
    audience,
    pains,
    mvp,
    seoPages,
    monetization,
    risks,
    launchChecklist,
    score,
  };
}

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...init.headers,
    },
  });
}

function renderList(items: string[]): string {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderBlueprintCard(blueprint: ToolBlueprint): string {
  return html`
    <section class="result-card" id="result">
      <div class="result-head">
        <div>
          <p class="eyebrow">MVP Blueprint</p>
          <h2>${escapeHtml(blueprint.title)}</h2>
          <p>${escapeHtml(blueprint.positioning)}</p>
        </div>
        <div class="score"><span>${blueprint.score}</span><small>/100</small></div>
      </div>
      <div class="grid two">
        <article><h3>Target users</h3><ul>${renderList(blueprint.audience)}</ul></article>
        <article><h3>User pains</h3><ul>${renderList(blueprint.pains)}</ul></article>
        <article><h3>MVP scope</h3><ul>${renderList(blueprint.mvp)}</ul></article>
        <article><h3>SEO pages</h3><ul>${renderList(blueprint.seoPages)}</ul></article>
        <article><h3>Monetization</h3><ul>${renderList(blueprint.monetization)}</ul></article>
        <article><h3>Risks</h3><ul>${renderList(blueprint.risks)}</ul></article>
      </div>
      <article class="checklist"><h3>Launch checklist</h3><ol>${blueprint.launchChecklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></article>
    </section>
  `;
}

function renderHome(url: URL, locale: Locale): Response {
  const keyword = url.searchParams.get("keyword") || "ai resume optimizer";
  const blueprint = inferBlueprint(keyword);
  const pageTitle = locale === "zh" ? "AI 工具站机会验证器" : "AI Tool Site Opportunity Builder";
  const subtitle = locale === "zh"
    ? "输入一个关键词，快速生成工具站定位、MVP、SEO 页面和变现路径。"
    : "Turn one search keyword into a focused AI micro-tool plan: positioning, MVP, SEO pages, risks, and monetization.";

  return new Response(html`<!doctype html>
<html lang="${locale === "zh" ? "zh-CN" : "en"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pageTitle)} · AI Tools Launchpad</title>
  <meta name="description" content="Validate an AI tool-site idea from one keyword. Generate MVP scope, SEO pages, target users, monetization and launch checklist." />
  <link rel="canonical" href="https://tools.efwmcstyle.ccwu.cc/" />
  <meta property="og:title" content="${escapeHtml(pageTitle)}" />
  <meta property="og:description" content="${escapeHtml(subtitle)}" />
  <meta property="og:type" content="website" />
  <style>${style()}</style>
</head>
<body>
  <header class="hero">
    <nav><strong>AI Tools Launchpad</strong><a href="/api/blueprint?keyword=${encodeURIComponent(keyword)}">API</a></nav>
    <div class="hero-grid">
      <div>
        <p class="eyebrow">Keyword → Tool Site → Launch</p>
        <h1>${escapeHtml(pageTitle)}</h1>
        <p class="subtitle">${escapeHtml(subtitle)}</p>
        <form method="GET" action="/" class="search">
          <input name="keyword" value="${escapeHtml(keyword)}" placeholder="ai resume optimizer" />
          <button type="submit">Build blueprint</button>
        </form>
        <div class="chips">${examples.map((item) => `<a href="/?keyword=${encodeURIComponent(item)}#result">${escapeHtml(item)}</a>`).join("")}</div>
      </div>
      <div class="mag-card">
        <span>01</span>
        <h2>Small tools win by being painfully specific.</h2>
        <p>One keyword, one pain, one output. Ship the first version before building accounts, dashboards, or payment complexity.</p>
      </div>
    </div>
  </header>
  <main>
    <section class="method">
      <p class="eyebrow">Tutorial distilled</p>
      <h2>From overseas search demand to a live tool site</h2>
      <div class="grid four">
        <article><b>1. Find demand</b><p>Use rankings, Trends, autocomplete, competitor pages, and sitemap updates.</p></article>
        <article><b>2. Write MVP</b><p>Define audience, pain, scope, page structure, and success signals.</p></article>
        <article><b>3. Build narrow</b><p>Make one workflow excellent before adding login, payment, and templates.</p></article>
        <article><b>4. Launch SEO</b><p>Deploy, index, measure real users, then iterate or switch keyword.</p></article>
      </div>
    </section>
    ${renderBlueprintCard(blueprint)}
  </main>
  <footer>Built on Cloudflare Workers · <a href="/zh">中文</a> · <a href="/">English</a></footer>
</body>
</html>`, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}

function style(): string {
  return String.raw`
    :root{--bg:#0b0e14;--panel:#121723;--text:#f4efe6;--muted:#a9b2c3;--line:#2a3447;--hot:#ff6b35;--gold:#ffd166;--green:#7bd88f}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% 0,#253454 0,transparent 30%),linear-gradient(135deg,#080a0f,#121723 45%,#0d111a);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit}nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:72px}nav a{color:var(--muted);text-decoration:none;border:1px solid var(--line);padding:8px 14px;border-radius:999px}.hero{padding:28px clamp(20px,5vw,72px) 72px}.hero-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:48px;align-items:end}.eyebrow{letter-spacing:.16em;text-transform:uppercase;color:var(--gold);font-size:12px;font-weight:800}h1{font-family:Georgia,serif;font-size:clamp(48px,9vw,104px);line-height:.9;margin:0 0 24px;max-width:980px}h2{font-family:Georgia,serif;font-size:clamp(30px,4vw,54px);line-height:1;margin:0 0 18px}h3{margin:0 0 12px;font-size:18px}.subtitle{font-size:20px;color:var(--muted);max-width:760px;line-height:1.6}.search{display:flex;gap:12px;margin:34px 0 20px;max-width:760px}.search input{flex:1;padding:18px 20px;border-radius:18px;border:1px solid var(--line);background:#0e1320;color:var(--text);font-size:18px}.search button{border:0;border-radius:18px;background:linear-gradient(135deg,var(--hot),#ff9f1c);color:#1b0c04;font-weight:900;padding:0 24px;font-size:16px;cursor:pointer}.chips{display:flex;gap:10px;flex-wrap:wrap}.chips a{color:var(--muted);text-decoration:none;background:rgba(255,255,255,.06);border:1px solid var(--line);padding:8px 12px;border-radius:999px}.mag-card{border:1px solid var(--line);border-radius:32px;padding:34px;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.03));box-shadow:0 30px 80px rgba(0,0,0,.35)}.mag-card span{font-family:Georgia,serif;font-size:82px;color:var(--hot)}.mag-card p,.method p,li{color:var(--muted);line-height:1.6}main{padding:0 clamp(20px,5vw,72px) 72px}.method,.result-card{border-top:1px solid var(--line);padding-top:46px;margin-top:28px}.grid{display:grid;gap:18px}.grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}article{background:rgba(255,255,255,.045);border:1px solid var(--line);border-radius:24px;padding:22px}.result-head{display:flex;justify-content:space-between;gap:24px;align-items:start;margin-bottom:22px}.result-head p{color:var(--muted);max-width:760px}.score{min-width:132px;height:132px;border-radius:50%;display:grid;place-content:center;text-align:center;background:radial-gradient(circle,var(--green),#174a2b);color:#061308;font-weight:900}.score span{font-size:46px}.score small{font-size:14px}ul,ol{padding-left:20px;margin:0}.checklist{margin-top:18px;background:linear-gradient(135deg,rgba(255,209,102,.12),rgba(255,107,53,.08))}footer{border-top:1px solid var(--line);padding:28px clamp(20px,5vw,72px);color:var(--muted)}@media(max-width:900px){.hero-grid,.grid.two,.grid.four{grid-template-columns:1fr}.search{flex-direction:column}.search button{padding:16px}.result-head{flex-direction:column}.score{width:112px;height:112px}}
  `;
}

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ ok: true, service: "ai-tools-launchpad" });
    }

    if (url.pathname === "/api/blueprint") {
      return json(inferBlueprint(url.searchParams.get("keyword") || "ai resume optimizer"));
    }

    if (url.pathname === "/zh") {
      return renderHome(url, "zh");
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return renderHome(url, "en");
    }

    return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  },
};
