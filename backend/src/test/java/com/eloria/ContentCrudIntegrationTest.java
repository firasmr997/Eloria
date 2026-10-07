package com.eloria;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Base64;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.oneOf;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Gallery, results, specialists and uploads. */
class ContentCrudIntegrationTest extends AbstractIntegrationTest {

    /** A real 1x1 PNG. */
    private static final byte[] PNG = Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=");

    private String upload(String token, String folder) throws Exception {
        MvcResult result = mvc.perform(multipart("/api/uploads").file(new MockMultipartFile("file", "photo.png", "image/png", PNG))
                        .param("folder", folder).header("Authorization", bearer(token)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.url", startsWith("/uploads/" + folder + "/")))
                .andReturn();
        return read(result, "$.data.url");
    }

    @Test
    void uploadRejectsFilesThatAreNotImages() throws Exception {
        String token = adminToken();
        mvc.perform(multipart("/api/uploads").file(new MockMultipartFile("file", "x.png", "image/png", "not a png".getBytes()))
                        .param("folder", "gallery").header("Authorization", bearer(token)))
                .andExpect(status().isBadRequest());
        mvc.perform(multipart("/api/uploads").file(new MockMultipartFile("file", "x.exe", "application/octet-stream", PNG))
                        .param("folder", "gallery").header("Authorization", bearer(token)))
                .andExpect(status().isBadRequest());
        mvc.perform(multipart("/api/uploads").file(new MockMultipartFile("file", "x.png", "image/png", PNG))
                        .param("folder", "../etc").header("Authorization", bearer(token)))
                .andExpect(status().isBadRequest());
        mvc.perform(multipart("/api/uploads").file(new MockMultipartFile("file", "x.png", "image/png", PNG))
                        .param("folder", "gallery"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void galleryCrudWithUploadReplaceAndDelete() throws Exception {
        String token = adminToken();
        String first = upload(token, "gallery");
        MvcResult created = mvc.perform(post("/api/gallery").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"New room\",\"imageUrl\":\"%s\",\"category\":\"TREATMENT_ROOMS\",\"featured\":true}".formatted(first)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.collection", is("CENTER")))
                .andReturn();
        Integer id = read(created, "$.data.id");

        // Serving the upload works.
        mvc.perform(get(first)).andExpect(status().isOk());

        // Replace the photo: the previous file becomes unreferenced and is deleted after commit.
        String second = upload(token, "gallery");
        mvc.perform(put("/api/gallery/" + id).header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"New room\",\"imageUrl\":\"%s\",\"category\":\"TREATMENT_ROOMS\"}".formatted(second)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.imageUrl", is(second)));
        mvc.perform(get(first)).andExpect(status().isNotFound());

        // An upload in use cannot be deleted as "unused".
        mvc.perform(delete("/api/uploads").param("url", second).header("Authorization", bearer(token)))
                .andExpect(status().isConflict());

        mvc.perform(get("/api/gallery?category=TREATMENT_ROOMS&size=50"))
                .andExpect(jsonPath("$.data.content[*].category", everyItem(is("TREATMENT_ROOMS"))));

        mvc.perform(delete("/api/gallery/" + id).header("Authorization", bearer(token))).andExpect(status().isOk());
        mvc.perform(get(second)).andExpect(status().isNotFound());
    }

    @Test
    void resultsCrudAndTreatmentFilter() throws Exception {
        String token = adminToken();
        MvcResult treatment = mvc.perform(get("/api/treatments/slug/chemical-peels")).andReturn();
        Integer treatmentId = read(treatment, "$.data.id");
        MvcResult created = mvc.perform(post("/api/results").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"treatmentId":%d,"beforeImageUrl":"/demo/results/a-before.jpg",
                                 "afterImageUrl":"/demo/results/a-after.jpg","title":"Peel course","featured":true}
                                """.formatted(treatmentId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.treatment.slug", is("chemical-peels")))
                .andReturn();
        Integer id = read(created, "$.data.id");

        mvc.perform(get("/api/results?treatmentId=" + treatmentId))
                .andExpect(jsonPath("$.data.content[*].treatment.id", everyItem(is(treatmentId))));

        mvc.perform(put("/api/results/" + id).header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"beforeImageUrl\":\"/demo/b.jpg\",\"afterImageUrl\":\"/demo/c.jpg\",\"title\":\"Unlinked\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.treatment").doesNotExist());

        mvc.perform(delete("/api/results/" + id).header("Authorization", bearer(token))).andExpect(status().isOk());
        mvc.perform(get("/api/results/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void specialistCrudBySlug() throws Exception {
        String token = adminToken();
        String name = unique("Dr. Lina Morel");
        MvcResult created = mvc.perform(post("/api/specialists").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","role":"Aesthetic Physician","bio":"Bio.","experience":"5 years",
                                 "specialties":["Peels","Laser"],"instagramUrl":"https://instagram.com/x"}
                                """.formatted(name)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.specialties.length()", is(2)))
                .andExpect(jsonPath("$.data.socialLinks.instagram", is("https://instagram.com/x")))
                .andReturn();
        Integer id = read(created, "$.data.id");
        String slug = read(created, "$.data.slug");

        mvc.perform(get("/api/specialists/" + slug)).andExpect(status().isOk());
        mvc.perform(post("/api/specialists").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"X\",\"role\":\"Y\",\"bio\":\"Z\",\"linkedinUrl\":\"http://insecure\"}"))
                .andExpect(status().isBadRequest());

        mvc.perform(delete("/api/specialists/" + id).header("Authorization", bearer(token))).andExpect(status().isOk());
        mvc.perform(get("/api/specialists/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void settingsArePublicAndEditableByAdmin() throws Exception {
        mvc.perform(get("/api/settings")).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.city", oneOf("Paris", "Lyon")));
        mvc.perform(put("/api/settings").header("Authorization", bearer(adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"centerName\":\"ÉLORIA AESTHETIC\",\"city\":\"Paris\",\"openingHours\":[{\"label\":\"Monday\",\"hours\":\"9:00 – 20:00\"}]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.openingHours[0].label", is("Monday")));
    }
}
