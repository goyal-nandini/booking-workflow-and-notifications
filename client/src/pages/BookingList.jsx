import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBookings, errorMessage } from "../api.js";
import { WORKFLOW_STATUSES, statusClass, fmtDate } from "../workflow.js";

const SORTS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "pujaDate:asc", label: "Puja date: earliest" },
  { value: "pujaDate:desc", label: "Puja date: latest" },
  { value: "amount:desc", label: "Amount: high to low" },
  { value: "amount:asc", label: "Amount: low to high" },
];

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState(SORTS[0].value);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Wait 400ms after typing stops before searching, to avoid a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const [sortBy, order] = sort.split(":");
    setLoading(true);
    fetchBookings({ search: debounced, status, sortBy, order })
      .then((data) => {
        setBookings(data);
        setError("");
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [debounced, status, sort]);

  return (
    <>
      <h1>Bookings</h1>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Search by devotee, puja or booking ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {WORKFLOW_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort bookings"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading bookings…</p>}
      {!loading && !error && bookings.length === 0 && (
        <p className="muted">
          No bookings match. Clear the search or filter to see all.
        </p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Devotee</th>
                <th>Puja</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td data-label="Booking ID">{b.bookingId}</td>
                  <td data-label="Devotee">{b.devoteeName}</td>
                  <td data-label="Puja">{b.pujaName}</td>
                  <td data-label="Date">{fmtDate(b.pujaDate)}</td>
                  <td data-label="Amount">
                    ₹{b.amount.toLocaleString("en-IN")}
                  </td>
                  <td data-label="Status">
                    <span className={statusClass(b.status)}>{b.status}</span>
                  </td>
                  <td data-label="">
                    <Link to={`/bookings/${b.bookingId}`}>View details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
