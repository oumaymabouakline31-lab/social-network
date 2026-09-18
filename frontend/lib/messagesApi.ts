import { apiFetch } from "./api";

export type ChatMessage = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    sentAt: string;
};

export function getConversation(userId: string) {
    return apiFetch<ChatMessage[]>(`/api/messages/${userId}`);
}