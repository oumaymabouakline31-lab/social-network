package com.example.socialnetwork.dto.auth;

public record LoginRequest(
    String email,
    String password
) {}

