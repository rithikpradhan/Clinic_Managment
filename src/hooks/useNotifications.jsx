import { useState, useEffect, useCallback } from "react";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../lib/supabase";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchNotifications();
    setNotifications(data);
    setUnreadCount(data.filter((n) => !n.read).length);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    // Optional: add a polling interval here to check for new notifications every minute
    const interval = setInterval(load, 60000);

    // Listen for local events to refresh instantly
    const handleLocalUpdate = () => load();
    window.addEventListener("notifications-updated", handleLocalUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-updated", handleLocalUpdate);
    };
  }, [load]);

  const markAsRead = async (id) => {
    const success = await markNotificationRead(id);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    const success = await markAllNotificationsRead();
    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: load,
  };
}
