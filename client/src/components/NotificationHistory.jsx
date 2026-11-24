import { fmtDateTime, statusClass } from "../workflow.js";

export default function NotificationHistory({ notifications }) {
  if (notifications.length === 0) {
    return <p className="muted">No notifications yet. One is sent each time the status changes.</p>;
  }
  return (
    <ul className="history">
      {notifications.map((n) => (
        <li key={n._id}>
          <div className="history-head">
            <span className={statusClass(n.status)}>{n.status}</span>
            <span className={`delivery ${n.deliveryStatus}`}>{n.deliveryStatus === "sent" ? "Sent" : "Failed"} via WhatsApp (mock)</span>
            <time>{fmtDateTime(n.sentAt)}</time>
          </div>
          <p className="bubble">{n.message}</p>
        </li>
      ))}
    </ul>
  );
}
