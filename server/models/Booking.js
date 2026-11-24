const mongoose = require("mongoose");
const { WORKFLOW_STATUSES } = require("../constants/workflow");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, trim: true },
    devoteeName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    pujaName: { type: String, required: true, trim: true },
    pujaDate: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: WORKFLOW_STATUSES, default: WORKFLOW_STATUSES[0], index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
