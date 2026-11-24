import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createBooking, errorMessage } from "../api.js";

const EMPTY = { devoteeName: "", phone: "", pujaName: "", pujaDate: "", amount: "" };

export default function NewBooking() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // One handler for every input: the input's name matches a key in the form state.
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser from reloading the page
    setError("");

    // Quick check for the user's convenience. The server validates again.
    if (!/^\d{10}$/.test(form.phone)) {
      setError("Phone number must be 10 digits");
      return;
    }

    setSaving(true);
    try {
      const { booking } = await createBooking(form);
      navigate(`/bookings/${booking.bookingId}`); // go straight to the new booking
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <>
      <Link to="/" className="back">← Back to bookings</Link>
      <h1>New booking</h1>

      <form className="card form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}

        <label>
          Devotee name
          <input name="devoteeName" value={form.devoteeName} onChange={handleChange} required />
        </label>
        <label>
          Phone number
          <input name="phone" value={form.phone} onChange={handleChange} inputMode="numeric" maxLength={10} placeholder="10 digits" required />
        </label>
        <label>
          Puja
          <input name="pujaName" value={form.pujaName} onChange={handleChange} placeholder="e.g. Satyanarayan Puja" required />
        </label>
        <label>
          Puja date
          <input type="date" name="pujaDate" value={form.pujaDate} onChange={handleChange} required />
        </label>
        <label>
          Amount (₹)
          <input type="number" name="amount" value={form.amount} onChange={handleChange} min="0" required />
        </label>

        <button className="primary" disabled={saving}>
          {saving ? "Creating…" : "Create booking"}
        </button>
      </form>
    </>
  );
}