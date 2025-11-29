import React, { useEffect, useState } from "react";
import "./notification.css";
const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/api/guest/notifications", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      setNotifications(data.data?.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return '🏨';
      case 'payment':
        return '💳';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <h2>🔔 Your Notifications</h2>
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((note, index) => (
            <li key={note.id || index} className={`notification-type-${note.type || 'info'}`}>
              <div className="notification-card">
                <span className="notification-emoji">{getNotificationIcon(note.type)}</span>
                <div className="notification-details">
                  <h3 className="notification-title">{note.title}</h3>
                  <p className="notification-message">{note.message}</p>
                  <span className="notification-timestamp">
                    {formatDate(note.created_at)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-notifications">No notifications found.</p>
      )}
    </div>
  );
};

export default Notification;
