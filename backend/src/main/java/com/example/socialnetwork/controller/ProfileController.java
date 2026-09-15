package com.example.socialnetwork.controller;

import com.example.socialnetwork.dto.profile.FollowResponse;
import com.example.socialnetwork.dto.profile.ProfileResponse;
import com.example.socialnetwork.dto.profile.UpdateProfileRequest;
import com.example.socialnetwork.entity.User;
import com.example.socialnetwork.repository.UserRepository;
import com.example.socialnetwork.security.UserPrincipal;
import com.example.socialnetwork.service.FileStorageService;
import com.example.socialnetwork.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public ProfileController(ProfileService profileService, UserRepository userRepository, FileStorageService fileStorageService) {
        this.profileService = profileService;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Uploader une photo de profil (Avatar) pour l'utilisateur connecté.
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        User currentUser = requireAuthenticatedUser();
        String avatarUrl = fileStorageService.storeAvatar(file);
        currentUser.setAvatarUrl(avatarUrl);
        userRepository.save(currentUser);
        ProfileResponse profile = profileService.getProfile(currentUser.getId(), currentUser);
        return ResponseEntity.ok(profile);
    }

    /**
     * Obtenir le profil d'un utilisateur par son ID (ou "me" pour son propre profil).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProfileResponse> getProfile(@PathVariable String id) {
        User currentUser = getAuthenticatedUser();
        String targetId = "me".equalsIgnoreCase(id) && currentUser != null ? currentUser.getId() : id;
        ProfileResponse profile = profileService.getProfile(targetId, currentUser);
        return ResponseEntity.ok(profile);
    }

    /**
     * Mettre à jour son propre profil (infos + toggle Public/Privé).
     */
    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateProfile(@RequestBody UpdateProfileRequest request) {
        User currentUser = requireAuthenticatedUser();
        ProfileResponse updated = profileService.updateProfile(currentUser, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Follow ou Unfollow un utilisateur cible.
     */
    @PostMapping("/{id}/follow")
    public ResponseEntity<FollowResponse> toggleFollow(@PathVariable String id) {
        User currentUser = requireAuthenticatedUser();
        FollowResponse response = profileService.toggleFollow(currentUser, id);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtenir la liste des followers d'un utilisateur.
     */
    @GetMapping("/{id}/followers")
    public ResponseEntity<List<FollowResponse>> getFollowers(@PathVariable String id) {
        User currentUser = getAuthenticatedUser();
        return ResponseEntity.ok(profileService.getFollowers(id, currentUser));
    }

    /**
     * Obtenir la liste des following d'un utilisateur.
     */
    @GetMapping("/{id}/following")
    public ResponseEntity<List<FollowResponse>> getFollowing(@PathVariable String id) {
        User currentUser = getAuthenticatedUser();
        return ResponseEntity.ok(profileService.getFollowing(id, currentUser));
    }

    /**
     * Obtenir la liste des demandes d'abonnements reçues en attente.
     */
    @GetMapping("/requests")
    public ResponseEntity<List<FollowResponse>> getPendingRequests() {
        User currentUser = requireAuthenticatedUser();
        return ResponseEntity.ok(profileService.getPendingRequests(currentUser));
    }

    /**
     * Accepter une demande de follow reçue.
     */
    @PostMapping("/requests/{id}/accept")
    public ResponseEntity<Map<String, String>> acceptRequest(@PathVariable String id) {
        User currentUser = requireAuthenticatedUser();
        profileService.respondToFollowRequest(currentUser, id, true);
        return ResponseEntity.ok(Map.of("message", "Follow request accepted"));
    }

    /**
     * Refuser une demande de follow reçue.
     */
    @PostMapping("/requests/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectRequest(@PathVariable String id) {
        User currentUser = requireAuthenticatedUser();
        profileService.respondToFollowRequest(currentUser, id, false);
        return ResponseEntity.ok(Map.of("message", "Follow request rejected"));
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return null;
        }
        if (auth.getPrincipal() instanceof UserPrincipal principal) {
            return userRepository.findById(principal.getId()).orElse(null);
        }
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private User requireAuthenticatedUser() {
        User user = getAuthenticatedUser();
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return user;
    }
}