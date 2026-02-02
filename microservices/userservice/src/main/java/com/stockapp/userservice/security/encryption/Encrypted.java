package com.stockapp.userservice.security.encryption;

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
 * Example usage:
 * 
 * <pre>
 * {
 *     &#64;code
 *     &#64;Encrypted
 *     &#64;Field("email")
 *     private String email;
 * 
 *     @Encrypted
 *     &#64;Field("phone_number")
 *     private String phoneNumber;
 * }
 * </pre>
 * 
 * Note: Encrypted fields cannot be used in MongoDB queries (equality search,
 * range queries, etc.)
 * because the ciphertext is different each time due to random IV.
 * 
 * @author StockApp Security Team
 * @since 1.0
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Encrypted {

    /**
     * Optional description of why this field needs encryption.
     * Used for documentation purposes.
     */
    String reason() default "";

    /**
     * The encryption algorithm to use.
     * Default is AES-256-GCM which provides authenticated encryption.
     */
    EncryptionAlgorithm algorithm() default EncryptionAlgorithm.AES_256_GCM;

    /**
     * Whether to mask the value in logs.
     * Default is true for security.
     */
    boolean maskInLogs() default true;
}
