package com.example.socialnetwork.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter
public class User {
    @Id
    private String id = UUID.randomUUID().toString();
    @Column(unique = true, nullable = false)
    private String email;
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    @Column(name = "first_name", nullable = false)
    private String firstName;
    @Column(name = "last_name", nullable = false)
    private String lastName;
    @Column(name = "date_of_birth", nullable = false)
    private String dateOfBirth;
    private String avatarUrl;
    private String nickname;
    private String aboutMe;
    @Column(name = "is_public", nullable = false)
    private boolean isPublic = true;
    @Column(name = "created_at", insertable = false, updatable = false)
    private String createdAt;
}
