package com.example.socialnetwork.repository;

import com.example.socialnetwork.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, String> {

    // Trouver une relation follow entre deux users (peu importe le statut)
    Optional<Follow> findByFollowerIdAndFolloweeId(String followerId, String followeeId);

    // Vérifier si une relation follow ACCEPTÉE existe
    boolean existsByFollowerIdAndFolloweeIdAndStatus(
            String followerId, String followeeId, String status);

    // Supprimer une relation follow (unfollow ou rejet de demande)
    void deleteByFollowerIdAndFolloweeId(String followerId, String followeeId);

    // Compter les followers ACCEPTÉS d'un user (ceux qui le suivent)
    long countByFolloweeIdAndStatus(String followeeId, String status);

    // Compter les following ACCEPTÉS d'un user (ceux qu'il suit)
    long countByFollowerIdAndStatus(String followerId, String status);

    // Lister les users qui suivent un profil (followers) — statut "accepted"
    @Query("SELECT f FROM Follow f JOIN FETCH f.follower WHERE f.followee.id = :userId AND f.status = :status")
    List<Follow> findFollowersByFolloweeIdAndStatus(
            @Param("userId") String userId,
            @Param("status") String status);

    // Lister les users que suit un profil (following) — statut "accepted"
    @Query("SELECT f FROM Follow f JOIN FETCH f.followee WHERE f.follower.id = :userId AND f.status = :status")
    List<Follow> findFollowingByFollowerIdAndStatus(
            @Param("userId") String userId,
            @Param("status") String status);

    // Toutes les demandes PENDING reçues par un user (pour les accepter/refuser)
    @Query("SELECT f FROM Follow f JOIN FETCH f.follower WHERE f.followee.id = :userId AND f.status = 'pending'")
    List<Follow> findPendingRequestsForUser(@Param("userId") String userId);
}

