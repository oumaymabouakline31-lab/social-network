package com.example.socialnetwork.dto.chat;

public record SendMessageRequest(
        String receiverId,
        String content
) {}