import { Routes, Route, Link } from "react-router-dom";
import BookingList from "./pages/BookingList.jsx";
import BookingDetail from "./pages/BookingDetail.jsx";
import NewBooking from "./pages/NewBooking.jsx";

export default function App() {
  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand">Aaradhya Setu <span>Puja bookings</span></Link>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<BookingList />} />
          <Route path="/bookings/new" element={<NewBooking />} />
          <Route path="/bookings/:bookingId" element={<BookingDetail />} />
        </Routes>
      </main>
    </>
  );
}
