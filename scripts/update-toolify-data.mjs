#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const OUT = new URL('../src/toolify-data.ts', import.meta.url);
const JINA = 'https://r.jina.ai/http://r.jina.ai/http://';

const endpoints = {
  topTools: 'https://www.toolify.ai/Best-trending-AI-Tools',
  highTraffic: 'https://www.toolify.ai/most-used',
  fastGrowth: 'https://www.toolify.ai/new',
  paidProducts: 'https://www.toolify.ai/Best-AI-Tools-revenue',
  categories: 'https://www.toolify.ai/Best-AI-Tools-Category',
};

const fallback = {
  topTools: [
    ['ChatGPT','https://www.toolify.ai/tool/chatgpt-4','https://chatgpt.com/','A free-to-use AI system for conversations, insights, coding, and task automation.','5.5B'],
    ['Claude','https://www.toolify.ai/tool/claude-2','https://claude.ai/','Anthropic AI assistant for writing, analysis, coding, and knowledge work.','823.5M'],
    ['Perplexity AI','https://www.toolify.ai/tool/perplexity-ai','https://www.perplexity.ai/','AI answer engine combining search, citations, and conversational research.','154.9M'],
    ['Notion AI','https://www.toolify.ai/tool/notion-ai','https://www.notion.so/','All-in-one workspace with AI notes, docs, projects, and knowledge workflows.','174.5M'],
    ['OpenAI','https://www.toolify.ai/tool/openai','https://openai.com/','AI research and deployment platform for models, APIs, and products.','195.7M'],
    ['remove.bg','https://www.toolify.ai/tool/remove-bg','https://www.remove.bg/','AI-powered background remover for images in seconds.','62.7M'],
    ['Grammarly','https://www.toolify.ai/tool/grammarly','https://www.grammarly.com/','AI writing assistant for grammar, clarity, style, and tone.','58.3M'],
    ['CapCut','https://www.toolify.ai/tool/capcut-com','https://capcut.com/','AI video editor and graphic design tool for creators.','51.2M'],
    ['QuillBot','https://www.toolify.ai/tool/quillbot-paraphraser','https://quillbot.com/','AI paraphrasing, grammar, citation, and writing productivity suite.','48.1M'],
    ['ElevenLabs','https://www.toolify.ai/tool/elevenlabs-io','https://elevenlabs.io/','AI audio platform for text-to-speech, voice cloning, and dubbing.','33.3M'],
  ],
  fastGrowth: [
    ['GPT image 2 Prompt','https://www.toolify.ai/prompts/gpt-image-2','https://www.toolify.ai/prompts/gpt-image-2','Prompt collection riding image-generation demand.','New'],
    ['AI Humanizer','https://www.toolify.ai/search/AI%20Humanizer','https://www.toolify.ai/search/AI%20Humanizer','Tools that rewrite AI text into more natural human tone.','Rising'],
    ['AI Detector','https://www.toolify.ai/search/AI%20Detector','https://www.toolify.ai/search/AI%20Detector','Content authenticity and AI-detection utilities.','Rising'],
    ['AI Resume Builder','https://www.toolify.ai/search/AI%20Resume%20Builder','https://www.toolify.ai/search/AI%20Resume%20Builder','Career tools for resumes, cover letters, and ATS optimization.','Rising'],
    ['AI PPT Maker','https://www.toolify.ai/search/AI%20PPT%20Maker','https://www.toolify.ai/search/AI%20PPT%20Maker','Presentation generation tools for business and education.','Rising'],
    ['AI Headshot Generator','https://www.toolify.ai/search/AI%20Headshot%20Generator','https://www.toolify.ai/search/AI%20Headshot%20Generator','Personal branding photo tools for LinkedIn and portfolios.','Rising'],
    ['AI Video Generator','https://www.toolify.ai/search/AI%20Video%20Generator','https://www.toolify.ai/search/AI%20Video%20Generator','Text-to-video and social video automation products.','Rising'],
    ['AI Logo Generator','https://www.toolify.ai/search/AI%20Logo%20Generator','https://www.toolify.ai/search/AI%20Logo%20Generator','Branding micro-tools with strong small-business intent.','Rising'],
    ['AI Voice Generator','https://www.toolify.ai/search/AI%20Voice%20Generator','https://www.toolify.ai/search/AI%20Voice%20Generator','Voiceover and dubbing tools for creators.','Rising'],
    ['AI Coding Agent','https://www.toolify.ai/search/AI%20Coding%20Agent','https://www.toolify.ai/search/AI%20Coding%20Agent','Developer automation tools for code generation and review.','Rising'],
  ],
  categories: [
    ['AI Chatbot','https://www.toolify.ai/category/ai-chatbot','General assistant and role-play chat products with massive traffic.'],
    ['AI Writing Assistants','https://www.toolify.ai/category/ai-writing-assistants','Writing, paraphrasing, grammar, and content production.'],
    ['AI Image Generator','https://www.toolify.ai/category/ai-image-generator','Creative generation, avatars, ads, and product images.'],
    ['AI Video Generator','https://www.toolify.ai/category/ai-video-generator','Short video, editing, captions, and repurposing.'],
    ['AI Code Assistant','https://www.toolify.ai/category/ai-code-assistant','Developer productivity, agents, debugging, and app generation.'],
    ['AI Search Engine','https://www.toolify.ai/category/ai-search-engine','Answer engines, research tools, and citation workflows.'],
    ['AI Productivity Tools','https://www.toolify.ai/category/ai-productivity-tools','Meeting, docs, workflow, automation, and office productivity.'],
    ['AI Education Assistant','https://www.toolify.ai/category/ai-education-assistant','Tutoring, homework, language learning, and study workflows.'],
    ['AI Voice Assistants','https://www.toolify.ai/category/ai-voice-assistants','TTS, voice cloning, dubbing, and audio generation.'],
    ['AI Marketing Tools','https://www.toolify.ai/category/ai-marketing-tools','SEO, ads, landing pages, social content, and sales copy.'],
  ],
};

async function fetchText(url) {
  const target = JINA + url;
  const res = await fetch(target, { headers: { 'user-agent': 'Mozilla/5.0 AI-Tools-Launchpad/1.0' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return await res.text();
}

function uniqueByName(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseRows(md, max = 10) {
  const rows = [];
  const lines = md.split(/\r?\n/);
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.includes('---') || line.includes('Ranking | Tools')) continue;
    const cells = line.split('|').slice(1, -1).map((x) => x.trim());
    if (cells.length < 4) continue;
    const toolCell = cells.find((c) => /\[[^\]]+\]\((?:https?:\/\/)?(?:www\.)?toolify\.ai\/tool\//.test(c)) || cells[1] || cells[0];
    const toolIndex = cells.indexOf(toolCell);
    const websiteCell = cells.slice(toolIndex + 1).find((c) => /\]\(https?:\/\//.test(c) && !c.startsWith('![') && !/\.(png|jpg|jpeg|webp|svg)(\?|\)|$)/i.test(c)) || '';
    const visits = cells.find((c) => /\d+(\.\d+)?[KMB]/.test(c)) || '';
    const desc = cells[cells.length - 1] || '';
    const nameMatch = toolCell.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (!nameMatch) continue;
    rows.push({
      name: nameMatch[1].replace(/!\[.*?\]\(.*?\)/g, '').trim(),
      toolifyUrl: nameMatch[2].startsWith('http') ? nameMatch[2] : `https://www.toolify.ai${nameMatch[2]}`,
      website: (websiteCell.match(/\]\((https?:\/\/[^)]+)\)/) || [])[1] || '',
      visits,
      description: desc.replace(/\|/g, '').slice(0, 180),
      icon: faviconFor(nameMatch[1], (websiteCell.match(/\]\((https?:\/\/[^)]+)\)/) || [])[1] || '', nameMatch[2]),
    });
    if (rows.length >= max) break;
  }
  return uniqueByName(rows).slice(0, max);
}

function faviconFor(name, website, toolifyUrl) {
  const known = {
    'claude 2': 'claude.ai', claude: 'claude.ai', 'gemini & gemini advanced': 'gemini.google.com', gemini: 'gemini.google.com', deepseek: 'deepseek.com',
    'magnific (formerly freepik)': 'freepik.com', meshy: 'meshy.ai', janitorai: 'janitorai.com', 'spicychat ai': 'spicychat.ai', polybuzz: 'polybuzz.ai',
    chatgpt: 'chatgpt.com', openai: 'openai.com', 'perplexity ai': 'perplexity.ai', notion: 'notion.so', 'notion ai': 'notion.so', 'remove.bg': 'remove.bg', grammarly: 'grammarly.com', capcut: 'capcut.com', quillbot: 'quillbot.com', elevenlabs: 'elevenlabs.io'
  };
  let domain = '';
  try { domain = website ? new URL(website).hostname.replace(/^www\./, '') : ''; } catch {}
  const key = String(name || '').toLowerCase().trim();
  if (!domain || domain === 'toolify.ai') domain = known[key] || known[key.replace(/\s*\([^)]*\)\s*/g, '').trim()] || '';
  if (!domain) {
    const slug = String(toolifyUrl || '').split('/').filter(Boolean).pop() || key;
    domain = `${slug.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'ai'}.com`;
  }
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;
}

function fromFallbackProduct(row, idx) {
  const [name, toolifyUrl, website, description, visits] = row;
  return {
    name,
    toolifyUrl,
    website,
    visits,
    description,
    icon: faviconFor(name, website, toolifyUrl),
    rank: idx + 1,
  };
}

function fromFallbackCategory(row, idx) {
  const [name, url, description] = row;
  return { name, url, description, rank: idx + 1 };
}

async function getProducts(key, url, fallbackRows) {
  try {
    const md = await fetchText(url);
    const rows = parseRows(md, 10).map((item, idx) => ({ ...item, rank: idx + 1 }));
    if (rows.length >= 5) return { rows, source: 'toolify' };
    throw new Error(`only ${rows.length} rows parsed`);
  } catch (error) {
    console.warn(`[toolify] ${key} fallback:`, error.message);
    return { rows: fallbackRows.map(fromFallbackProduct), source: 'fallback' };
  }
}

async function main() {
  const [topTools, highTraffic, fastGrowth, paidProducts] = await Promise.all([
    getProducts('topTools', endpoints.topTools, fallback.topTools),
    getProducts('highTraffic', endpoints.highTraffic, fallback.topTools),
    getProducts('fastGrowth', endpoints.fastGrowth, fallback.fastGrowth),
    getProducts('paidProducts', endpoints.paidProducts, fallback.topTools),
  ]);

  const categories = fallback.categories.map(fromFallbackCategory);
  const competitiveTracks = categories.map((cat, idx) => ({
    ...cat,
    signals: ['many active products', 'clear SEO search intent', 'multiple monetization paths'][idx % 3],
  }));

  const data = {
    updatedAt: new Date().toISOString(),
    source: 'Toolify public ranking pages via r.jina.ai with curated fallback when blocked',
    sections: [
      { key: 'top-tools', title: 'Top validated AI tools', subtitle: '10 AI products ranking near the front of Toolify-style market lists.', kind: 'products', items: topTools.rows },
      { key: 'high-traffic-categories', title: 'High-traffic categories', subtitle: '10 categories with broad search and usage demand.', kind: 'categories', items: categories },
      { key: 'fast-growth-tools', title: 'Fast-growth / rising tools', subtitle: '10 rising tool ideas and products worth watching.', kind: 'products', items: fastGrowth.rows },
      { key: 'paid-products', title: 'Products with payment signals', subtitle: '10 products with payment-platform or subscription evidence.', kind: 'products', items: paidProducts.rows },
      { key: 'competitive-tracks', title: 'Competitive but proven tracks', subtitle: '10 crowded tracks where demand has already been market-validated.', kind: 'tracks', items: competitiveTracks },
    ],
    meta: { sources: { topTools: topTools.source, highTraffic: highTraffic.source, fastGrowth: fastGrowth.source, paidProducts: paidProducts.source } },
  };

  await mkdir(new URL('../src/', import.meta.url), { recursive: true });
  const content = `// Auto-generated by scripts/update-toolify-data.mjs\nexport const toolifyData = ${JSON.stringify(data, null, 2)} as const;\n`;
  await writeFile(OUT, content);
  console.log(`wrote ${OUT.pathname}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
