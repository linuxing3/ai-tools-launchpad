export type MonetizationIdea = {
  readonly rank: number;
  readonly title: string;
  readonly description: string;
  readonly fit: string;
};

export const monetizationIdeas: readonly MonetizationIdea[] = [
  {
    rank: 1,
    title: "Affiliate deep links",
    description: "Route clicks to original AI products with optional partner parameters when the vendor has a public affiliate program.",
    fit: "Best first move: matches product-card intent, does not require huge pageviews, and works before ad-network approval."
  },
  {
    rank: 2,
    title: "Sponsored category slot",
    description: "Sell one clearly labeled sponsored card inside high-intent categories such as AI video, AI chatbot, and writing tools.",
    fit: "Good once traffic by category is measurable."
  },
  {
    rank: 3,
    title: "Newsletter sponsorship",
    description: "Capture subscribers from ranking pages and sell a weekly placement to AI tools targeting builders and marketers.",
    fit: "Strong long-term CPM, needs list growth."
  },
  {
    rank: 4,
    title: "Google AdSense / display ads",
    description: "Add responsive ad slots to long category pages after search traffic stabilizes.",
    fit: "Simple but usually lower revenue until pageviews are high."
  },
  {
    rank: 5,
    title: "Tool launch submission fee",
    description: "Let founders pay to submit or fast-track review of a product listing.",
    fit: "Works after the directory has authority."
  },
  {
    rank: 6,
    title: "Featured review article",
    description: "Publish an editorial-style review page with screenshots, alternatives, and comparison tables.",
    fit: "High conversion but needs content operations."
  },
  {
    rank: 7,
    title: "Lead generation for agencies",
    description: "Collect buyer intent for automation, chatbot, video, or SEO tooling and sell qualified leads.",
    fit: "Good for B2B categories, requires compliance and CRM."
  },
  {
    rank: 8,
    title: "Paid API / dataset",
    description: "Package ranking, category, and growth signals as a small paid data feed for builders.",
    fit: "Attractive if data refresh becomes reliable and differentiated."
  },
  {
    rank: 9,
    title: "Job board / talent placement",
    description: "Add AI tooling jobs or expert marketplace listings around popular categories.",
    fit: "Good ecosystem play, not immediate."
  },
  {
    rank: 10,
    title: "Digital templates and playbooks",
    description: "Sell prompt packs, tool-stack templates, comparison spreadsheets, and launch checklists.",
    fit: "Useful add-on for builders, needs product packaging."
  }
];

export const affiliatePartners: Record<string, string> = {
  "grammarly.com": "https://www.grammarly.com/affiliates",
  "notion.so": "https://www.notion.so/help/notion-affiliate-program",
  "hubspot.com": "https://www.hubspot.com/partners/affiliates",
  "replit.com": "https://replit.com/site/bounties",
  "photoroom.com": "https://www.photoroom.com/affiliate-program",
  "veed.io": "https://www.veed.io/affiliate-program",
  "quillbot.com": "https://quillbot.com/affiliate-program",
  "elevenlabs.io": "https://elevenlabs.io/partners",
  "perplexity.ai": "https://www.perplexity.ai/enterprise",
  "openrouter.ai": "https://openrouter.ai/"
};
