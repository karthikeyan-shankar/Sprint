import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { AppPageHeader } from "./app";
import { EmptyState } from "@/components/site/EmptyState";

export const Route = createFileRoute("/app/notifications")({
  component: Notifications,
});

function Notifications() {
  return (
    <div className="space-y-6">
      <AppPageHeader
        eyebrow="Notifications"
        title="Your Sprint feed"
        subtitle="Registration confirmations, event updates and announcements land here."
      />
      <EmptyState
        icon={Bell}
        title="No notifications yet."
        body="Once you publish or register for events, you'll get real-time updates here — venue changes, deadline reminders, and organizer announcements."
        primary={{ label: "Publish first event", to: "/app/create" }}
        secondary={{ label: "Explore events", to: "/explore" }}
      />
    </div>
  );
}
