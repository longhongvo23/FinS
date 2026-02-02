package com.stockapp.aitoolsservice.security.encryption;

import java.lang.reflect.Field;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.AfterConvertEvent;
import org.springframework.data.mongodb.core.mapping.event.BeforeSaveEvent;
import org.springframework.stereotype.Component;
import org.springframework.util.ReflectionUtils;

@Component
public class EncryptedFieldEventListener extends AbstractMongoEventListener<Object> {

    private static final Logger LOG = LoggerFactory.getLogger(EncryptedFieldEventListener.class);
    private final FieldEncryptionService encryptionService;

    public EncryptedFieldEventListener(FieldEncryptionService encryptionService) {
        this.encryptionService = encryptionService;
        LOG.info("✓ Encrypted field event listener initialized");
    }

    @Override
    public void onBeforeSave(BeforeSaveEvent<Object> event) {
        Object source = event.getSource();
        Document document = event.getDocument();
        if (document == null)
            return;
        processFieldsForEncryption(source.getClass(), source, document);
    }

    @Override
    public void onAfterConvert(AfterConvertEvent<Object> event) {
        Object source = event.getSource();
        ReflectionUtils.doWithFields(source.getClass(), field -> {
            if (AnnotationUtils.findAnnotation(field, Encrypted.class) != null) {
                field.setAccessible(true);
                Object value = field.get(source);
                if (value instanceof String stringValue && encryptionService.isEncrypted(stringValue)) {
                    field.set(source, encryptionService.decrypt(stringValue));
                }
            }
        });
    }

    private void processFieldsForEncryption(Class<?> clazz, Object source, Document document) {
        ReflectionUtils.doWithFields(clazz, field -> {
            if (AnnotationUtils.findAnnotation(field, Encrypted.class) != null) {
                encryptField(field, source, document);
            }
        });
        Class<?> superclass = clazz.getSuperclass();
        if (superclass != null && superclass != Object.class) {
            processFieldsForEncryption(superclass, source, document);
        }
    }

    private void encryptField(Field field, Object source, Document document) {
        try {
            field.setAccessible(true);
            Object value = field.get(source);
            if (value instanceof String stringValue && !stringValue.isEmpty()) {
                org.springframework.data.mongodb.core.mapping.Field fieldAnnotation = field.getAnnotation(
                        org.springframework.data.mongodb.core.mapping.Field.class);
                String mongoFieldName = fieldAnnotation != null ? fieldAnnotation.value() : field.getName();
                if (!encryptionService.isEncrypted(stringValue)) {
                    document.put(mongoFieldName, encryptionService.encrypt(stringValue));
                }
            }
        } catch (IllegalAccessException e) {
            LOG.error("Failed to encrypt field: {}", field.getName(), e);
        }
    }
}
