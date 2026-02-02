package com.stockapp.userservice.web.rest;

import com.stockapp.userservice.domain.enumeration.AccountStatus;
import com.stockapp.userservice.repository.AppUserRepository;
import com.stockapp.userservice.security.jwt.TokenProvider;
import com.stockapp.userservice.service.AppUserService;
import com.stockapp.userservice.service.MailService;
import com.stockapp.userservice.service.SessionService;
import com.stockapp.userservice.service.UserProfileService;
import com.stockapp.userservice.service.dto.AppUserDTO;
import com.stockapp.userservice.service.dto.UserProfileDTO;
import com.stockapp.userservice.service.util.DeviceInfoParser;
import com.stockapp.userservice.web.rest.vm.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST controller for managing authentication
 * 
 * This controller provides endpoints for:
 * - User registration
 * - User login
 * - Token refresh
 * - Logout
 * - Password reset flow (forgot password, reset password)
 * - Email verification
 * - Change password
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication API", description = "Endpoints for user authentication and account management")
public class AuthResource {

        private static final Logger LOG = LoggerFactory.getLogger(AuthResource.class);

        private final AppUserService appUserService;
        private final AppUserRepository appUserRepository;
        private final PasswordEncoder passwordEncoder;
        private final TokenProvider tokenProvider;
        private final MailService mailService;
        private final UserProfileService userProfileService;
        private final SessionService sessionService;

        public AuthResource(
                        AppUserService appUserService,
                        AppUserRepository appUserRepository,
                        PasswordEncoder passwordEncoder,
                        TokenProvider tokenProvider,
                        MailService mailService,
                        UserProfileService userProfileService,
                        SessionService sessionService) {
                this.appUserService = appUserService;
                this.appUserRepository = appUserRepository;
                this.passwordEncoder = passwordEncoder;
                this.tokenProvider = tokenProvider;
                this.mailService = mailService;
                this.userProfileService = userProfileService;
                this.sessionService = sessionService;
        }

        /**
         * POST /api/auth/register : Register a new user account
         *
         * @param registerVM the registration information
         * @return the ResponseEntity with status 201 (Created) and the created user, or
         *         status 400 (Bad Request) if validation fails
         */
        @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Register new user", description = "Create a new user account with email verification")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "User successfully registered"),
                        @ApiResponse(responseCode = "400", description = "Invalid registration data or user already exists"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public Mono<ResponseEntity<MessageResponseVM>> registerUser(@Valid @RequestBody RegisterVM registerVM) {
                LOG.debug("REST request to register user: {}", registerVM.getLogin());

                // Check if login already exists
                return appUserService.findByLogin(registerVM.getLogin())
                                .flatMap(existingUser -> {
                                        LOG.warn("Login already exists: {}", registerVM.getLogin());
                                        return Mono.just(ResponseEntity.badRequest()
                                                        .body(new MessageResponseVM("Username already exists", false)));
                                })
                                .switchIfEmpty(Mono.defer(() ->
                                // Check if email already exists
                                appUserService.findByEmail(registerVM.getEmail())
                                                .flatMap(existingUser -> {
                                                        LOG.warn("Email already exists: {}", registerVM.getEmail());
                                                        return Mono.just(ResponseEntity.badRequest()
                                                                        .body(new MessageResponseVM(
                                                                                        "Email already exists",
                                                                                        false)));
                                                })
                                                .switchIfEmpty(Mono.defer(() -> {
                                                        // Create new user
                                                        AppUserDTO newUser = new AppUserDTO();
                                                        newUser.setLogin(registerVM.getLogin().toLowerCase());
                                                        newUser.setEmail(registerVM.getEmail().toLowerCase());
                                                        newUser.setPassword(passwordEncoder
                                                                        .encode(registerVM.getPassword()));
                                                        newUser.setActivated(false); // Require email verification
                                                        newUser.setAccountStatus(AccountStatus.PENDING_VERIFICATION);
                                                        newUser.setEmailVerified(false);
                                                        newUser.setCreatedDate(Instant.now());
                                                        newUser.setLanguage(registerVM.getLanguage() != null
                                                                        ? registerVM.getLanguage()
                                                                        : "en");
                                                        newUser.setTwoFactorEnabled(false);
                                                        newUser.setFailedLoginAttempts(0);

                                                        // Generate activation key for email verification
                                                        String activationKey = UUID.randomUUID().toString();
                                                        newUser.setActivationKey(activationKey);
                                                        newUser.setEmailVerificationToken(activationKey);
                                                        newUser.setEmailVerificationTokenExpiry(
                                                                        Instant.now().plus(24, ChronoUnit.HOURS));

                                                        return appUserService.save(newUser)
                                                                        .flatMap(user -> {
                                                                                LOG.info("Successfully registered user: {}",
                                                                                                user.getLogin());
                                                                                // Send activation email
                                                                                return mailService
                                                                                                .sendActivationEmail(
                                                                                                                user)
                                                                                                .thenReturn(user);
                                                                        })
                                                                        .map(user -> ResponseEntity
                                                                                        .status(HttpStatus.CREATED)
                                                                                        .body(new MessageResponseVM(
                                                                                                        "Registration successful. Please check your email to verify your account.")));
                                                }))));
        }

        /**
         * POST /api/auth/login : Authenticate user and return JWT token
         *
         * @param loginVM  the login credentials
         * @param exchange the server web exchange for request info
         * @return the ResponseEntity with status 200 (OK) and the JWT token
         */
        @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Login user", description = "Authenticate user with username/email and password, returns JWT tokens")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully authenticated"),
                        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
                        @ApiResponse(responseCode = "403", description = "Account locked or not activated")
        })
        public Mono<ResponseEntity<AuthResponseVM>> login(@Valid @RequestBody LoginVM loginVM,
                        ServerWebExchange exchange) {
                LOG.debug("REST request to login user: {}", loginVM.getUsername());

                // Extract client info from request
                ServerHttpRequest request = exchange.getRequest();
                String userAgent = request.getHeaders().getFirst("User-Agent");
                String deviceId = request.getHeaders().getFirst("X-Device-Id");
                String ipAddress = getClientIpAddress(request);

                return appUserService.findByLoginOrEmail(loginVM.getUsername().toLowerCase())
                                .flatMap(user -> {
                                        // Check if account is locked
                                        if (user.getAccountLockedUntil() != null
                                                        && user.getAccountLockedUntil().isAfter(Instant.now())) {
                                                return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                                                .body(new AuthResponseVM()));
                                        }

                                        // Check if account is activated
                                        if (!user.getActivated()) {
                                                return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                                                .body(new AuthResponseVM()));
                                        }

                                        // Verify password
                                        if (!passwordEncoder.matches(loginVM.getPassword(), user.getPassword())) {
                                                // Increment failed login attempts
                                                Integer failedAttempts = user.getFailedLoginAttempts() != null
                                                                ? user.getFailedLoginAttempts() + 1
                                                                : 1;
                                                user.setFailedLoginAttempts(failedAttempts);

                                                // Lock account after 5 failed attempts
                                                if (failedAttempts >= 5) {
                                                        user.setAccountLockedUntil(
                                                                        Instant.now().plus(30, ChronoUnit.MINUTES));
                                                        user.setAccountStatus(AccountStatus.LOCKED);
                                                }

                                                return appUserService.update(user)
                                                                .then(Mono.just(ResponseEntity
                                                                                .status(HttpStatus.UNAUTHORIZED)
                                                                                .body(new AuthResponseVM())));
                                        }

                                        // Reset failed login attempts on successful login
                                        user.setFailedLoginAttempts(0);
                                        user.setAccountLockedUntil(null);
                                        user.setLastLoginDate(Instant.now());
                                        user.setLastLoginIp(ipAddress);
                                        return appUserService.update(user)
                                                        .flatMap(updatedUser -> {
                                                                // Get user authorities
                                                                Set<String> authorities = updatedUser
                                                                                .getAuthorities() != null
                                                                                                ? updatedUser.getAuthorities()
                                                                                                                .stream()
                                                                                                                .map(auth -> auth
                                                                                                                                .getName())
                                                                                                                .collect(Collectors
                                                                                                                                .toSet())
                                                                                                : Set.of("ROLE_USER");

                                                                // Generate JWT access token
                                                                boolean rememberMe = loginVM.getRememberMe() != null
                                                                                && loginVM.getRememberMe();
                                                                String accessToken = tokenProvider.createToken(
                                                                                updatedUser.getLogin(),
                                                                                authorities,
                                                                                rememberMe);

                                                                // Generate refresh token (simple UUID for now)
                                                                String refreshToken = UUID.randomUUID().toString();

                                                                // Get token validity
                                                                long expiresIn = tokenProvider
                                                                                .getTokenValidityInSeconds(rememberMe);

                                                                // Create response
                                                                AuthResponseVM response = new AuthResponseVM(
                                                                                accessToken, refreshToken, expiresIn);
                                                                response.setLogin(updatedUser.getLogin());
                                                                response.setEmail(updatedUser.getEmail());
                                                                response.setAuthorities(
                                                                                authorities.toArray(new String[0]));

                                                                LOG.info("User logged in successfully: {}",
                                                                                updatedUser.getLogin());

                                                                // Create session record for tracking
                                                                SessionService.DeviceInfo deviceInfo = DeviceInfoParser
                                                                                .parse(userAgent, deviceId, null);

                                                                // First, get user profile for avatar and fullName
                                                                // (independent of session)
                                                                Mono<ResponseEntity<AuthResponseVM>> profileMono = userProfileService
                                                                                .findByUserLogin(updatedUser.getLogin())
                                                                                .map(profile -> {
                                                                                        if (profile.getAvatarUrl() != null) {
                                                                                                response.setAvatarUrl(
                                                                                                                profile.getAvatarUrl());
                                                                                        }
                                                                                        if (profile.getFullName() != null) {
                                                                                                response.setFullName(
                                                                                                                profile.getFullName());
                                                                                        }
                                                                                        return ResponseEntity
                                                                                                        .ok(response);
                                                                                })
                                                                                .defaultIfEmpty(ResponseEntity
                                                                                                .ok(response));

                                                                // Create session asynchronously (don't block response)
                                                                appUserRepository.findByLogin(updatedUser.getLogin())
                                                                                .flatMap(appUserEntity -> sessionService
                                                                                                .createSession(
                                                                                                                appUserEntity,
                                                                                                                accessToken,
                                                                                                                refreshToken,
                                                                                                                ipAddress,
                                                                                                                userAgent,
                                                                                                                deviceInfo,
                                                                                                                rememberMe))
                                                                                .subscribe(
                                                                                                session -> LOG.debug(
                                                                                                                "Session created: {}",
                                                                                                                session.getId()),
                                                                                                error -> LOG.warn(
                                                                                                                "Failed to create session: {}",
                                                                                                                error.getMessage()));

                                                                return profileMono;
                                                        });
                                })
                                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                                .body(new AuthResponseVM()));
        }

        /**
         * Get client IP address from request, handling proxy headers
         */
        private String getClientIpAddress(ServerHttpRequest request) {
                String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                        return xForwardedFor.split(",")[0].trim();
                }
                String xRealIp = request.getHeaders().getFirst("X-Real-IP");
                if (xRealIp != null && !xRealIp.isEmpty()) {
                        return xRealIp;
                }
                if (request.getRemoteAddress() != null) {
                        return request.getRemoteAddress().getAddress().getHostAddress();
                }
                return "0.0.0.0";
        }

        /**
         * GET /api/auth/activate : Activate user account with activation key
         *
         * @param key the activation key from email
         * @return the ResponseEntity with status message
         */
        @GetMapping("/activate")
        @Operation(summary = "Activate account", description = "Activate user account using the key sent via email")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Account activated successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid or expired activation key")
        })
        public Mono<ResponseEntity<MessageResponseVM>> activateAccount(
                        @Parameter(description = "Activation key from email") @RequestParam(value = "key") String key) {
                LOG.debug("REST request to activate account with key: {}", key);

                return appUserService.findByActivationKey(key)
                                .flatMap(user -> {
                                        // Check if already activated
                                        if (user.getActivated()) {
                                                return Mono.just(ResponseEntity.ok()
                                                                .body(new MessageResponseVM("Account already activated",
                                                                                true)));
                                        }

                                        // Check if activation token expired
                                        if (user.getEmailVerificationTokenExpiry() != null &&
                                                        user.getEmailVerificationTokenExpiry()
                                                                        .isBefore(Instant.now())) {
                                                return Mono.just(ResponseEntity.badRequest()
                                                                .body(new MessageResponseVM(
                                                                                "Activation key expired. Please register again.",
                                                                                false)));
                                        }

                                        // Activate account
                                        user.setActivated(true);
                                        user.setEmailVerified(true);
                                        user.setAccountStatus(AccountStatus.ACTIVE);
                                        user.setActivationKey(null);
                                        user.setEmailVerificationToken(null);
                                        user.setEmailVerificationTokenExpiry(null);

                                        return appUserService.update(user)
                                                        .map(updatedUser -> {
                                                                LOG.info("Account activated successfully: {}",
                                                                                updatedUser.getLogin());
                                                                return ResponseEntity.ok()
                                                                                .body(new MessageResponseVM(
                                                                                                "Account activated successfully. You can now login.",
                                                                                                true));
                                                        });
                                })
                                .switchIfEmpty(Mono.just(ResponseEntity.badRequest()
                                                .body(new MessageResponseVM("Invalid activation key", false))));
        }

        /**
         * POST /api/auth/refresh : Refresh JWT access token
         *
         * @param refreshTokenVM the refresh token
         * @return the ResponseEntity with new access token
         */
        @PostMapping(value = "/refresh", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Refresh access token", description = "Get a new access token using refresh token")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
                        @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
        })
        public Mono<ResponseEntity<AuthResponseVM>> refreshToken(@Valid @RequestBody RefreshTokenVM refreshTokenVM) {
                LOG.debug("REST request to refresh token");

                // TODO: Implement refresh token logic
                // 1. Validate refresh token
                // 2. Check if token is not expired or revoked
                // 3. Generate new access token
                // 4. Optionally rotate refresh token

                AuthResponseVM response = new AuthResponseVM(
                                "new_jwt_access_token_placeholder",
                                "new_jwt_refresh_token_placeholder",
                                3600L);

                return Mono.just(ResponseEntity.ok(response));
        }

        /**
         * POST /api/auth/logout : Logout user and invalidate tokens
         *
         * @return the ResponseEntity with status 200 (OK)
         */
        @PostMapping("/logout")
        @SecurityRequirement(name = "bearer-jwt")
        @Operation(summary = "Logout user", description = "Invalidate user tokens and end session")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully logged out")
        })
        public Mono<ResponseEntity<MessageResponseVM>> logout() {
                LOG.debug("REST request to logout user");

                return ReactiveSecurityContextHolder.getContext()
                                .map(SecurityContext::getAuthentication)
                                .map(Authentication::getName)
                                .flatMap(username -> {
                                        LOG.info("User logged out: {}", username);
                                        // TODO: Revoke refresh tokens for this user
                                        // TODO: Invalidate session
                                        return Mono.just(ResponseEntity
                                                        .ok(new MessageResponseVM("Logged out successfully")));
                                })
                                .defaultIfEmpty(ResponseEntity.ok(new MessageResponseVM("Logged out successfully")));
        }

        /**
         * POST /api/auth/forgot-password : Request password reset
         *
         * @param forgotPasswordVM the email to send reset link
         * @return the ResponseEntity with status 200 (OK)
         */
        @PostMapping(value = "/forgot-password", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Request password reset", description = "Send password reset email to user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Password reset email sent (if email exists)")
        })
        public Mono<ResponseEntity<MessageResponseVM>> forgotPassword(
                        @Valid @RequestBody ForgotPasswordVM forgotPasswordVM) {
                LOG.debug("REST request for password reset: {}", forgotPasswordVM.getEmail());

                return appUserService.findByEmail(forgotPasswordVM.getEmail().toLowerCase())
                                .flatMap(user -> {
                                        // Generate password reset token
                                        String resetToken = UUID.randomUUID().toString();
                                        user.setPasswordResetToken(resetToken);
                                        user.setPasswordResetTokenExpiry(Instant.now().plus(1, ChronoUnit.HOURS));

                                        return appUserService.update(user)
                                                        .doOnSuccess(updatedUser -> {
                                                                LOG.info("Password reset token generated for user: {}",
                                                                                updatedUser.getLogin());
                                                                // TODO: Send password reset email
                                                                // emailService.sendPasswordResetEmail(user.getEmail(),
                                                                // resetToken);
                                                        });
                                })
                                .then(Mono.just(ResponseEntity.ok(
                                                new MessageResponseVM(
                                                                "If your email exists, you will receive a password reset link shortly."))))
                                .defaultIfEmpty(ResponseEntity.ok(
                                                new MessageResponseVM(
                                                                "If your email exists, you will receive a password reset link shortly.")));
        }

        /**
         * POST /api/auth/reset-password : Reset password with token
         *
         * @param resetPasswordVM the reset token and new password
         * @return the ResponseEntity with status 200 (OK) or 400 (Bad Request)
         */
        @PostMapping(value = "/reset-password", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Reset password", description = "Reset password using reset token from email")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Password reset successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid or expired reset token")
        })
        public Mono<ResponseEntity<MessageResponseVM>> resetPassword(
                        @Valid @RequestBody ResetPasswordVM resetPasswordVM) {
                LOG.debug("REST request to reset password with token");

                return appUserService.findByPasswordResetToken(resetPasswordVM.getToken())
                                .flatMap(user -> {
                                        // Check if token is expired
                                        if (user.getPasswordResetTokenExpiry() == null ||
                                                        user.getPasswordResetTokenExpiry().isBefore(Instant.now())) {
                                                return Mono.just(ResponseEntity.badRequest()
                                                                .body(new MessageResponseVM(
                                                                                "Password reset token has expired",
                                                                                false)));
                                        }

                                        // Update password
                                        user.setPassword(passwordEncoder.encode(resetPasswordVM.getNewPassword()));
                                        user.setPasswordResetToken(null);
                                        user.setPasswordResetTokenExpiry(null);
                                        user.setLastPasswordChangeDate(Instant.now());
                                        user.setFailedLoginAttempts(0);

                                        return appUserService.update(user)
                                                        .doOnSuccess(updatedUser -> {
                                                                LOG.info("Password reset successfully for user: {}",
                                                                                updatedUser.getLogin());
                                                                // TODO: Save to password history
                                                                // TODO: Send confirmation email
                                                        })
                                                        .map(updatedUser -> ResponseEntity.ok(
                                                                        new MessageResponseVM(
                                                                                        "Password reset successfully. You can now login with your new password.")));
                                })
                                .defaultIfEmpty(ResponseEntity.badRequest()
                                                .body(new MessageResponseVM("Invalid password reset token", false)));
        }

        /**
         * GET /api/auth/verify-email : Verify email with token
         *
         * @param token the email verification token
         * @return the ResponseEntity with status 200 (OK) or 400 (Bad Request)
         */
        @GetMapping("/verify-email")
        @Operation(summary = "Verify email", description = "Verify user email address using token from email")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Email verified successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid or expired verification token")
        })
        public Mono<ResponseEntity<MessageResponseVM>> verifyEmail(
                        @Parameter(description = "Email verification token", required = true) @RequestParam String token) {
                LOG.debug("REST request to verify email with token");

                return appUserService.findByEmailVerificationToken(token)
                                .flatMap(user -> {
                                        // Check if token is expired
                                        if (user.getEmailVerificationTokenExpiry() == null ||
                                                        user.getEmailVerificationTokenExpiry()
                                                                        .isBefore(Instant.now())) {
                                                return Mono.just(ResponseEntity.badRequest()
                                                                .body(new MessageResponseVM(
                                                                                "Email verification token has expired",
                                                                                false)));
                                        }

                                        // Activate user
                                        user.setActivated(true);
                                        user.setEmailVerified(true);
                                        user.setAccountStatus(AccountStatus.ACTIVE);
                                        user.setEmailVerificationToken(null);
                                        user.setEmailVerificationTokenExpiry(null);

                                        return appUserService.update(user)
                                                        .doOnSuccess(updatedUser -> {
                                                                LOG.info("Email verified successfully for user: {}",
                                                                                updatedUser.getLogin());
                                                                // TODO: Send welcome email
                                                        })
                                                        .map(updatedUser -> ResponseEntity.ok(
                                                                        new MessageResponseVM(
                                                                                        "Email verified successfully. Your account is now active.")));
                                })
                                .defaultIfEmpty(ResponseEntity.badRequest()
                                                .body(new MessageResponseVM("Invalid email verification token",
                                                                false)));
        }

        /**
         * POST /api/auth/change-password : Change password for authenticated user
         *
         * @param changePasswordVM the current and new password
         * @return the ResponseEntity with status 200 (OK) or 400 (Bad Request)
         */
        @PostMapping(value = "/change-password", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
        @SecurityRequirement(name = "bearer-jwt")
        @Operation(summary = "Change password", description = "Change password for authenticated user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Password changed successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid current password or validation failed"),
                        @ApiResponse(responseCode = "401", description = "User not authenticated")
        })
        public Mono<ResponseEntity<MessageResponseVM>> changePassword(
                        @Valid @RequestBody ChangePasswordVM changePasswordVM) {
                LOG.debug("REST request to change password");

                return ReactiveSecurityContextHolder.getContext()
                                .map(SecurityContext::getAuthentication)
                                .map(Authentication::getName)
                                .flatMap(appUserService::findByLogin)
                                .flatMap(user -> {
                                        // Verify current password
                                        if (!passwordEncoder.matches(changePasswordVM.getCurrentPassword(),
                                                        user.getPassword())) {
                                                return Mono.just(ResponseEntity.badRequest()
                                                                .body(new MessageResponseVM(
                                                                                "Current password is incorrect",
                                                                                false)));
                                        }

                                        // Update to new password
                                        user.setPassword(passwordEncoder.encode(changePasswordVM.getNewPassword()));
                                        user.setLastPasswordChangeDate(Instant.now());

                                        return appUserService.update(user)
                                                        .doOnSuccess(updatedUser -> {
                                                                LOG.info("Password changed successfully for user: {}",
                                                                                updatedUser.getLogin());
                                                                // TODO: Save to password history
                                                                // TODO: Send confirmation email
                                                                // TODO: Optionally revoke all refresh tokens
                                                        })
                                                        .map(updatedUser -> ResponseEntity.ok(
                                                                        new MessageResponseVM(
                                                                                        "Password changed successfully")));
                                })
                                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                                .body(new MessageResponseVM("User not found", false)));
        }

        /**
         * GET /api/auth/me : Get current authenticated user
         *
         * @return the current user information
         */
        @GetMapping("/me")
        @SecurityRequirement(name = "bearer-jwt")
        @Operation(summary = "Get current user", description = "Get information of currently authenticated user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "User information retrieved"),
                        @ApiResponse(responseCode = "401", description = "User not authenticated")
        })
        public Mono<ResponseEntity<AppUserDTO>> getCurrentUser() {
                LOG.debug("REST request to get current user");

                return ReactiveSecurityContextHolder.getContext()
                                .map(SecurityContext::getAuthentication)
                                .map(Authentication::getName)
                                .flatMap(login -> appUserService.findByLogin(login)
                                                .flatMap(userDTO -> userProfileService.findByUserLogin(login)
                                                                .map(profile -> {
                                                                        // Add avatar from profile to user DTO
                                                                        if (profile.getAvatarUrl() != null) {
                                                                                userDTO.setAvatarUrl(
                                                                                                profile.getAvatarUrl());
                                                                        }
                                                                        return userDTO;
                                                                })
                                                                .defaultIfEmpty(userDTO)))
                                .map(ResponseEntity::ok)
                                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
        }

        /**
         * DELETE /api/auth/account : Delete current user's account
         *
         * @param deleteAccountVM the request containing the password for verification
         * @return the ResponseEntity with status 200 (OK) if account was deleted
         */
        @DeleteMapping("/account")
        @SecurityRequirement(name = "bearer-jwt")
        @Operation(summary = "Delete account", description = "Permanently delete the current user's account after password verification")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Account deleted successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid password"),
                        @ApiResponse(responseCode = "401", description = "User not authenticated")
        })
        public Mono<ResponseEntity<MessageResponseVM>> deleteAccount(
                        @Valid @RequestBody DeleteAccountVM deleteAccountVM) {
                LOG.debug("REST request to delete account");

                return ReactiveSecurityContextHolder.getContext()
                                .map(SecurityContext::getAuthentication)
                                .map(Authentication::getName)
                                .flatMap(appUserService::findByLogin)
                                .flatMap(user -> {
                                        // Verify password
                                        if (!passwordEncoder.matches(deleteAccountVM.getPassword(),
                                                        user.getPassword())) {
                                                return Mono.just(ResponseEntity.badRequest()
                                                                .body(new MessageResponseVM("Mật khẩu không đúng",
                                                                                false)));
                                        }

                                        // Delete user profile first
                                        return userProfileService.findByUserLogin(user.getLogin())
                                                        .flatMap(profile -> userProfileService.delete(profile.getId()))
                                                        .then(sessionService.revokeAllSessionsForUser(user.getLogin()))
                                                        .then(appUserService.delete(user.getId()))
                                                        .then(Mono.just(ResponseEntity.ok(
                                                                        new MessageResponseVM(
                                                                                        "Tài khoản đã được xóa thành công",
                                                                                        true))))
                                                        .onErrorResume(e -> {
                                                                LOG.error("Error deleting account: {}", e.getMessage());
                                                                return Mono.just(ResponseEntity.status(
                                                                                HttpStatus.INTERNAL_SERVER_ERROR)
                                                                                .body(new MessageResponseVM(
                                                                                                "Không thể xóa tài khoản. Vui lòng thử lại sau.",
                                                                                                false)));
                                                        });
                                })
                                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                                .body(new MessageResponseVM("User not found", false)));
        }
}
