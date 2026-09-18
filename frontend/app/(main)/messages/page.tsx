"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth, type User } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { profileApi, type FollowItem } from "@/lib/profileApi";

type ChatMessage = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    sentAt: string;
};


const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function MessagesPage() {
    const { user } = useAuth();

    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);

    const clientRef = useRef<Client | null>(null);
    const selectedUserRef = useRef<User | null>(null);
    const [friends, setFriends] = useState<FollowItem[]>([]);
    
        useEffect(() => {
        if (!user?.id) return;

        profileApi
            .getFollowing(user.id)
            .then(setFriends)
            .catch((error) => {
                console.error("Could not load friends:", error);
                setFriends([]);
            });
    }, [user?.id]);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
        }, [selectedUser]);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);

                client.subscribe("/user/queue/messages", (frame: IMessage) => {
                    const message = JSON.parse(frame.body) as ChatMessage;
                    const currentSelectedUser = selectedUserRef.current;

                if (
                    currentSelectedUser &&
                    (message.senderId === currentSelectedUser.id ||
                        message.receiverId === currentSelectedUser.id)
                ) {
                        setMessages((previous) => [...previous, message]);
                    }
                });
            },
            onDisconnect: () => {
                setConnected(false);
            },
            onWebSocketError: () => {
                setConnected(false);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            clientRef.current = null;
        };
    }, []);

    


        <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-slate-900">
            Mes amis
        </h2>

        {friends.length === 0 ? (
            <p className="text-sm text-slate-500">
                Aucun ami trouvé.
            </p>
        ) : (
            <div className="space-y-2">
                {friends.map((friend) => (
                    <button
                        key={friend.userId}
                        type="button"
                        onClick={() =>
                            selectUser({
                                id: friend.userId,
                                email: friend.email ?? "",
                                firstName: friend.firstName,
                                lastName: friend.lastName,
                                dateOfBirth: "",
                                isPublic: true,
                            })
                        }
                        className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-slate-50"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                            {friend.firstName[0]}
                            {friend.lastName[0]}
                        </div>

                        <span className="text-sm font-medium text-slate-900">
                            {friend.firstName} {friend.lastName}
                        </span>
                    </button>
                ))}
            </div>
        )}
    </div>


    async function searchUsers(value: string) {
        setSearch(value);

        if (!value.trim()) {
            setUsers([]);
            return;
        }

        setLoading(true);

        try {
            const result = await apiFetch<User[]>(
                `/api/users/search?query=${encodeURIComponent(value)}`
            );
            setUsers(result);
        } finally {
            setLoading(false);
        }
    }

    async function selectUser(selected: User) {
        setSelectedUser(selected);
        setUsers([]);
        setSearch("");

        const history = await apiFetch<ChatMessage[]>(
            `/api/messages/${selected.id}`
        );

        setMessages(history);
    }

    function sendMessage(event: FormEvent) {
        event.preventDefault();

        if (!user || !selectedUser || !text.trim()) {
            return;
        }

        const client = clientRef.current;

        if (!client || !client.connected) {
            return;
        }

        client.publish({
            destination: "/app/chat.send",
            body: JSON.stringify({
                receiverId: selectedUser.id,
                content: text.trim(),
            }),
        });

        setText("");
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Messages</h1>
                <p className="text-sm text-slate-500">
                    {connected ? "Connecté" : "Connexion en cours..."}
                </p>
            </div>

            <div className="relative">
                <input
                    value={search}
                    onChange={(event) => searchUsers(event.target.value)}
                    placeholder="Rechercher une personne..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
                />

                {(loading || users.length > 0) && (
                    <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                        {loading ? (
                            <p className="p-4 text-sm text-slate-500">
                                Recherche...
                            </p>
                        ) : (
                            users.map((searchedUser) => (
                                <button
                                    key={searchedUser.id}
                                    type="button"
                                    onClick={() => selectUser(searchedUser)}
                                    className="block w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
                                >
                                    {searchedUser.firstName}{" "}
                                    {searchedUser.lastName}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {selectedUser ? (
                <div className="flex min-h-[500px] flex-col rounded-2xl border border-slate-200 bg-white p-4">
                    <h2 className="border-b border-slate-100 pb-3 font-semibold text-slate-900">
                        {selectedUser.firstName} {selectedUser.lastName}
                    </h2>

                    <div className="flex-1 space-y-3 overflow-y-auto py-4">
                        {messages.map((message) => {
                            const ownMessage = message.senderId === user?.id;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${
                                        ownMessage
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <p
                                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                                            ownMessage
                                                ? "bg-indigo-600 text-white"
                                                : "bg-slate-100 text-slate-800"
                                        }`}
                                    >
                                        {message.content}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <form
                        onSubmit={sendMessage}
                        className="flex gap-2 border-t border-slate-100 pt-3"
                    >
                        <input
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            placeholder="Écrire un message..."
                            className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-400"
                        />

                        <button
                            type="submit"
                            disabled={!connected || !text.trim()}
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                        >
                            Envoyer
                        </button>
                    </form>
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                    Recherchez une personne pour commencer une conversation.
                </div>
            )}
        </div>
    );
}