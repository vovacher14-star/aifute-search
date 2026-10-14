function decodeDdgLink(href) {
  try {
    const u = new URL(href, "https://duckduckgo.com");
    return u.searchParams.get("uddg") || u.href;
  } catch (e) {
    return href;
  }
}

async function parseResults(response) {
  const results = [];
  let current = null;
  const rewriter = new HTMLRewriter()
    .on("a.result__a", {
      element(el) {
        current = {
          title: "",
          url: decodeDdgLink(el.getAttribute("href") || ""),
          snippet: ""
        };
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
  await rewriter.transform(response).arrayBuffer();
  const cleaned = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const title = r.title.trim();
    const snippet = r.snippet.trim();
    if (title && r.url) {
      cleaned.push({ title: title, url: r.url, snippet: snippet });
    }
  }
  return cleaned;
}

export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "GET") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query || query.trim().length === 0 || query.length > 300) {
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

      const results = await parseResults(ddg);

      return Response.json(
        { query: query, count: results.length, results: results },
        { headers: corsHeaders }
      );
    } catch (e) {
      return Response.json(
        { error: "Search error: " + e.message },
        { status: 500, headers: corsHeaders }
      );
    }
  }
};
