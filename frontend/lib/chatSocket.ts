import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessage } from "./messagesApi";

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function createChatSocket(
    onMessage: (message: ChatMessage) => void
) {
    const client = new Client({
        webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
        reconnectDelay: 5000,
        debug: () => {},
        onConnect: () => {
            client.subscribe("/user/queue/messages", (frame: IMessage) => {
                onMessage(JSON.parse(frame.body) as ChatMessage);
            });
        },
    });

    client.activate();

    return () => {
        client.deactivate();
    };
}

export function sendChatMessage(
    client: Client,
    receiverId: string,
    content: string
) {
    client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
            receiverId,
            content,
        }),
    });
}