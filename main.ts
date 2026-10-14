// Декодируем ссылки DuckDuckGo (uddg параметр)
function decodeDdgLink(href: string): string {
  try {
    const u = new URL(href, "https://duckduckgo.com");
    return u.searchParams.get("uddg") || u.href;
  } catch {
    return href;
  }
}

// Парсим HTML страницы DuckDuckGo
function parseResults(html: string): Array<{ title: string; url: string; snippet: string }> {
  const results: Array<{ title: string; url: string; snippet: string }> = [];

  // Ищем блоки результатов через регулярки (без DOM-парсера, чтобы работало в Deno)
  const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

  const titles: Array<{ url: string; title: string }> = [];
  let match;

  while ((match = resultRegex.exec(html)) !== null) {
    const rawUrl = match[1];
    const rawTitle = match[2];
    titles.push({
      url: decodeDdgLink(rawUrl),
      title: rawTitle.replace(/<[^>]+>/g, "").trim()
    });
  }

  const snippets: string[] = [];
  while ((match = snippetRegex.exec(html)) !== null) {
    snippets.push(match[1].replace(/<[^>]+>/g, "").trim());
  }

  for (let i = 0; i < titles.length; i++) {
    if (titles[i].title && titles[i].url) {
      results.push({
        title: titles[i].title,
        url: titles[i].url,
        snippet: snippets[i] || ""
      });
    }
  }

  return results.slice(0, 10);
}

// Основной обработчик
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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
