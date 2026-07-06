import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { COLLEGES, eventsByCollege } from "@/lib/mock-data";

export default defineTool({
  name: "list_colleges",
  title: "List colleges",
  description:
    "List colleges on Sprint. Optionally filter by city or district (case-insensitive).",
  inputSchema: {
    city: z.string().optional().describe("Filter by city, e.g. Chennai."),
    district: z.string().optional().describe("Filter by district."),
    query: z.string().optional().describe("Free-text search over college name."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ city, district, query }) => {
    const cityLc = city?.toLowerCase();
    const districtLc = district?.toLowerCase();
    const q = query?.toLowerCase();
    const results = COLLEGES.filter((c) => {
      if (cityLc && c.city.toLowerCase() !== cityLc) return false;
      if (districtLc && c.district.toLowerCase() !== districtLc) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.short.toLowerCase().includes(q)) return false;
      return true;
    }).map((c) => ({
      id: c.id,
      name: c.name,
      short: c.short,
      city: c.city,
      district: c.district,
      state: c.state,
      eventCount: eventsByCollege(c.id).length,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { colleges: results, total: results.length },
    };
  },
});
