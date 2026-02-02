package com.stockapp.userservice.security.encryption;

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

/**
 * MongoDB Event Listener that automatically encrypts/decrypts fields marked
 * with @Encrypted.
 * 
 * This listener intercepts MongoDB save and load operations to:
 * - BeforeSave: Encrypt all @Encrypted fields before writing to database
 * - AfterConvert: Decrypt all @Encrypted fields after reading from database
 * 
 * Usage: Simply add @Encrypted annotation to sensitive fields in your entity
 * classes.
 * No other code changes required.
 * 
 * Example:
 * 
 * <pre>
 * &#64;Document(collection = "app_user")
 * public class AppUser {
 * 
 *     &#64;Encrypted(reason = "PII - Personal email")
 *     &#64;Field("email")
 *     private String email;
 * 
 *     @Encrypted(reason = "Sensitive authentication data")
 *     &#64;Field("two_factor_secret")
 *     private String twoFactorSecret;
 * }
 * </pre>
 * 
 * @author StockApp Security Team
 */
@Component
public class EncryptedFieldEventListener extends AbstractMongoEventListener<Object> {

    private static final Logger LOG = LoggerFactory.getLogger(EncryptedFieldEventListener.class);

    private final FieldEncryptionService encryptionService;

    public EncryptedFieldEventListener(FieldEncryptionService encryptionService) {
        this.encryptionService = encryptionService;
        LOG.info("✓ Encrypted field event listener initialized");
    }

    /**
     * Before saving to MongoDB: Encrypt all @Encrypted fields.
     */
    @Override
    public void onBeforeSave(BeforeSaveEvent<Object> event) {
        Object source = event.getSource();
        Document document = event.getDocument();

        if (document == null) {
            return;
        }

        processFields(source.getClass(), source, document, true);
    }

    /**
     * After loading from MongoDB: Decrypt all @Encrypted fields.
     */
    @Override
    public void onAfterConvert(AfterConvertEvent<Object> event) {
        Object source = event.getSource();

        ReflectionUtils.doWithFields(source.getClass(), field -> {
            Encrypted encrypted = AnnotationUtils.findAnnotation(field, Encrypted.class);
            if (encrypted != null) {
                field.setAccessible(true);
                Object value = field.get(source);

                if (value instanceof String stringValue) {
                    if (encryptionService.isEncrypted(stringValue)) {
                        String decrypted = encryptionService.decrypt(stringValue);
                        field.set(source, decrypted);

                        if (LOG.isTraceEnabled()) {
                            LOG.trace("Decrypted field: {}.{}",
                                    source.getClass().getSimpleName(),
                                    field.getName());
                        }
                    }
                }
            }
        });
    }

    /**
     * Process all fields of an entity for encryption.
     */
    private void processFields(Class<?> clazz, Object source, Document document, boolean encrypt) {
        ReflectionUtils.doWithFields(clazz, field -> {
            Encrypted encrypted = AnnotationUtils.findAnnotation(field, Encrypted.class);
            if (encrypted != null) {
                processEncryptedField(field, source, document, encrypted);
            }
        });

        // Process superclass fields
        Class<?> superclass = clazz.getSuperclass();
        if (superclass != null && superclass != Object.class) {
            processFields(superclass, source, document, encrypt);
        }
    }

    /**
     * Encrypt a single field and update the document.
     */
    private void processEncryptedField(Field field, Object source, Document document, Encrypted annotation) {
        try {
            field.setAccessible(true);
            Object value = field.get(source);

            if (value instanceof String stringValue && !stringValue.isEmpty()) {
                // Get the MongoDB field name from @Field annotation
                org.springframework.data.mongodb.core.mapping.Field fieldAnnotation = field
                        .getAnnotation(org.springframework.data.mongodb.core.mapping.Field.class);

                String mongoFieldName = fieldAnnotation != null ? fieldAnnotation.value() : field.getName();

                // Encrypt and update document
                if (!encryptionService.isEncrypted(stringValue)) {
                    String encryptedValue = encryptionService.encrypt(stringValue);
                    document.put(mongoFieldName, encryptedValue);

                    if (LOG.isDebugEnabled()) {
                        LOG.debug("Encrypted field: {}.{} -> {}",
                                source.getClass().getSimpleName(),
                                field.getName(),
                                annotation.maskInLogs() ? encryptionService.maskForLogging(encryptedValue)
                                        : encryptedValue);
                    }
                }
            }
        } catch (IllegalAccessException e) {
            LOG.error("Failed to encrypt field: {}", field.getName(), e);
        }
    }
}
