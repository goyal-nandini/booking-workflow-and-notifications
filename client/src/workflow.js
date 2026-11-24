// Mirrors the server's order. The server stays the source of truth; this is only for display and filters.
export const WORKFLOW_STATUSES = ["Booking Confirmed", "Puja Started", "Puja Completed", "Video Available"];
export const statusClass = (s) => "badge s" + WORKFLOW_STATUSES.indexOf(s);
export const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
export const fmtDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
