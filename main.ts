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

function parseLiteResults(html: string): Array<{ title: string; url: string; snippet: string }> {
  const results: Array<{ title: string; url: string; snippet: string }> = [];

  // DuckDuckGo Lite: результаты в <a class="result-link">
  const linkRegex = /<a[^>]*class="result-link"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const snippetRegex = /<td[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;

  const links: Array<{ url: string; title: string }> = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    links.push({
      url: decodeHtml(match[1]),
      title: decodeHtml(stripTags(match[2]))
    });
  }

  const snippets: string[] = [];
  while ((match = snippetRegex.exec(html)) !== null) {
    snippets.push(decodeHtml(stripTags(match[1])));
  }

  for (let i = 0; i < links.length; i++) {
    if (links[i].title && links[i].url) {
      results.push({
        title: links[i].title,
        url: links[i].url,
        snippet: snippets[i] || ""
      });
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
    // Используем Lite-версию DuckDuckGo — она проще и чаще пропускает
    const ddgUrl = "https://lite.duckduckgo.com/lite/?q=" + encodeURIComponent(query);
    const ddg = await fetch(ddgUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ru,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml"
      }
    });

    if (!ddg.ok) {
      return Response.json(
        { error: "DuckDuckGo error: " + ddg.status },
        { status: 502, headers: corsHeaders }
      );
    }

    const html = await ddg.text();
    const results = parseLiteResults(html);

    // Возвращаем также кусок HTML для отладки, если 0 результатов
    if (results.length === 0) {
      return Response.json(
        {
          query,
          count: 0,
          results: [],
          debug: {
            htmlLength: html.length,
            htmlStart: html.slice(0, 500)
          }
        },
        { headers: corsHeaders }
      );
    }

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
