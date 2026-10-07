package com.eloria.repository;

import com.eloria.entity.ContactMessage;
import com.eloria.entity.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long>, JpaSpecificationExecutor<ContactMessage> {

    long countByStatus(MessageStatus status);
}
