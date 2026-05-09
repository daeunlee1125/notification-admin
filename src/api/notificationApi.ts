import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const getNotifications = async (params: Record<string, any>) => {
  const res = await api.get("/notifications", { params });
  return res.data;
};

export const getNotificationDetail = async (notificationId: number) => {
  const res = await api.get(`/notifications/${notificationId}`);
  return res.data;
};

export const getAttempts = async (notificationId: number) => {
  const res = await api.get(`/notifications/${notificationId}/attempts`);
  return res.data;
};

export const getAdminActions = async (notificationId: number) => {
  const res = await api.get(`/notifications/${notificationId}/admin-actions`);
  return res.data;
};

export const retryNotification = async (
  notificationId: number,
  body: { adminId?: string; reason?: string }
) => {
  const res = await api.post(`/notifications/${notificationId}/retry`, body);
  return res.data;
};

export const getStats = async (from: string, to: string) => {
  const res = await api.get("/notifications/stats", {
    params: { from, to },
  });
  return res.data;
};