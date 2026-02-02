package com.stockapp.notificationservice.security.encryption;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark fields that should be encrypted before storing in MongoDB.
 * 
 * When applied to a field, the FieldEncryptionConverter will automatically:
 * - Encrypt the value before saving to database
 * - Decrypt the value when reading from database
 * 
 * Security Features:
 * - Uses AES-256-GCM encryption (authenticated encryption)
 * - Each encrypted value has unique IV (Initialization Vector)
 * - Key is derived from application secret using PBKDF2
 * 
 * @author StockApp Security Team
 * @since 1.0
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Encrypted {

    /**
     * Optional description of why this field needs encryption.
     */
    String reason() default "";

    /**
     * Whether to mask the value in logs.
     */
    boolean maskInLogs() default true;
}
