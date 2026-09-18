package com.example.socialnetwork.controller;

import com.example.socialnetwork.dto.chat.MessageResponse;
import com.example.socialnetwork.security.CurrentUserService;
import com.example.socialnetwork.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final CurrentUserService currentUserService;

    @GetMapping("/{userId}")
    public List<MessageResponse> getConversation(@PathVariable String userId) {
        String currentUserId = currentUserService.getCurrentUser().getId();
        return messageService.getConversation(currentUserId, userId);
    }
}