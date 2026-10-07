package com.eloria;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CategoryCrudIntegrationTest extends AbstractIntegrationTest {

    @Test
    void publicListShowsActiveCategoriesWithCounts() throws Exception {
        mvc.perform(get("/api/treatment-categories"))
                .andExpect(status().isOk())
                // Other tests may move treatments into Facial; the seed alone puts 4 there.
                .andExpect(jsonPath("$.data[?(@.slug == 'facial')].treatmentCount", hasItem(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$.data[*].active", everyItem(is(true))));
    }

    @Test
    void createUpdateAndDeleteCategory() throws Exception {
        String token = adminToken();
        String name = unique("Scalp Care");
        MvcResult created = mvc.perform(post("/api/treatment-categories").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"%s\",\"description\":\"Scalp health\",\"displayOrder\":9,\"active\":true}".formatted(name)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.slug", containsString("scalp-care")))
                .andReturn();
        Integer id = read(created, "$.data.id");

        mvc.perform(put("/api/treatment-categories/" + id).header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"%s\",\"displayOrder\":10,\"active\":false}".formatted(name)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active", is(false)));

        // Hidden from visitors once inactive.
        mvc.perform(get("/api/treatment-categories/" + id)).andExpect(status().isNotFound());

        mvc.perform(delete("/api/treatment-categories/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/treatment-categories/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    void duplicateNameIsAConflict() throws Exception {
        mvc.perform(post("/api/treatment-categories").header("Authorization", bearer(adminToken()))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"facial\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void categoryWithTreatmentsCannotBeDeletedUntilReassigned() throws Exception {
        String token = adminToken();
        MvcResult created = mvc.perform(post("/api/treatment-categories").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"%s\"}".formatted(unique("Temp"))))
                .andReturn();
        Integer source = read(created, "$.data.id");
        mvc.perform(post("/api/treatments").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TreatmentCrudIntegrationTest.treatmentJson(unique("Temp Facial"), source)))
                .andExpect(status().isCreated());

        mvc.perform(delete("/api/treatment-categories/" + source).header("Authorization", bearer(token)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("still has 1 treatment")));

        MvcResult facial = mvc.perform(get("/api/treatments/slug/signature-hydrafacial")).andReturn();
        Integer target = read(facial, "$.data.category.id");
        mvc.perform(delete("/api/treatment-categories/" + source + "?reassignTo=" + target).header("Authorization", bearer(token)))
                .andExpect(status().isOk());
    }
}
