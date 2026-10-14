function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
}

// Bing RSS — машинный формат, не даёт капчу
async function searchBingRSS(query: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
  const url = "https://www.bing.com/search?q=" + encodeURIComponent(query) + "&format=rss";
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });
  if (!res.ok) return [];
  const xml = await res.text();
  const results: Array<{ title: string; url: string; snippet: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/i);
    const descMatch = item.match(/<description>([\s\S]*?)<\/description>/i);
    if (titleMatch && linkMatch) {
      results.push({
        title: decodeHtml(stripTags(titleMatch[1])),
        url: linkMatch[1].trim(),
        snippet: descMatch ? decodeHtml(stripTags(descMatch[1])) : ""
      });
    }
  }
  return results.slice(0, 10);
}

// Wikipedia API — всегда работает с серверов
async function searchWikipedia(query: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
  const url = "https://ru.wikipedia.org/w/api.php?action=opensearch&search=" + encodeURIComponent(query) + "&limit=5&format=json";
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const results: Array<{ title: string; url: string; snippet: string }> = [];
  if (Array.isArray(data[1])) {
    for (let i = 0; i < data[1].length; i++) {
      results.push({
        title: data[1][i],
        url: data[3][i] || "",
        snippet: data[2][i] || ""
      });
    }
  }
  return results;
}

// Основной обработчик
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
    // Ищем параллельно в Bing RSS + Wikipedia
    const [bingResults, wikiResults] = await Promise.all([
      searchBingRSS(query).catch(() => []),
      searchWikipedia(query).catch(() => [])
    ]);

    // Объединяем: сначала Bing (свежие), потом Wikipedia (факты)
    const allResults = [...bingResults, ...wikiResults];

    if (allResults.length === 0) {
      return Response.json({
        query, count: 0, results: [],
        debug: { message: "Both Bing and Wikipedia returned empty" }
      }, { headers: corsHeaders });
    }

    return Response.json({ query, count: allResults.length, results: allResults }, { headers: corsHeaders });
  } catch (e) {
    return Response.json({ error: "Search error: " + (e as Error).message }, { status: 500, headers: corsHeaders });
  }
});
