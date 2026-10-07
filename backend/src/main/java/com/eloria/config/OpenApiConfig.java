package com.eloria.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI eloriaOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("ÉLORIA AESTHETIC API")
                        .version("1.0.0")
                        .description("""
                                REST API behind the ÉLORIA AESTHETIC website and its admin dashboard.

                                **Authentication.** Call `POST /api/auth/login`, copy `data.token` from the response and \
                                press **Authorize** (paste the raw token). Endpoints marked with a lock require it.

                                **Envelope.** Every response is wrapped: `{ "success": true, "data": ..., "message": "Success" }` \
                                or `{ "success": false, "message": "...", "errors": [{ "field": "...", "message": "..." }] }`.

                                **Pagination.** List endpoints accept `page` (zero-based) and `size` and return \
                                `{ content, page, size, totalElements, totalPages, first, last }`.

                                **Images.** Upload with `POST /api/uploads?folder=treatments|gallery|results|team`, then send \
                                the returned `url` in the create or update request.
                                """)
                        .contact(new Contact().name("ÉLORIA AESTHETIC")))
                .components(new Components().addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT returned by POST /api/auth/login")))
                .tags(List.of(
                        new Tag().name("Authentication").description("Staff sign-in and account"),
                        new Tag().name("Categories").description("Treatment categories"),
                        new Tag().name("Treatments").description("Treatment catalogue, search and filters"),
                        new Tag().name("Gallery").description("Editorial and center photography"),
                        new Tag().name("Results").description("Before and after cases"),
                        new Tag().name("Specialists").description("The team"),
                        new Tag().name("Testimonials").description("Client testimonials"),
                        new Tag().name("Appointments").description("Consultation requests"),
                        new Tag().name("Messages").description("Contact form and inbox"),
                        new Tag().name("Uploads").description("Image uploads and storage"),
                        new Tag().name("Dashboard").description("Admin overview"),
                        new Tag().name("Settings").description("Center profile, hours and channels")));
    }
}
