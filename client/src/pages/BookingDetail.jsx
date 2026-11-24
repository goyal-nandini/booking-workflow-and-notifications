import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchBooking, advanceStatus, errorMessage } from "../api.js";
import { fmtDate } from "../workflow.js";
import StatusStepper from "../components/StatusStepper.jsx";
import NotificationHistory from "../components/NotificationHistory.jsx";

export default function BookingDetail() {
  const { bookingId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    return fetchBooking(bookingId)
      .then((d) => { setData(d); setError(""); })
      .catch((err) => setError(errorMessage(err)));
  }, [bookingId]);

  useEffect(() => { load(); }, [load]);

  async function handleAdvance() {
    setUpdating(true);
    try {
      await advanceStatus(bookingId, data.nextStatus);
      await load(); // refetch so the new status and notification appear immediately
    } catch (err) {
      setError(errorMessage(err));
      await load();
    } finally {
      setUpdating(false);
    }
  }

  if (!data) return <>{error ? <p className="error">{error}</p> : <p className="muted">Loading booking…</p>}<Link to="/">Back to bookings</Link></>;

  const { booking, notifications, nextStatus } = data;
  return (
    <>
      <Link to="/" className="back">← Back to bookings</Link>
      <h1>{booking.bookingId}</h1>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <dl className="info">
          <div><dt>Devotee</dt><dd>{booking.devoteeName}</dd></div>
          <div><dt>Phone</dt><dd>{booking.phone}</dd></div>
          <div><dt>Puja</dt><dd>{booking.pujaName}</dd></div>
          <div><dt>Puja date</dt><dd>{fmtDate(booking.pujaDate)}</dd></div>
          <div><dt>Amount</dt><dd>₹{booking.amount.toLocaleString("en-IN")}</dd></div>
        </dl>
      </section>

      <section className="card">
        <h2>Workflow</h2>
        <StatusStepper current={booking.status} />
        {nextStatus ? (
          <button className="primary" onClick={handleAdvance} disabled={updating}>
            {updating ? "Updating…" : `Move to: ${nextStatus}`}
          </button>
        ) : (
          <p className="muted">All steps complete. The devotee has been notified that the video is available.</p>
        )}
      </section>

      <section className="card">
        <h2>Notification history</h2>
        <NotificationHistory notifications={notifications} />
      </section>
    </>
  );
}
