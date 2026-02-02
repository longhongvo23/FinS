/**
 * Field-Level Encryption package for MongoDB security.
 * 
 * This package provides application-level encryption for sensitive data stored
 * in MongoDB.
 * Even if the database files are stolen or accessed by unauthorized users, the
 * encrypted
 * fields cannot be read without the master encryption key.
 * 
 * Components:
 * - {@link com.stockapp.userservice.security.encryption.Encrypted} - Annotation
 * to mark sensitive fields
 * - {@link com.stockapp.userservice.security.encryption.FieldEncryptionService}
 * - Core encryption/decryption service
 * -
 * {@link com.stockapp.userservice.security.encryption.EncryptedFieldEventListener}
 * - MongoDB event listener for automatic encryption
 * 
 * Usage:
 * 
 * <pre>
 * &#64;Document(collection = "users")
 * public class User {
 * 
 *     &#64;Encrypted(reason = "PII - Personal email address")
 *     &#64;Field("email")
 *     private String email;
 * 
 *     @Encrypted(reason = "Sensitive financial data")
 *     &#64;Field("bank_account")
 *     private String bankAccount;
 * }
 * </pre>
 * 
 * Configuration (application.yml):
 * 
 * <pre>
 * application:
 *   security:
 *     encryption:
 *       master-key: ${ENCRYPTION_MASTER_KEY}
 *       salt: ${ENCRYPTION_SALT:YourUniqueSalt}
 * </pre>
 * 
 * Security Considerations:
 * - The master key should be stored securely (environment variable, vault,
 * etc.)
 * - Never commit the master key to version control
 * - Different environments should use different keys
 * - Key rotation requires re-encrypting all data
 * 
 * @author StockApp Security Team
 * @since 1.0
 */
package com.stockapp.userservice.security.encryption;
