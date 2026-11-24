// Single source of truth for the workflow order and message templates.
const WORKFLOW_STATUSES = [
  "Booking Confirmed",
  "Puja Started",
  "Puja Completed",
  "Video Available",
];

const TEMPLATES = {
  "Booking Confirmed":
    "🙏 Namaste {{devoteeName}}, your booking {{bookingId}} for {{pujaName}} is confirmed.",
  "Puja Started":
    "🙏 {{devoteeName}}, your {{pujaName}} (Booking {{bookingId}}) has started.",
  "Puja Completed":
    "🙏 {{devoteeName}}, your {{pujaName}} (Booking {{bookingId}}) is completed. Blessings to you and your family.",
  "Video Available":
    "🎥 {{devoteeName}}, the video of your {{pujaName}} (Booking {{bookingId}}) is now available.",
};

// Replaces every {{key}} with the matching value from data.
function renderTemplate(template, data) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => data[key] ?? "");
}

// Returns the only status a booking is allowed to move to, or null at the end.
function getNextStatus(current) {
  const i = WORKFLOW_STATUSES.indexOf(current);
  return i >= 0 && i < WORKFLOW_STATUSES.length - 1 ? WORKFLOW_STATUSES[i + 1] : null;
}

module.exports = { WORKFLOW_STATUSES, TEMPLATES, renderTemplate, getNextStatus };
