package com.stockapp.gateway.security.encryption;

import java.lang.reflect.Field;
import org.reactivestreams.Publisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.data.mongodb.core.mapping.event.ReactiveBeforeConvertCallback;
import org.springframework.data.mongodb.core.mapping.event.ReactiveAfterConvertCallback;
import org.springframework.stereotype.Component;
import org.springframework.util.ReflectionUtils;
import reactor.core.publisher.Mono;

/**
 * Reactive MongoDB field encryption callbacks for WebFlux-based Gateway.
 * Uses ReactiveBeforeConvertCallback and ReactiveAfterConvertCallback for
 * reactive operations.
 */
@Component
public class EncryptedFieldEventListener
        implements ReactiveBeforeConvertCallback<Object>, ReactiveAfterConvertCallback<Object> {

    private static final Logger LOG = LoggerFactory.getLogger(EncryptedFieldEventListener.class);
    private final FieldEncryptionService encryptionService;

    public EncryptedFieldEventListener(FieldEncryptionService encryptionService) {
        this.encryptionService = encryptionService;
        LOG.info("✓ Reactive encrypted field callbacks initialized for Gateway");
    }

    @Override
    public Publisher<Object> onBeforeConvert(Object entity, String collection) {
        return Mono.fromCallable(() -> {
            processFieldsForEncryption(entity);
            return entity;
        });
    }

    @Override
    public Publisher<Object> onAfterConvert(Object entity, org.bson.Document document, String collection) {
        return Mono.fromCallable(() -> {
            processFieldsForDecryption(entity);
            return entity;
        });
    }

    private void processFieldsForEncryption(Object entity) {
        ReflectionUtils.doWithFields(entity.getClass(), field -> {
            if (AnnotationUtils.findAnnotation(field, Encrypted.class) != null) {
                encryptField(field, entity);
            }
        });
    }

    private void processFieldsForDecryption(Object entity) {
        ReflectionUtils.doWithFields(entity.getClass(), field -> {
            if (AnnotationUtils.findAnnotation(field, Encrypted.class) != null) {
                decryptField(field, entity);
            }
        });
    }

    private void encryptField(Field field, Object entity) {
        try {
            field.setAccessible(true);
            Object value = field.get(entity);
            if (value instanceof String stringValue && !stringValue.isEmpty()) {
                if (!encryptionService.isEncrypted(stringValue)) {
                    field.set(entity, encryptionService.encrypt(stringValue));
                }
            }
        } catch (IllegalAccessException e) {
            LOG.error("Failed to encrypt field: {}", field.getName(), e);
        }
    }

    private void decryptField(Field field, Object entity) {
        try {
            field.setAccessible(true);
            Object value = field.get(entity);
            if (value instanceof String stringValue && encryptionService.isEncrypted(stringValue)) {
                field.set(entity, encryptionService.decrypt(stringValue));
            }
        } catch (IllegalAccessException e) {
            LOG.error("Failed to decrypt field: {}", field.getName(), e);
        }
    }
}
