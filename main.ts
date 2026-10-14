// Декодируем ссылки DuckDuckGo
function decodeDdgLink(href: string): string {
  try {
    const u = new URL(href, "https://duckduckgo.com");
    return u.searchParams.get("uddg") || u.href;
  } catch {
    return href;
  }
}

// Парсим результаты через HTMLRewriter (работает в Deno)
async function parseResults(html: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
  const results: Array<{ title: string; url: string; snippet: string }> = [];
  let current: { title: string; url: string; snippet: string } | null = null;

  const rewriter = new HTMLRewriter()
    .on("a.result__a", {
      element(el) {
        const href = el.getAttribute("href") || "";
        current = { title: "", url: decodeDdgLink(href), snippet: "" };
        results.push(current);
      },
      text(t) {
        if (current) current.title += t.text;
      }
    })
    .on("a.result__snippet, div.result__snippet", {
      text(t) {
        if (current) current.snippet += t.text;
      }
    });

  await rewriter.transform(new Response(html)).arrayBuffer();

  return results
    .map(r => ({ ...r, title: r.title.trim(), snippet: r.snippet.trim() }))
    .filter(r => r.title && r.url);
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
    const results = await parseResults(html);

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
