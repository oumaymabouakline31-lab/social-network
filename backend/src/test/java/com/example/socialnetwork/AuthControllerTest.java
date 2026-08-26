package com.example.socialnetwork;

import com.example.socialnetwork.dto.auth.LoginRequest;
import com.example.socialnetwork.dto.auth.RegisterRequest;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class AuthControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void testRegisterSuccess() throws Exception {
        String uniqueEmail = "user_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest req = new RegisterRequest(
            uniqueEmail,
            "password123",
            "John",
            "Doe",
            "1995-05-15",
            "http://example.com/avatar.png",
            "johndoe",
            "Hello world"
        );

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNotEmpty())
            .andExpect(jsonPath("$.email").value(uniqueEmail))
            .andExpect(jsonPath("$.firstName").value("John"))
            .andExpect(jsonPath("$.lastName").value("Doe"))
            .andExpect(jsonPath("$.dateOfBirth").value("1995-05-15"))
            .andExpect(jsonPath("$.nickname").value("johndoe"))
            .andExpect(jsonPath("$.avatarUrl").value("http://example.com/avatar.png"))
            .andExpect(jsonPath("$.aboutMe").value("Hello world"));
    }

    @Test
    void testRegisterDuplicateEmail() throws Exception {
        String email = "duplicate_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest req = new RegisterRequest(
            email,
            "password123",
            "Alice",
            "Smith",
            "1990-01-01",
            null,
            "alice",
            null
        );

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated());

        // Second register with same email
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error").value("Email already registered"));
    }

    @Test
    void testRegisterValidationFailure() throws Exception {
        RegisterRequest req = new RegisterRequest(
            "invalid-email",
            "123", // too short
            "",
            "",
            "",
            null,
            null,
            null
        );

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").isNotEmpty());
    }

    @Test
    void testLoginSuccessAndSessionPersistence() throws Exception {
        String email = "login_test_" + System.currentTimeMillis() + "@example.com";
        RegisterRequest regReq = new RegisterRequest(
            email,
            "secretPass123",
            "Bob",
            "Marley",
            "1980-02-06",
            null,
            "bob",
            "Music lover"
        );

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regReq)))
            .andExpect(status().isCreated());

        // Perform login
        LoginRequest loginReq = new LoginRequest(email, "secretPass123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.firstName").value("Bob"))
            .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        // Fetch /api/auth/me with session
        mockMvc.perform(get("/api/auth/me").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.firstName").value("Bob"))
            .andExpect(jsonPath("$.nickname").value("bob"));

        // Logout
        mockMvc.perform(post("/api/auth/logout").session(session))
            .andExpect(status().isOk());

        // /api/auth/me should now be unauthorized without valid session
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void testLoginInvalidCredentials() throws Exception {
        LoginRequest loginReq = new LoginRequest("nonexistent@example.com", "wrongpassword");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    @Test
    void testGetMeUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized());
    }
}

