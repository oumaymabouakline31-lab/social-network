package com.example.socialnetwork.service;

import com.example.socialnetwork.dto.auth.LoginRequest;
import com.example.socialnetwork.dto.auth.RegisterRequest;
import com.example.socialnetwork.dto.auth.UserResponse;
import com.example.socialnetwork.entity.User;
import com.example.socialnetwork.repository.UserRepository;
import com.example.socialnetwork.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextRepository securityContextRepository;

    public UserResponse register(RegisterRequest req, HttpServletRequest httpReq, HttpServletResponse httpRes) {
        validateRegisterRequest(req);

        String normalizedEmail = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFirstName(req.firstName().trim());
        user.setLastName(req.lastName().trim());
        user.setDateOfBirth(req.dateOfBirth().trim());
        user.setAvatarUrl(req.avatarUrl() != null && !req.avatarUrl().isBlank() ? req.avatarUrl().trim() : null);
        user.setNickname(req.nickname() != null && !req.nickname().isBlank() ? req.nickname().trim() : null);
        user.setAboutMe(req.aboutMe() != null && !req.aboutMe().isBlank() ? req.aboutMe().trim() : null);
        user.setPublic(true);

        User savedUser = userRepository.save(user);
        establishSession(httpReq, httpRes, savedUser);

        return UserResponse.fromEntity(savedUser);
    }

    public UserResponse login(LoginRequest req, HttpServletRequest httpReq, HttpServletResponse httpRes) {
        if (req.email() == null || req.email().isBlank() || req.password() == null || req.password().isBlank()) {
            throw new BadCredentialsException("Email and password are required");
        }

        String normalizedEmail = req.email().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        establishSession(httpReq, httpRes, user);
        return UserResponse.fromEntity(user);
    }

    public UserResponse getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return null;
        }

        if (auth.getPrincipal() instanceof UserPrincipal principal) {
            return userRepository.findById(principal.getId())
                .map(UserResponse::fromEntity)
                .orElse(null);
        }

        return userRepository.findByEmail(auth.getName())
            .map(UserResponse::fromEntity)
            .orElse(null);
    }

    private void establishSession(HttpServletRequest httpReq, HttpServletResponse httpRes, User user) {
        UserPrincipal principal = UserPrincipal.create(user);
        var authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpReq, httpRes);
    }

    private void validateRegisterRequest(RegisterRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Request body cannot be null");
        }
        if (req.email() == null || req.email().isBlank() || !EMAIL_PATTERN.matcher(req.email().trim()).matches()) {
            throw new IllegalArgumentException("Valid email is required");
        }
        if (req.password() == null || req.password().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }
        if (req.firstName() == null || req.firstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }
        if (req.lastName() == null || req.lastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }
        if (req.dateOfBirth() == null || req.dateOfBirth().trim().isEmpty()) {
            throw new IllegalArgumentException("Date of birth is required");
        }
    }
}

