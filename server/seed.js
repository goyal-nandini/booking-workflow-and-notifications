require("dotenv").config();
const mongoose = require("mongoose");
const Booking = require("./models/Booking");
const Notification = require("./models/Notification");
const { WORKFLOW_STATUSES, TEMPLATES, renderTemplate } = require("./constants/workflow");

// How many bookings to create: `npm run seed` gives 15, `node seed.js 30` gives 30.
const COUNT = Number(process.argv[2]) || 15;

const FIRST_NAMES = ["Aarav", "Priya", "Rohit", "Sneha", "Vikram", "Ananya", "Karan", "Meera", "Deepak", "Pooja", "Neha", "Arjun", "Kavita", "Manish", "Ritu"];
const LAST_NAMES = ["Sharma", "Verma", "Gupta", "Iyer", "Singh", "Reddy", "Malhotra", "Nair", "Joshi", "Mishra", "Yadav", "Chauhan"];

// Each puja has its own typical price, so amounts look realistic.
const PUJAS = [
  { name: "Satyanarayan Puja", price: 1100 },
  { name: "Rudrabhishek", price: 2100 },
  { name: "Ganesh Puja", price: 751 },
  { name: "Mahamrityunjaya Jaap", price: 5100 },
  { name: "Navgraha Shanti Puja", price: 3100 },
  { name: "Lakshmi Puja", price: 1500 },
  { name: "Hanuman Chalisa Path", price: 501 },
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
const randomPhone = () => String(randomInt(6, 9)) + String(randomInt(0, 999999999)).padStart(9, "0");

function makeBooking(i) {
  const puja = pick(PUJAS);
  return {
    bookingId: `AS-${1001 + i}`,
    devoteeName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    phone: randomPhone(),
    pujaName: puja.name,
    pujaDate: daysFromNow(randomInt(-7, 7)),
    amount: puja.price,
    status: WORKFLOW_STATUSES[randomInt(0, WORKFLOW_STATUSES.length - 1)],
  };
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Booking.deleteMany({});
  await Notification.deleteMany({});

  for (let i = 0; i < COUNT; i++) {
    const booking = await Booking.create(makeBooking(i));

    // History: one notification for every step this booking has already reached.
    const reached = WORKFLOW_STATUSES.indexOf(booking.status);
    for (let s = 0; s <= reached; s++) {
      await Notification.create({
        bookingId: booking.bookingId,
        status: WORKFLOW_STATUSES[s],
        message: renderTemplate(TEMPLATES[WORKFLOW_STATUSES[s]], booking),
        deliveryStatus: "sent",
        sentAt: new Date(Date.now() - (reached - s + 1) * 3600000),
      });
    }
  }

  console.log(`Seeded ${COUNT} bookings`);
  await mongoose.disconnect();
})();