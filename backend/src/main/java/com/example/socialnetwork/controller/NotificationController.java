package com.example.socialnetwork.controller;

import com.example.socialnetwork.dto.NotificationResponse;
import com.example.socialnetwork.security.CurrentUserService;
import com.example.socialnetwork.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<NotificationResponse> getNotifications() {
        String userId = currentUserService.getCurrentUser().getId();
        return notificationService.getNotifications(userId);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount() {
        String userId = currentUserService.getCurrentUser().getId();
        return Map.of(
                "count",
                notificationService.getUnreadCount(userId)
        );
    }

    @PostMapping("/{id}/read")
    public Map<String, String> markAsRead(@PathVariable String id) {
        String userId = currentUserService.getCurrentUser().getId();
        notificationService.markAsRead(userId, id);

        return Map.of("message", "Notification marked as read");
    }

    @PostMapping("/read-all")
    public Map<String, String> markAllAsRead() {
        String userId = currentUserService.getCurrentUser().getId();
        notificationService.markAllAsRead(userId);

        return Map.of("message", "Notifications marked as read");
    }
}
