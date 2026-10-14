function decodeDdgLink(href: string): string {
  try {
    const u = new URL(href, "https://duckduckgo.com");
    return u.searchParams.get("uddg") || u.href;
  } catch {
    return href;
  }
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function parseResults(html: string): Array<{ title: string; url: string; snippet: string }> {
  const results: Array<{ title: string; url: string; snippet: string }> = [];

  // Разбиваем HTML на блоки результатов
  const blocks = html.split(/<div[^>]*class="[^"]*result[^"]*"[^>]*>/i);

  for (const block of blocks) {
    const titleMatch = block.match(/<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!titleMatch) continue;

    const url = decodeDdgLink(titleMatch[1]);
    const title = stripTags(titleMatch[2]);

    let snippet = "";
    const snippetMatch = block.match(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i);
    if (snippetMatch) snippet = stripTags(snippetMatch[1]);
    else {
      const divSnippet = block.match(/<div[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/div>/i);
      if (divSnippet) snippet = stripTags(divSnippet[1]);
    }

    if (title && url) {
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

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const query = url.searchParams.get("q")?.trim();

  if (!query || query.length === 0 || query.length > 300) {
    return Response.json(
      { error: "Use ?q=query (max 300 chars)" },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const ddgUrl = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
    const ddg = await fetch(ddgUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ru,en;q=0.8"
      }
    });

    if (!ddg.ok) {
      return Response.json(
        { error: "DuckDuckGo error: " + ddg.status },
        { status: 502, headers: corsHeaders }
      );
    }

    const html = await ddg.text();
    const results = parseResults(html);

    return Response.json(
      { query, count: results.length, results },
      { headers: corsHeaders }
    );
  } catch (e) {
    return Response.json(
      { error: "Search error: " + (e as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
});
