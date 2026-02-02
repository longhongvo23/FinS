package com.stockapp.userservice.security.encryption;

/**
 * Supported encryption algorithms for field-level encryption.
 */
public enum EncryptionAlgorithm {

    /**
     * AES-256 with GCM mode (Galois/Counter Mode).
     * Provides authenticated encryption - ensures both confidentiality and
     * integrity.
     * Recommended for most use cases.
     */
    AES_256_GCM("AES/GCM/NoPadding", 256, 12, 128),

    /**
     * AES-256 with CBC mode and PKCS5 padding.
     * Classic encryption mode, requires separate MAC for integrity.
     */
    AES_256_CBC("AES/CBC/PKCS5Padding", 256, 16, 0),

    /**
     * ChaCha20-Poly1305.
     * Modern authenticated encryption, faster on CPUs without AES-NI.
     */
    CHACHA20_POLY1305("ChaCha20-Poly1305", 256, 12, 128);

    private final String transformation;
    private final int keySize;
    private final int ivSize;
    private final int tagSize;

    EncryptionAlgorithm(String transformation, int keySize, int ivSize, int tagSize) {
        this.transformation = transformation;
        this.keySize = keySize;
        this.ivSize = ivSize;
        this.tagSize = tagSize;
    }

    public String getTransformation() {
        return transformation;
    }

    public int getKeySize() {
        return keySize;
    }

    public int getIvSize() {
        return ivSize;
    }

    public int getTagSize() {
        return tagSize;
    }
}
