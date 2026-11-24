const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const { WORKFLOW_STATUSES, getNextStatus } = require("../constants/workflow");
const { sendNotification } = require("../services/notificationService");

const SORTABLE = ["pujaDate", "amount", "createdAt"];
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Next ID = highest existing number + 1 (AS-1010 -> AS-1011).
// Works because IDs are all the same length, so string sort matches number sort.
async function nextBookingId() {
  const last = await Booking.findOne().sort({ bookingId: -1 });
  const lastNumber = last ? parseInt(last.bookingId.split("-")[1], 10) : 1000;
  return `AS-${lastNumber + 1}`;
}

// GET /api/bookings?search=&status=&sortBy=&order=
exports.listBookings = async (req, res) => {
  try {
    const { search, status, sortBy = "createdAt", order = "desc" } = req.query;
    const filter = {};

    if (status) {
      if (!WORKFLOW_STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status filter" });
      filter.status = status;
    }
    if (search && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ devoteeName: rx }, { pujaName: rx }, { bookingId: rx }];
    }

    const sortField = SORTABLE.includes(sortBy) ? sortBy : "createdAt";
    const bookings = await Booking.find(filter).sort({ [sortField]: order === "asc" ? 1 : -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Could not load bookings" });
  }
};

// GET /api/bookings/:bookingId
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const notifications = await Notification.find({ bookingId: booking.bookingId }).sort({ sentAt: -1 });
    res.json({ booking, notifications, nextStatus: getNextStatus(booking.status) });
  } catch (err) {
    res.status(500).json({ message: "Could not load booking" });
  }
};

// PATCH /api/bookings/:bookingId/status   body: { status }
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const allowed = getNextStatus(booking.status);
    if (!allowed) return res.status(400).json({ message: `Booking is already at the final step (${booking.status})` });
    if (status !== allowed) {
      return res.status(400).json({ message: `Invalid transition: "${booking.status}" can only move to "${allowed}"` });
    }

    // Conditional update: only succeeds if the status is still what we just read,
    // so two admins clicking at once cannot both advance the same step.
    const updated = await Booking.findOneAndUpdate(
      { bookingId: booking.bookingId, status: booking.status },
      { status },
      { new: true }
    );
    if (!updated) return res.status(409).json({ message: "Booking was updated by someone else. Refresh and try again." });

    const notification = await sendNotification(updated);
    res.json({ booking: updated, notification, nextStatus: getNextStatus(updated.status) });
  } catch (err) {
    res.status(500).json({ message: "Could not update status" });
  }
};

// POST /api/bookings   body: { devoteeName, phone, pujaName, pujaDate, amount }
exports.createBooking = async (req, res) => {
  try {
    const { devoteeName, phone, pujaName, pujaDate, amount } = req.body;

    if (!devoteeName?.trim() || !phone?.trim() || !pujaName?.trim() || !pujaDate || amount === undefined || amount === "") {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }
    const amountNumber = Number(amount);
    if (Number.isNaN(amountNumber) || amountNumber < 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }
    if (Number.isNaN(new Date(pujaDate).getTime())) {
      return res.status(400).json({ message: "Puja date is not valid" });
    }

    const booking = await Booking.create({
      bookingId: await nextBookingId(),
      devoteeName,
      phone,
      pujaName,
      pujaDate,
      amount: amountNumber,
    });

    // New bookings start at "Booking Confirmed", so the first message goes out now.
    const notification = await sendNotification(booking);
    res.status(201).json({ booking, notification });
  } catch (err) {
    res.status(500).json({ message: "Could not create booking" });
  }
};