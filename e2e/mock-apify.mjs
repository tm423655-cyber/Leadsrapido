// Servidor que imita a API do Apify para testes automatizados (nenhum dado real).
import http from "node:http";

const PORT = Number(process.env.MOCK_APIFY_PORT ?? 4010);
const TOKEN = "test-token";
const runs = new Map();
let lastInput = null;
let lastQuery = null;
let runsStarted = 0;

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function items(input) {
  const [city] = String(input.locationQuery ?? "").split(",");
  const out = [];
  for (const niche of input.searchStringsArray ?? []) {
    if (/nada/i.test(niche)) continue;
    const base = niche.replace(/s$/, "");
    out.push(
      { title: `${base} Sem Site Teste`, categoryName: base, searchString: niche, address: `Rua Um, 100 - Centro, ${city} - SP, 14400-000`, street: "Rua Um, 100", neighborhood: "Centro", city, state: "São Paulo", postalCode: "14400-000", phone: "(16) 99111-2222", phoneUnformatted: "+5516991112222", website: null, totalScore: 4.7, reviewsCount: 58, url: `https://www.google.com/maps/search/?api=1&query=x&query_place_id=A${niche.length}`, placeId: `A-${niche}`, scrapedAt: "2026-09-23T10:00:00.000Z", permanentlyClosed: false },
      { title: `${base} Com Site Teste`, categoryName: base, searchString: niche, address: `Av. Dois, 200, ${city} - SP`, street: "Av. Dois, 200", city, state: "São Paulo", phone: "(16) 3722-3333", phoneUnformatted: "+551637223333", website: "https://www.exemplo-com-site.com.br/", totalScore: 4.2, reviewsCount: 12, url: "https://www.google.com/maps/place/x", placeId: `B-${niche}`, scrapedAt: "2026-09-23T10:00:00.000Z" },
      { title: `${base} Só Instagram`, categoryName: base, searchString: niche, address: `Rua Três, 3, ${city} - SP`, street: "Rua Três, 3", city, state: "São Paulo", phone: null, website: "https://www.instagram.com/perfil_teste/", totalScore: 3.8, reviewsCount: 4, placeId: `C-${niche}` },
      { title: `${base} Fechada`, searchString: niche, city, permanentlyClosed: true, placeId: `D-${niche}` },
      { title: `${base} Cidade Vizinha`, categoryName: base, searchString: niche, city: "Restinga", state: "São Paulo", street: "Rua X, 1", phone: "(16) 99999-0000", website: null, totalScore: 5, reviewsCount: 2, placeId: `E-${niche}` },
    );
  }
  return out;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname === "/__last-input") return send(res, 200, { input: lastInput, query: lastQuery, runsStarted });
  if (req.headers.authorization !== `Bearer ${TOKEN}`) return send(res, 401, { error: { type: "token-not-valid", message: "Invalid token" } });

  let body = "";
  for await (const chunk of req) body += chunk;

  const startMatch = /^\/v2\/acts\/([^/]+)\/runs$/.exec(url.pathname);
  if (req.method === "POST" && startMatch) {
    const input = JSON.parse(body || "{}");
    lastInput = input;
    runsStarted += 1;
    lastQuery = Object.fromEntries(url.searchParams);
    const niches = (input.searchStringsArray ?? []).join(" ");
    if (/limite/i.test(niches)) return send(res, 429, { error: { type: "rate-limit-exceeded", message: "Too many requests" } });
    if (/credito/i.test(niches)) return send(res, 402, { error: { type: "not-enough-usage-to-run-paid-actor", message: "No credits" } });
    const id = Math.random().toString(36).slice(2, 12).padEnd(10, "x") + "RUN";
    runs.set(id, { input, polls: 0 });
    return send(res, 201, { data: { id, status: "RUNNING", defaultDatasetId: `ds${id}` } });
  }

  const runMatch = /^\/v2\/actor-runs\/([A-Za-z0-9]+)(\/abort|\/dataset\/items)?$/.exec(url.pathname);
  if (runMatch) {
    const run = runs.get(runMatch[1]);
    if (!run) return send(res, 404, { error: { type: "record-not-found", message: "Run not found" } });
    if (runMatch[2] === "/abort") {
      run.aborted = true;
      return send(res, 200, { data: { id: runMatch[1], status: "ABORTED" } });
    }
    if (runMatch[2] === "/dataset/items") {
      const all = items(run.input);
      // Imita o filtro "website" do Google Maps Scraper.
      return send(res, 200, run.input.website === "withoutWebsite" ? all.filter((p) => !p.website) : all);
    }
    run.polls += 1;
    const status = run.aborted ? "ABORTED" : run.polls >= 2 ? "SUCCEEDED" : "RUNNING";
    return send(res, 200, { data: { id: runMatch[1], status, statusMessage: status === "RUNNING" ? "Crawled 3 of 10 places" : null, defaultDatasetId: `ds${runMatch[1]}` } });
  }
  send(res, 404, { error: { type: "page-not-found", message: "Not found" } });
});

server.listen(PORT, () => console.log(`mock apify on :${PORT}`));
