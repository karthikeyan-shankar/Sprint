import type { RegistrationDoc, EventDoc } from "./events";

export interface MessageTemplate {
  id: string;
  label: string;
  subject: string;
  body: string; // supports {name}, {event}, {date}, {venue}, {fee}, {host}
}

export const TEMPLATES: MessageTemplate[] = [
  {
    id: "payment-reminder",
    label: "Payment reminder",
    subject: "Payment pending — {event}",
    body:
      "Hi {name},\n\nWe haven't received your payment for {event} yet. Please complete the ₹{fee} payment and share the transaction ID to confirm your spot.\n\n— Team {host}",
  },
  {
    id: "confirmed",
    label: "Registration confirmed",
    subject: "You're in — {event}",
    body:
      "Hi {name},\n\nYour registration for {event} on {date} at {venue} is confirmed. See you there!\n\n— Team {host}",
  },
  {
    id: "venue-update",
    label: "Venue / schedule update",
    subject: "Update: {event}",
    body:
      "Hi {name},\n\nQuick update for {event} — please note the latest venue and time: {venue}, {date}.\n\nReply here if you have questions.\n\n— Team {host}",
  },
  {
    id: "day-of",
    label: "Day-of instructions",
    subject: "Tomorrow: {event}",
    body:
      "Hi {name},\n\n{event} is tomorrow at {venue}, {date}. Please bring your college ID and reach 15 minutes early. Excited to see you!\n\n— Team {host}",
  },
];

export function fillTemplate(tpl: string, r: RegistrationDoc, e: EventDoc): string {
  return tpl
    .replaceAll("{name}", r.name || "there")
    .replaceAll("{event}", e.title)
    .replaceAll("{date}", `${e.date}${e.time ? ` · ${e.time}` : ""}`)
    .replaceAll("{venue}", `${e.venue}${e.city ? `, ${e.city}` : ""}`)
    .replaceAll("{fee}", String(e.fee || 0))
    .replaceAll("{host}", e.hostName || e.collegeName || "the organizer");
}

function digitsOnly(phone: string): string {
  const d = phone.replace(/\D/g, "");
  // If it looks like an Indian 10-digit number, prepend 91
  if (d.length === 10) return `91${d}`;
  return d;
}

export function whatsappLink(phone: string, message: string): string {
  const num = digitsOnly(phone);
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function batchMailto(emails: string[], subject: string, body: string): string {
  // bcc keeps recipients private
  return `mailto:?bcc=${emails.join(",")}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
