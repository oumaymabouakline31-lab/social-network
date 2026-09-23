package com.example.socialnetwork.service;

import com.example.socialnetwork.dto.NotificationResponse;
import com.example.socialnetwork.entity.Notification;
import com.example.socialnetwork.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createFollowRequestNotification(String userId, String followId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType("follow_request");
        notification.setReferenceId(followId);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(String userId) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(String userId, String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not allowed");
        }

        notification.setRead(true);
    }

    public void markAllAsRead(String userId) {
        notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .forEach(notification -> notification.setRead(true));
    }
}