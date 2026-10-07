package com.eloria;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TreatmentCrudIntegrationTest extends AbstractIntegrationTest {

    static String treatmentJson(String name, Object categoryId) {
        return """
                {"name":"%s","categoryId":%s,"shortDescription":"A short description.",
                 "description":"A longer description of the treatment.","durationMinutes":45,"price":120.00,
                 "priceFrom":true,"benefits":["Calmer skin","Even tone"],"preparation":["Arrive with clean skin"],
                 "aftercare":["Wear SPF"],"technology":"LED","mainImageUrl":"https://images.example.com/a.jpg",
                 "additionalImages":[{"imageUrl":"/uploads/treatments/x.webp","altText":"Detail"}],
                 "faqs":[{"question":"Does it hurt?","answer":"No."}],"available":true,"featured":false}
                """.formatted(name, categoryId);
    }

    @Test
    void searchPaginatesAndFilters() throws Exception {
        mvc.perform(get("/api/treatments?page=0&size=5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()", is(5)))
                .andExpect(jsonPath("$.data.size", is(5)))
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(20)));
        mvc.perform(get("/api/treatments?category=body&size=50"))
                .andExpect(jsonPath("$.data.content[*].category.slug", everyItem(is("body"))));
        mvc.perform(get("/api/treatments?featured=true&size=50"))
                .andExpect(jsonPath("$.data.content[*].featured", everyItem(is(true))));
        mvc.perform(get("/api/treatments?q=hydrafacial"))
                .andExpect(jsonPath("$.data.content[0].slug", is("signature-hydrafacial")));
        mvc.perform(get("/api/treatments?size=0")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/treatments?sort=nonsense")).andExpect(status().isBadRequest());
    }

    @Test
    void detailBySlugIncludesListsAndFaqs() throws Exception {
        mvc.perform(get("/api/treatments/slug/microneedling"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.benefits.length()", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.data.faqs.length()", greaterThanOrEqualTo(1)));
        mvc.perform(get("/api/treatments/slug/does-not-exist")).andExpect(status().isNotFound());
    }

    @Test
    void fullCrudReachesThePublicCatalogue() throws Exception {
        String token = adminToken();
        String name = unique("Oxygen Facial");
        MvcResult reference = mvc.perform(get("/api/treatments/slug/signature-hydrafacial")).andReturn();
        Integer categoryId = read(reference, "$.data.category.id");

        MvcResult created = mvc.perform(post("/api/treatments").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(treatmentJson(name, categoryId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.additionalImages.length()", is(1)))
                .andExpect(jsonPath("$.data.faqs[0].question", is("Does it hurt?")))
                .andReturn();
        Integer id = read(created, "$.data.id");
        String slug = read(created, "$.data.slug");

        mvc.perform(get("/api/treatments/slug/" + slug)).andExpect(status().isOk());

        mvc.perform(put("/api/treatments/" + id).header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(treatmentJson(name, categoryId).replace("\"featured\":false", "\"featured\":true")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.featured", is(true)));

        mvc.perform(delete("/api/treatments/" + id).header("Authorization", bearer(token))).andExpect(status().isOk());
        mvc.perform(get("/api/treatments/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void invalidTreatmentIsRejectedWithFieldErrors() throws Exception {
        mvc.perform(post("/api/treatments").header("Authorization", bearer(adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"price\":-1,\"durationMinutes\":2,\"mainImageUrl\":\"javascript:alert(1)\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.errors.length()", greaterThanOrEqualTo(5)));
    }
}
