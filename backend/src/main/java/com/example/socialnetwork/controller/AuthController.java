package com.example.socialnetwork.controller;

import com.example.socialnetwork.dto.auth.LoginRequest;
import com.example.socialnetwork.dto.auth.RegisterRequest;
import com.example.socialnetwork.dto.auth.UserResponse;
import com.example.socialnetwork.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Inscription via Multipart (formulaire avec fichier image sélectionné dans la galerie).
     */
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerMultipart(
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("dateOfBirth") String dateOfBirth,
            @RequestParam(value = "nickname", required = false) String nickname,
            @RequestParam(value = "aboutMe", required = false) String aboutMe,
            @RequestParam(value = "avatarFile", required = false) MultipartFile avatarFile,
            HttpServletRequest httpReq, HttpServletResponse httpRes) {
        RegisterRequest req = new RegisterRequest(email, password, firstName, lastName, dateOfBirth, null, nickname, aboutMe);
        return doRegister(req, avatarFile, httpReq, httpRes);
    }

    /**
     * Inscription standard via JSON (pour compatibilité totale).
     */
    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerJson(@RequestBody RegisterRequest req, HttpServletRequest httpReq, HttpServletResponse httpRes) {
        return doRegister(req, null, httpReq, httpRes);
    }

    private ResponseEntity<?> doRegister(RegisterRequest req, MultipartFile avatarFile, HttpServletRequest httpReq, HttpServletResponse httpRes) {
        try {
            UserResponse userResponse = authService.register(req, avatarFile, httpReq, httpRes);
            return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
        } catch (IllegalArgumentException e) {
            if ("Email already registered".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An error occurred during registration"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest httpReq, HttpServletResponse httpRes) {
        try {
            UserResponse userResponse = authService.login(req, httpReq, httpRes);
            return ResponseEntity.ok(userResponse);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An error occurred during login"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        UserResponse user = authService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));

    }
}
