package com.example.socialnetwork.dto.chat;

import com.example.socialnetwork.entity.Message;

public record MessageResponse(
        String id,
        String senderId,
        String receiverId,
        String content,
        String sentAt
) {
    public static MessageResponse fromEntity(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getSenderId(),
                message.getReceiverId(),
                message.getContent(),
                message.getSentAt()
        );
    }
}