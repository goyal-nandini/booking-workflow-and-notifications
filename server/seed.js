require("dotenv").config();
const mongoose = require("mongoose");
const Booking = require("./models/Booking");
const Notification = require("./models/Notification");
const { WORKFLOW_STATUSES, TEMPLATES, renderTemplate } = require("./constants/workflow");

const day = (n) => new Date(Date.now() + n * 86400000);

const data = [
  ["Aarav Sharma", "9876500001", "Satyanarayan Puja", -5, 1100, 3],
  ["Priya Verma", "9876500002", "Rudrabhishek", -3, 2100, 2],
  ["Rohit Gupta", "9876500003", "Ganesh Puja", -1, 751, 1],
  ["Sneha Iyer", "9876500004", "Mahamrityunjaya Jaap", 0, 5100, 1],
  ["Vikram Singh", "9876500005", "Navgraha Shanti Puja", 2, 3100, 0],
  ["Ananya Reddy", "9876500006", "Lakshmi Puja", 3, 1500, 0],
  ["Karan Malhotra", "9876500007", "Hanuman Chalisa Path", 4, 501, 0],
  ["Meera Nair", "9876500008", "Satyanarayan Puja", -7, 1100, 3],
  ["Deepak Joshi", "9876500009", "Rudrabhishek", 5, 2100, 0],
  ["Pooja Mishra", "9876500010", "Ganesh Puja", 1, 751, 2],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Booking.deleteMany({});
  await Notification.deleteMany({});

  for (let i = 0; i < data.length; i++) {
    const [devoteeName, phone, pujaName, dateOffset, amount, stepIndex] = data[i];
    const bookingId = `AS-${1001 + i}`;
    const status = WORKFLOW_STATUSES[stepIndex];
    await Booking.create({ bookingId, devoteeName, phone, pujaName, pujaDate: day(dateOffset), amount, status });

    // History: one notification per step the booking has already reached.
    for (let s = 0; s <= stepIndex; s++) {
      await Notification.create({
        bookingId,
        status: WORKFLOW_STATUSES[s],
        message: renderTemplate(TEMPLATES[WORKFLOW_STATUSES[s]], { devoteeName, pujaName, bookingId }),
        deliveryStatus: "sent",
        sentAt: new Date(Date.now() - (stepIndex - s + 1) * 3600000),
      });
    }
  }

  console.log(`Seeded ${data.length} bookings`);
  await mongoose.disconnect();
})();
