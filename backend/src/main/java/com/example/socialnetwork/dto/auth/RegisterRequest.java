package com.example.socialnetwork.dto.auth;

public record RegisterRequest(
    String email,
    String password,
    String firstName,
    String lastName,
    String dateOfBirth,
    String avatarUrl,
    String nickname,
    String aboutMe
) {}

