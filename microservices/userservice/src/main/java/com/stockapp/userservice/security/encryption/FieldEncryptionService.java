package com.stockapp.userservice.security.encryption;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Field-Level Encryption Service using AES-256-GCM.
 * 
 * This service provides application-level encryption for sensitive data before
 * storing in MongoDB. Even if the database is compromised, encrypted fields
 * cannot be read without the encryption key.
 * 
 * Security Features:
 * - AES-256-GCM: Authenticated encryption with 256-bit key
 * - Random IV: Each encryption uses a unique 12-byte IV
 * - PBKDF2: Key derivation from master secret with 100,000 iterations
 * - Base64: Ciphertext is encoded for storage in MongoDB strings
 * 
 * Ciphertext Format: Base64(IV || Ciphertext || AuthTag)
 * 
 * @author StockApp Security Team
 */
@Component
public class FieldEncryptionService {

    private static final Logger LOG = LoggerFactory.getLogger(FieldEncryptionService.class);

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96 bits
    private static final int GCM_TAG_LENGTH = 128; // bits
    private static final int KEY_LENGTH = 256; // bits
    private static final int PBKDF2_ITERATIONS = 100_000;
    private static final String PBKDF2_ALGORITHM = "PBKDF2WithHmacSHA256";

    // Prefix to identify encrypted values
    private static final String ENCRYPTED_PREFIX = "ENC:";

    private final SecretKey secretKey;
    private final SecureRandom secureRandom;

    /**
     * Initialize the encryption service with the master key from configuration.
     * The master key is derived using PBKDF2 for additional security.
     */
    public FieldEncryptionService(
            @Value("${application.security.encryption.master-key:#{null}}") String masterKey,
            @Value("${application.security.encryption.salt:StockAppEncryptionSalt2024}") String salt) {

        if (masterKey == null || masterKey.isBlank()) {
            // Generate a random key for development - WARN in logs
            LOG.warn("⚠️ No encryption master key configured! Using random key. Data will be lost on restart!");
            LOG.warn("⚠️ Set 'application.security.encryption.master-key' in production!");
            masterKey = generateRandomMasterKey();
        }

        this.secretKey = deriveKey(masterKey, salt);
        this.secureRandom = new SecureRandom();

        LOG.info("✓ Field encryption service initialized with AES-256-GCM");
    }

    /**
     * Encrypt a plaintext string.
     * 
     * @param plaintext The value to encrypt
     * @return Base64 encoded ciphertext with IV prefix, or null if input is null
     */
    public String encrypt(String plaintext) {
        if (plaintext == null) {
            return null;
        }

        if (plaintext.isEmpty()) {
            return plaintext;
        }

        // Don't double-encrypt
        if (isEncrypted(plaintext)) {
            return plaintext;
        }

        try {
            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            // Initialize cipher
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            // Encrypt
            byte[] plaintextBytes = plaintext.getBytes(StandardCharsets.UTF_8);
            byte[] ciphertext = cipher.doFinal(plaintextBytes);

            // Combine IV + Ciphertext
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            byteBuffer.put(iv);
            byteBuffer.put(ciphertext);

            // Encode to Base64 with prefix
            String encoded = Base64.getEncoder().encodeToString(byteBuffer.array());
            return ENCRYPTED_PREFIX + encoded;

        } catch (Exception e) {
            LOG.error("Encryption failed", e);
            throw new EncryptionException("Failed to encrypt value", e);
        }
    }

    /**
     * Decrypt a ciphertext string.
     * 
     * @param ciphertext Base64 encoded ciphertext with IV
     * @return Decrypted plaintext, or null if input is null
     */
    public String decrypt(String ciphertext) {
        if (ciphertext == null) {
            return null;
        }

        if (ciphertext.isEmpty()) {
            return ciphertext;
        }

        // Not encrypted - return as-is
        if (!isEncrypted(ciphertext)) {
            return ciphertext;
        }

        try {
            // Remove prefix and decode
            String encoded = ciphertext.substring(ENCRYPTED_PREFIX.length());
            byte[] decoded = Base64.getDecoder().decode(encoded);

            // Extract IV and ciphertext
            ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);
            byte[] encryptedBytes = new byte[byteBuffer.remaining()];
            byteBuffer.get(encryptedBytes);

            // Initialize cipher for decryption
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            // Decrypt
            byte[] plaintextBytes = cipher.doFinal(encryptedBytes);
            return new String(plaintextBytes, StandardCharsets.UTF_8);

        } catch (Exception e) {
            LOG.error("Decryption failed", e);
            throw new EncryptionException("Failed to decrypt value", e);
        }
    }

    /**
     * Check if a value is already encrypted.
     */
    public boolean isEncrypted(String value) {
        return value != null && value.startsWith(ENCRYPTED_PREFIX);
    }

    /**
     * Derive encryption key from master key using PBKDF2.
     */
    private SecretKey deriveKey(String masterKey, String salt) {
        try {
            SecretKeyFactory factory = SecretKeyFactory.getInstance(PBKDF2_ALGORITHM);
            PBEKeySpec spec = new PBEKeySpec(
                    masterKey.toCharArray(),
                    salt.getBytes(StandardCharsets.UTF_8),
                    PBKDF2_ITERATIONS,
                    KEY_LENGTH);
            byte[] keyBytes = factory.generateSecret(spec).getEncoded();
            return new SecretKeySpec(keyBytes, ALGORITHM);
        } catch (Exception e) {
            throw new EncryptionException("Failed to derive encryption key", e);
        }
    }

    /**
     * Generate a random master key for development.
     */
    private String generateRandomMasterKey() {
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key);
        return Base64.getEncoder().encodeToString(key);
    }

    /**
     * Mask a value for logging (show first 2 and last 2 characters).
     */
    public String maskForLogging(String value) {
        if (value == null || value.length() <= 4) {
            return "****";
        }
        return value.substring(0, 2) + "****" + value.substring(value.length() - 2);
    }
}
