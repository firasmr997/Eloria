package com.eloria.mapper;

import com.eloria.dto.message.ContactMessageDto;
import com.eloria.entity.ContactMessage;
import org.springframework.stereotype.Component;

@Component
public class ContactMessageMapper {

    public ContactMessageDto toDto(ContactMessage m) {
        return new ContactMessageDto(m.getId(), m.getName(), m.getEmail(), m.getPhone(), m.getMessage(), m.getStatus(),
                m.getCreatedAt(), m.getUpdatedAt());
    }
}
