import { createFileRoute } from "@tanstack/react-router";

const SITE = "https://utkarshsingh.lovable.app";
const ROUTES = ["/", "/auth"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  (r) => `  <url><loc>${SITE}${r}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq></url>`,
).join("\n")}
</urlset>`;
        return new Response(body, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
