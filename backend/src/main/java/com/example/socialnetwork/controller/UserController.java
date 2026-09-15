package com.example.socialnetwork.controller;

import com.example.socialnetwork.dto.auth.UserResponse;
import com.example.socialnetwork.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Recherche d'utilisateurs par prénom, nom ou pseudo (query).
     * Exemple : GET /api/users/search?query=oum
     */
    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam(value = "query", required = false) String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<UserResponse> results = userRepository.searchUsers(query.trim())
                .stream()
                .map(UserResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(results);
    }
}

