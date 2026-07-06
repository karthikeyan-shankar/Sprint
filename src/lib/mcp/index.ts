import { defineMcp } from "@lovable.dev/mcp-js";
import listEvents from "./tools/list-events";
import getEvent from "./tools/get-event";
import listColleges from "./tools/list-colleges";

export default defineMcp({
  name: "sprint-mcp",
  title: "Sprint — College Events",
  version: "0.1.0",
  instructions:
    "Sprint is a unified platform for college events across India. Use `list_events` to discover events (filter by category, city, or query), `get_event` to fetch full details for one event by ID, and `list_colleges` to browse participating colleges.",
  tools: [listEvents, getEvent, listColleges],
});
