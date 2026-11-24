const router = require("express").Router();
const c = require("../controllers/bookingController");

router.get("/", c.listBookings);
router.get("/:bookingId", c.getBooking);
router.patch("/:bookingId/status", c.updateStatus);

module.exports = router;
