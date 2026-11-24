import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });

export const fetchBookings = (params) => api.get("/bookings", { params }).then((r) => r.data);
export const fetchBooking = (id) => api.get(`/bookings/${id}`).then((r) => r.data);
export const advanceStatus = (id, status) => api.patch(`/bookings/${id}/status`, { status }).then((r) => r.data);

// Pulls the server's { message } out of an axios error.
export const errorMessage = (err) => err.response?.data?.message || "Something went wrong. Check that the server is running.";
