const mongoose = require("mongoose");
const { WORKFLOW_STATUSES } = require("../constants/workflow");

const notificationSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, index: true },
  status: { type: String, enum: WORKFLOW_STATUSES, required: true }, // status that triggered it
  channel: { type: String, default: "whatsapp-mock" },
  message: { type: String, required: true },
  deliveryStatus: { type: String, enum: ["sent", "failed"], required: true },
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
