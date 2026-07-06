import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { eventById, collegeById, CATEGORY_MAP } from "@/lib/mock-data";

export default defineTool({
  name: "get_event",
  title: "Get event",
  description: "Get the full details of a Sprint event by its ID.",
  inputSchema: {
    id: z.string().min(1).describe("Event ID, e.g. 'e1'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }) => {
    const event = eventById(id);
    if (!event) {
      return {
        content: [{ type: "text", text: `No event found with id '${id}'.` }],
        isError: true,
      };
    }
    const enriched = {
      ...event,
      categoryLabel: CATEGORY_MAP[event.category]?.label ?? event.category,
      college: collegeById(event.collegeId)?.name ?? event.collegeId,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(enriched, null, 2) }],
      structuredContent: { event: enriched },
    };
  },
});
