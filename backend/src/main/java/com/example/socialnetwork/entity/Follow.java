package com.example.socialnetwork.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "follows")
@Getter
@Setter
public class Follow {

    @Id
    private String id = UUID.randomUUID().toString();

    // L'utilisateur qui fait le follow
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    // L'utilisateur qui est suivi
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "followee_id", nullable = false)
    private User followee;

    // "pending" (demande envoyée, profil privé) ou "accepted" (suivi validé)
    @Column(nullable = false)
    private String status = "pending";

    @Column(name = "created_at", insertable = false, updatable = false)
    private String createdAt;
}

