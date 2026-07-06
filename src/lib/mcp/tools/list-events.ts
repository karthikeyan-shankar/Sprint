import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { EVENTS, CATEGORY_MAP, collegeById, type CategoryKey } from "@/lib/mock-data";

export default defineTool({
  name: "list_events",
  title: "List events",
  description:
    "List college events on Sprint. Optionally filter by category, city, or free-text query against title and description.",
  inputSchema: {
    category: z
      .string()
      .optional()
      .describe("Category key such as sports, hackathon, cultural, symposium, workshop."),
    city: z.string().optional().describe("Case-insensitive city filter (e.g. Chennai)."),
    query: z.string().optional().describe("Free-text search over title and description."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category, city, query, limit }) => {
    const q = query?.trim().toLowerCase();
    const cityLc = city?.trim().toLowerCase();
    const results = EVENTS.filter((e) => {
      if (category && e.category !== (category as CategoryKey)) return false;
      if (cityLc && e.city.toLowerCase() !== cityLc) return false;
      if (q && !(e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))) return false;
      return true;
    })
      .slice(0, limit ?? 20)
      .map((e) => ({
        id: e.id,
        title: e.title,
        category: CATEGORY_MAP[e.category]?.label ?? e.category,
        college: collegeById(e.collegeId)?.name ?? e.collegeId,
        city: e.city,
        date: e.date,
        status: e.status,
        fee: e.fee,
      }));

    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { events: results, total: results.length },
    };
  },
});
