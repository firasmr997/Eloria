package com.eloria;

import com.eloria.config.JwtProperties;
import com.eloria.config.StorageProperties;
import com.eloria.entity.Role;
import com.eloria.exception.InvalidFileException;
import com.eloria.security.AppUserDetails;
import com.eloria.security.JwtService;
import com.eloria.storage.ImageFileValidator;
import com.eloria.util.SlugUtils;
import com.eloria.util.Text;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.unit.DataSize;

import java.time.Duration;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Fast tests that need no database. */
class UnitTests {

    @Test
    void slugs() {
        assertThat(SlugUtils.slugify("Peeling à l’acide glycolique")).isEqualTo("peeling-a-l-acide-glycolique");
        assertThat(SlugUtils.slugify("  Neck & Décolleté  ")).isEqualTo("neck-decollete");
        assertThat(SlugUtils.unique("Facial", Set.of("facial", "facial-2")::contains)).isEqualTo("facial-3");
    }

    @Test
    void lineStorage() {
        assertThat(Text.joinLines(List.of(" One ", "", "Two\nlines"))).isEqualTo("One\nTwo lines");
        assertThat(Text.lines("One\r\n\nTwo")).containsExactly("One", "Two");
        assertThat(Text.likePattern("50%_off")).isEqualTo("%50\\%\\_off%");
    }

    @Test
    void jwtRoundTripAndTamperDetection() {
        JwtService jwt = new JwtService(new JwtProperties("unit-test-secret-0123456789abcdefghijklmnop", Duration.ofHours(1), "eloria-api"));
        var token = jwt.issue(new AppUserDetails(1L, "Admin", "admin@eloria.local", "x", Role.ADMIN));
        assertThat(jwt.verify(token.token())).hasValueSatisfying(c -> assertThat(c.getSubject()).isEqualTo("admin@eloria.local"));
        assertThat(jwt.verify(token.token() + "a")).isEmpty();
        assertThatThrownBy(() -> new JwtService(new JwtProperties("short", null, null))).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void imageValidatorChecksTypeExtensionAndContent() {
        ImageFileValidator validator = new ImageFileValidator(new StorageProperties("local", "./x", "/uploads", DataSize.ofKilobytes(1)));
        byte[] jpeg = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x00, 0x01};
        assertThat(validator.validate(new MockMultipartFile("file", "a.jpeg", "image/jpeg", jpeg)).extension()).isEqualTo("jpg");
        assertThatThrownBy(() -> validator.validate(new MockMultipartFile("file", "a.png", "image/jpeg", jpeg)))
                .isInstanceOf(InvalidFileException.class);
        assertThatThrownBy(() -> validator.validate(new MockMultipartFile("file", "a.jpg", "image/jpeg", "text".getBytes())))
                .isInstanceOf(InvalidFileException.class);
        assertThatThrownBy(() -> validator.validate(new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[2048])))
                .isInstanceOf(InvalidFileException.class);
        assertThatThrownBy(() -> validator.validate(new MockMultipartFile("file", "a.svg", "image/svg+xml", jpeg)))
                .isInstanceOf(InvalidFileException.class);
    }
}
