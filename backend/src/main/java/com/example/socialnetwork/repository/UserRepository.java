package com.example.socialnetwork.repository;

import com.example.socialnetwork.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // User pour preciser la table de sqlite que ce repository va manipuler
    // String est le type de l id de User (@Id)

    // Recherche par email (utilisé pour l'authentification existante)
    Optional<User> findByEmail(String email);

    // Vérification d'unicité de l'email (utilisé pour l'inscription)
    boolean existsByEmail(String email);

    // Recherche d'utilisateurs par prénom, nom ou pseudo (insensible à la casse)
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(u.nickname IS NOT NULL AND LOWER(u.nickname) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchUsers(@Param("query") String query);
}
