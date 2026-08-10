package com.example.socialnetwork.controller;

import com.example.socialnetwork.entity.User;
import com.example.socialnetwork.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    record RegisterRequest(String email, String password, String firstName,
                            String lastName, String dateOfBirth,
                            String nickname, String aboutMe) {}
    record LoginRequest(String email, String password) {}
   
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req, HttpServletRequest httpReq) {
        if (userRepository.existsByEmail(req.email())) {
            return ResponseEntity.status(409).body(Map.of("error", "Email already registered"));
        }
        User user = new User();
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setDateOfBirth(req.dateOfBirth());
        user.setNickname(req.nickname());
        user.setAboutMe(req.aboutMe());
        userRepository.save(user);
       
        establishSession(httpReq, user);
        return ResponseEntity.ok(Map.of("id", user.getId(), "email", user.getEmail()));
    }
   
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest httpReq) {
        User user = userRepository.findByEmail(req.email()).orElse(null);
        if (user == null || !passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        establishSession(httpReq, user);
        return ResponseEntity.ok(Map.of("id", user.getId(), "email", user.getEmail()));
    }
   
    private void establishSession(HttpServletRequest httpReq, User user) {
        var authentication = new UsernamePasswordAuthenticationToken(user, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        httpReq.getSession(true)
            .setAttribute("SPRING_SECURITY_CONTEXT",
                SecurityContextHolder.getContext());
    }
}
