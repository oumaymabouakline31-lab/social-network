package com.example.socialnetwork.dto.profile;

import com.example.socialnetwork.entity.Follow;
import com.example.socialnetwork.entity.User;

public record FollowResponse(
    String followId,
    String userId,
    String email,
    String firstName,
    String lastName,
    String avatarUrl,
    String nickname,
    String status,       // "pending" ou "accepted"
    String createdAt
) {
    // Mappe le FOLLOWER (celui qui suit)
    public static FollowResponse fromFollower(Follow follow) {
        User u = follow.getFollower();
        return new FollowResponse(
            follow.getId(),
            u.getId(),
            u.getEmail(),
            u.getFirstName(),
            u.getLastName(),
            u.getAvatarUrl(),
            u.getNickname(),
            follow.getStatus(),
            follow.getCreatedAt()
        );
    }

    // Mappe le FOLLOWEE (celui qui est suivi)
    public static FollowResponse fromFollowee(Follow follow) {
        User u = follow.getFollowee();
        return new FollowResponse(
            follow.getId(),
            u.getId(),
            u.getEmail(),
            u.getFirstName(),
            u.getLastName(),
            u.getAvatarUrl(),
            u.getNickname(),
            follow.getStatus(),
            follow.getCreatedAt()
        );
    }
}