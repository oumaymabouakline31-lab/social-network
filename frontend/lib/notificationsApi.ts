import { apiFetch } from "./api";

export type NotificationItem = {
    id: string;
    type: string;
    referenceId: string | null;
    read: boolean;
    createdAt: string;
};

export const notificationsApi = {
    getAll: () =>
        apiFetch<NotificationItem[]>("/api/notifications"),

    getUnreadCount: async () => {
        const response = await apiFetch<{ count: number }>(
            "/api/notifications/unread-count"
        );

        return response.count;
    },

    markAsRead: (id: string) =>
        apiFetch<{ message: string }>(
            `/api/notifications/${id}/read`,
            { method: "POST" }
        ),

    markAllAsRead: () =>
        apiFetch<{ message: string }>(
            "/api/notifications/read-all",
            { method: "POST" }
        ),
};