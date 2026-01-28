import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PageData {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  textContent: string;
  images: string[];
  links: { internal: string[]; external: string[] };
  colors: string[];
  fonts: string[];
}

interface ScrapeResult {
  baseUrl: string;
  pages: PageData[];
  scrapedAt: string;
  totalPages: number;
}

// Normalize URL to ensure https://
function normalizeUrl(url: string): string {
  let normalized = url.trim().toLowerCase();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  // Remove trailing slash
  return normalized.replace(/\/$/, '');
}

// Get base domain from URL
function getBaseDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url;
  }
}

// Extract colors from CSS content
function extractColors(html: string): string[] {
  const colorPatterns = [
    /#[0-9a-fA-F]{6}\b/g,
    /#[0-9a-fA-F]{3}\b/g,
    /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi,
    /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/gi,
  ];
  
  const colors = new Set<string>();
  for (const pattern of colorPatterns) {
    const matches = html.match(pattern) || [];
    matches.forEach(color => colors.add(color.toLowerCase()));
  }
  return Array.from(colors).slice(0, 20);
}

// Extract font families from CSS content
function extractFonts(html: string): string[] {
  const fontPattern = /font-family:\s*([^;}"]+)/gi;
  const fonts = new Set<string>();
  
  let match;
  while ((match = fontPattern.exec(html)) !== null) {
    const fontFamily = match[1]
      .split(',')
      .map(f => f.trim().replace(/['"]/g, ''))
      .filter(f => f && !['inherit', 'initial', 'unset', 'sans-serif', 'serif', 'monospace'].includes(f.toLowerCase()));
    
    fontFamily.forEach(f => fonts.add(f));
  }
  
  return Array.from(fonts).slice(0, 10);
}

// Scrape a single page
async function scrapePage(url: string, baseDomain: string): Promise<PageData | null> {
  try {
    console.log(`Scraping page: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`Page ${url} returned ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    if (!doc) {
      console.log(`Failed to parse HTML for ${url}`);
      return null;
    }
    
    // Extract title
    const titleEl = doc.querySelector('title');
    const title = titleEl?.textContent?.trim() || '';
    
    // Extract meta description
    const metaDesc = doc.querySelector('meta[name="description"]');
    const metaDescription = metaDesc?.getAttribute('content') || '';
    
    // Extract headings
    const headings: string[] = [];
    for (const tag of ['h1', 'h2', 'h3']) {
      doc.querySelectorAll(tag).forEach((el: any) => {
        const text = el.textContent?.trim();
        if (text && text.length < 200) {
          headings.push(text);
        }
      });
    }
    
    // Extract text content (from main content areas)
    const contentSelectors = ['main', 'article', '.content', '#content', '.main', '#main', 'body'];
    let textContent = '';
    
    for (const selector of contentSelectors) {
      const el = doc.querySelector(selector);
      if (el) {
        // Remove script and style content
        el.querySelectorAll('script, style, nav, header, footer').forEach((s: any) => s.remove());
        textContent = el.textContent?.replace(/\s+/g, ' ').trim() || '';
        if (textContent.length > 100) break;
      }
    }
    
    // Limit text content
    textContent = textContent.slice(0, 5000);
    
    // Extract images
    const images: string[] = [];
    doc.querySelectorAll('img').forEach((img: any) => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        try {
          const imgUrl = new URL(src, url).href;
          if (!images.includes(imgUrl)) {
            images.push(imgUrl);
          }
        } catch {}
      }
    });
    
    // Extract links
    const internalLinks: string[] = [];
    const externalLinks: string[] = [];
    
    doc.querySelectorAll('a[href]').forEach((a: any) => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      
      try {
        const linkUrl = new URL(href, url).href;
        if (linkUrl.startsWith(baseDomain)) {
          if (!internalLinks.includes(linkUrl)) {
            internalLinks.push(linkUrl);
          }
        } else {
          if (!externalLinks.includes(linkUrl)) {
            externalLinks.push(linkUrl);
          }
        }
      } catch {}
    });
    
    // Extract colors and fonts from inline styles and style tags
    const colors = extractColors(html);
    const fonts = extractFonts(html);
    
    return {
      url,
      title,
      metaDescription,
      headings: headings.slice(0, 30),
      textContent,
      images: images.slice(0, 50),
      links: {
        internal: internalLinks.slice(0, 50),
        external: externalLinks.slice(0, 20),
      },
      colors,
      fonts,
    };
    
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

// Find pages to scrape from internal links
function findPagesToScrape(homepage: PageData, baseDomain: string): string[] {
  const commonPaths = [
    '/about', '/about-us', '/about-us/', '/company', '/our-story', '/who-we-are',
    '/products', '/services', '/shop', '/store', '/offerings', '/solutions',
    '/contact', '/contact-us', '/get-in-touch',
    '/blog', '/news', '/articles', '/insights',
    '/pricing', '/plans',
    '/team', '/our-team',
    '/faq', '/faqs', '/help',
    '/features', '/how-it-works',
    '/portfolio', '/work', '/case-studies', '/clients',
  ];
  
  const pagesToScrape: string[] = [];
  const internalLinks = homepage.links.internal;
  
  // Check for common paths in internal links
  for (const path of commonPaths) {
    const matchingLink = internalLinks.find(link => {
      const pathname = new URL(link).pathname.toLowerCase();
      return pathname === path || pathname === path + '/';
    });
    
    if (matchingLink && pagesToScrape.length < 9) {
      pagesToScrape.push(matchingLink);
    }
  }
  
  // If we don't have enough pages, add some from the main nav
  if (pagesToScrape.length < 5) {
    for (const link of internalLinks) {
      if (pagesToScrape.length >= 9) break;
      if (!pagesToScrape.includes(link)) {
        // Skip common non-content pages
        const pathname = new URL(link).pathname.toLowerCase();
        if (pathname === '/' || pathname.includes('login') || pathname.includes('signup') || 
            pathname.includes('cart') || pathname.includes('checkout') || pathname.includes('privacy') ||
            pathname.includes('terms') || pathname.includes('cookie')) {
          continue;
        }
        pagesToScrape.push(link);
      }
    }
  }
  
  return pagesToScrape;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { websiteUrl, userId } = await req.json();
    
    if (!websiteUrl) {
      return new Response(
        JSON.stringify({ error: 'Website URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting scrape for: ${websiteUrl}`);
    
    // Normalize URL
    const normalizedUrl = normalizeUrl(websiteUrl);
    const baseDomain = getBaseDomain(normalizedUrl);
    
    console.log(`Normalized URL: ${normalizedUrl}, Base domain: ${baseDomain}`);
    
    // Scrape homepage first
    const homepage = await scrapePage(normalizedUrl, baseDomain);
    
    if (!homepage) {
      return new Response(
        JSON.stringify({ error: 'Failed to scrape homepage. Please check the URL and try again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const pages: PageData[] = [homepage];
    
    // Find and scrape additional pages
    const pagesToScrape = findPagesToScrape(homepage, baseDomain);
    console.log(`Found ${pagesToScrape.length} pages to scrape`);
    
    // Scrape additional pages (limit to 9 more for total of 10)
    for (const pageUrl of pagesToScrape.slice(0, 9)) {
      const pageData = await scrapePage(pageUrl, baseDomain);
      if (pageData) {
        pages.push(pageData);
      }
      // Small delay between requests to be polite
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const result: ScrapeResult = {
      baseUrl: normalizedUrl,
      pages,
      scrapedAt: new Date().toISOString(),
      totalPages: pages.length,
    };
    
    console.log(`Successfully scraped ${pages.length} pages`);
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Scrape error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Scraping failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});