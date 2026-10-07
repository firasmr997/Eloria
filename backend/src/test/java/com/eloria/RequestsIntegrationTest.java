package com.eloria;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Appointment requests and contact messages, from the public form to the admin inbox. */
class RequestsIntegrationTest extends AbstractIntegrationTest {

    private static String appointmentJson(String name, Object treatmentId, LocalDate date, String website) {
        return """
                {"name":"%s","email":"visitor@example.com","phone":"+33 6 12 34 56 78","treatmentId":%s,
                 "preferredDate":"%s","preferredTime":"10:30","message":"First visit","website":"%s"}
                """.formatted(name, treatmentId, date, website);
    }

    @Test
    void appointmentRequestIsStoredAndManagedByStaff() throws Exception {
        MvcResult treatment = mvc.perform(get("/api/treatments/slug/signature-hydrafacial")).andReturn();
        Integer treatmentId = read(treatment, "$.data.id");
        String name = unique("Visitor");

        MvcResult created = mvc.perform(post("/api/appointments").contentType(MediaType.APPLICATION_JSON)
                        .content(appointmentJson(name, treatmentId, LocalDate.now().plusDays(5), "")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.treatmentName", is("Signature Hydrafacial")))
                .andReturn();
        Integer id = read(created, "$.data.id");

        String token = adminToken();
        mvc.perform(get("/api/appointments?status=PENDING&size=100").header("Authorization", bearer(token)))
                .andExpect(jsonPath("$.data.content[*].status", everyItem(is("PENDING"))))
                .andExpect(jsonPath("$.data.content[*].name", hasItem(name)));

        mvc.perform(put("/api/appointments/" + id).header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CONFIRMED\",\"adminNotes\":\"Called back\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("CONFIRMED")));

        mvc.perform(delete("/api/appointments/" + id).header("Authorization", bearer(token))).andExpect(status().isOk());
        mvc.perform(get("/api/appointments/" + id).header("Authorization", bearer(token))).andExpect(status().isNotFound());
    }

    @Test
    void appointmentValidation() throws Exception {
        mvc.perform(post("/api/appointments").contentType(MediaType.APPLICATION_JSON)
                        .content(appointmentJson("Visitor", "null", LocalDate.now().minusDays(1), "")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/appointments").contentType(MediaType.APPLICATION_JSON)
                        .content(appointmentJson("Visitor", 999999, LocalDate.now().plusDays(1), "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("This treatment is not available for booking")));
        mvc.perform(post("/api/appointments").contentType(MediaType.APPLICATION_JSON)
                        .content(appointmentJson("Visitor", "null", LocalDate.now().plusDays(2), "").replace("10:30", "9h")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void honeypotRequestsAreNotStored() throws Exception {
        mvc.perform(post("/api/appointments").contentType(MediaType.APPLICATION_JSON)
                        .content(appointmentJson("Bot", "null", LocalDate.now().plusDays(1), "https://spam.example")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id", nullValue()));
    }

    @Test
    void contactMessageLifecycle() throws Exception {
        String name = unique("Writer");
        mvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"%s\",\"email\":\"w@example.com\",\"message\":\"Do you offer gift vouchers?\"}".formatted(name)))
                .andExpect(status().isCreated());

        String token = adminToken();
        MvcResult list = mvc.perform(get("/api/messages?status=NEW&q=" + name.split(" ")[1]).header("Authorization", bearer(token)))
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andReturn();
        Integer id = read(list, "$.data.content[0].id");

        mvc.perform(put("/api/messages/" + id).header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"READ\"}"))
                .andExpect(jsonPath("$.data.status", is("READ")));
        mvc.perform(put("/api/messages/" + id).header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"ARCHIVED\"}"))
                .andExpect(jsonPath("$.data.status", is("ARCHIVED")));
        mvc.perform(put("/api/messages/" + id).header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"SPAM\"}"))
                .andExpect(status().isBadRequest());

        mvc.perform(delete("/api/messages/" + id).header("Authorization", bearer(token))).andExpect(status().isOk());
    }

    @Test
    void contactValidation() throws Exception {
        mvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"A\",\"email\":\"nope\",\"message\":\"short\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.length()", is(3)));
    }
}
