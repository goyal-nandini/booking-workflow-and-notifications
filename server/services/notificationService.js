const Notification = require("../models/Notification");
const { TEMPLATES, renderTemplate } = require("../constants/workflow");

// MOCK. To go live, replace only this function with a WhatsApp Business API / Twilio call.
async function mockSendWhatsApp(phone, message) {
  console.log(`[WhatsApp mock] to ${phone}: ${message}`);
}

// Builds the message from the template, "sends" it, and stores the result.
// A messaging failure is recorded as "failed" and must not undo the status change.
async function sendNotification(booking) {
  const message = renderTemplate(TEMPLATES[booking.status], {
    devoteeName: booking.devoteeName,
    pujaName: booking.pujaName,
    bookingId: booking.bookingId,
  });

  let deliveryStatus = "sent";
  try {
    await mockSendWhatsApp(booking.phone, message);
  } catch (err) {
    console.error("Notification send failed:", err.message);
    deliveryStatus = "failed";
  }

  return Notification.create({
    bookingId: booking.bookingId,
    status: booking.status,
    message,
    deliveryStatus,
  });
}

module.exports = { sendNotification, mockSendWhatsApp };
