package com.eloria;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthIntegrationTest extends AbstractIntegrationTest {

    @Test
    void loginReturnsTokenAndUser() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ADMIN@eloria.local\",\"password\":\"Admin123!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.role", is("ADMIN")));
    }

    @Test
    void wrongPasswordIsRejectedWithEnvelope() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@eloria.local\",\"password\":\"nope\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    void invalidLoginBodyReportsFields() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"x\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()", is(2)));
    }

    @Test
    void protectedEndpointsRequireAToken() throws Exception {
        mvc.perform(get("/api/dashboard")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/appointments")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/messages")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/treatments").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tamperedTokenIsRejected() throws Exception {
        String[] parts = adminToken().split("\\.");
        // Swap the payload for a forged one (role escalated) while keeping the original signature.
        String forged = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(
                "{\"iss\":\"eloria-api\",\"sub\":\"admin@eloria.local\",\"role\":\"ADMIN\",\"exp\":9999999999}".getBytes());
        String token = parts[0] + "." + forged + "." + parts[2];
        mvc.perform(get("/api/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Your session has expired or is invalid. Please sign in again.")));
    }

    @Test
    void validTokenGivesAccess() throws Exception {
        String token = adminToken();
        mvc.perform(get("/api/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email", is(ADMIN_EMAIL)));
        mvc.perform(get("/api/dashboard").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalTreatments", notNullValue()));
    }

    @Test
    void passwordChangeValidatesCurrentPassword() throws Exception {
        mvc.perform(put("/api/auth/password").header("Authorization", bearer(adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"wrong\",\"newPassword\":\"NewPassword123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Your current password is incorrect")));
    }
}
