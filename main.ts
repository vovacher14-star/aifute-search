function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function parseBing(html: string): Array<{ title: string; url: string; snippet: string }> {
  const results: Array<{ title: string; url: string; snippet: string }> = [];

  // Bing: <li class="b_algo"> ... <h2><a href="...">Title</a></h2> ... <p>Snippet</p>
  const blockRegex = /<li[^>]*class="b_algo"[^>]*>([\s\S]*?)<\/li>/gi;
  let match;

  while ((match = blockRegex.exec(html)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<h2[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!titleMatch) continue;

    const url = decodeHtml(titleMatch[1]);
    const title = decodeHtml(stripTags(titleMatch[2]));

    let snippet = "";
    const snippetMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (snippetMatch) snippet = decodeHtml(stripTags(snippetMatch[1]));

    if (title && url && url.startsWith("http")) {
      results.push({ title, url, snippet });
    }
  }

  return results.slice(0, 10);
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const url = new URL(req.url);
  const query = url.searchParams.get("q")?.trim();

  if (!query || query.length === 0 || query.length > 300) {
    return Response.json({ error: "Use ?q=query (max 300 chars)" }, { status: 400, headers: corsHeaders });
  }

  try {
    const bingUrl = "https://www.bing.com/search?q=" + encodeURIComponent(query) + "&setlang=ru";
    const bing = await fetch(bingUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ru,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml"
      }
    });

    if (!bing.ok) {
      return Response.json({ error: "Bing error: " + bing.status }, { status: 502, headers: corsHeaders });
    }

    const html = await bing.text();
    const results = parseBing(html);

    if (results.length === 0) {
      return Response.json({
        query, count: 0, results: [],
        debug: { htmlLength: html.length, htmlStart: html.slice(0, 800) }
      }, { headers: corsHeaders });
    }

    return Response.json({ query, count: results.length, results }, { headers: corsHeaders });
  } catch (e) {
    return Response.json({ error: "Search error: " + (e as Error).message }, { status: 500, headers: corsHeaders });
  }
});
