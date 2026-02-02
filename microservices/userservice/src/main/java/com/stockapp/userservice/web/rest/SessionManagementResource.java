package com.stockapp.userservice.web.rest;

import com.stockapp.userservice.service.SessionService;
import com.stockapp.userservice.service.dto.SessionDTO;
import com.stockapp.userservice.web.rest.vm.MessageResponseVM;
import com.stockapp.userservice.web.rest.vm.SessionResponseVM;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for managing user sessions.
 * These endpoints allow users to view and manage their active login sessions.
 */
@RestController
@RequestMapping("/api/auth/sessions")
@Tag(name = "Session Management API", description = "Endpoints for managing user login sessions")
@SecurityRequirement(name = "bearer-jwt")
public class SessionManagementResource {

    private static final Logger LOG = LoggerFactory.getLogger(SessionManagementResource.class);

    private final SessionService sessionService;

    public SessionManagementResource(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    /**
     * GET /api/auth/sessions : Get all active sessions for the current user
     *
     * @param exchange the server web exchange to get current token
     * @return list of active sessions
     */
    @GetMapping("")
    @Operation(summary = "Get user sessions", description = "Get all active sessions for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved sessions"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public Mono<ResponseEntity<List<SessionResponseVM>>> getMySessions(ServerWebExchange exchange) {
        return getCurrentUsername()
                .flatMap(username -> {
                    LOG.debug("REST request to get sessions for user: {}", username);

                    // Get current token from header to identify current session
                    String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
                    String currentToken = authHeader != null && authHeader.startsWith("Bearer ")
                            ? authHeader.substring(7)
                            : null;

                    return sessionService.findActiveSessionsByUserLogin(username)
                            .map(session -> mapToResponse(session, currentToken))
                            .collectList()
                            .map(sessions -> {
                                // Sort by lastActivityTime descending (most recent first)
                                sessions.sort((a, b) -> {
                                    if (a.isCurrent())
                                        return -1;
                                    if (b.isCurrent())
                                        return 1;
                                    if (a.getLastActivityTime() == null)
                                        return 1;
                                    if (b.getLastActivityTime() == null)
                                        return -1;
                                    return b.getLastActivityTime().compareTo(a.getLastActivityTime());
                                });
                                return ResponseEntity.ok(sessions);
                            });
                })
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    /**
     * DELETE /api/auth/sessions/{id} : Revoke a specific session
     *
     * @param id the session ID to revoke
     * @return success message
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Revoke session", description = "Revoke a specific session by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Session revoked successfully"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Session not found")
    })
    public Mono<ResponseEntity<MessageResponseVM>> revokeSession(@PathVariable String id) {
        return getCurrentUsername()
                .flatMap(username -> {
                    LOG.debug("REST request to revoke session {} for user: {}", id, username);
                    return sessionService.revokeSessionForUser(id, username, "Revoked by user")
                            .map(session -> ResponseEntity
                                    .ok(new MessageResponseVM("Đã đăng xuất thiết bị thành công", true)))
                            .defaultIfEmpty(ResponseEntity.notFound().build());
                })
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    /**
     * DELETE /api/auth/sessions/logout-all : Logout from all devices except current
     *
     * @param exchange the server web exchange to get current token
     * @return success message with count of revoked sessions
     */
    @DeleteMapping("/logout-all")
    @Operation(summary = "Logout all other devices", description = "Revoke all sessions except the current one")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "All other sessions revoked"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public Mono<ResponseEntity<MessageResponseVM>> logoutAllOtherDevices(ServerWebExchange exchange) {
        return getCurrentUsername()
                .flatMap(username -> {
                    LOG.debug("REST request to logout all other devices for user: {}", username);

                    // Get current token to find current session
                    String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
                    String currentToken = authHeader != null && authHeader.startsWith("Bearer ")
                            ? authHeader.substring(7)
                            : null;

                    // First find current session by token
                    return sessionService.findByToken(currentToken)
                            .flatMap(currentSession -> sessionService
                                    .revokeAllSessionsExcept(username, currentSession.getId(), "Logout all by user")
                                    .map(count -> ResponseEntity.ok(
                                            new MessageResponseVM("Đã đăng xuất " + count + " thiết bị khác", true))))
                            .defaultIfEmpty(ResponseEntity
                                    .ok(new MessageResponseVM("Không có thiết bị nào khác để đăng xuất", true)));
                })
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    /**
     * GET /api/auth/sessions/count : Get count of active sessions
     *
     * @return count of active sessions
     */
    @GetMapping("/count")
    @Operation(summary = "Get session count", description = "Get the number of active sessions for the user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved count"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public Mono<ResponseEntity<Long>> getSessionCount() {
        return getCurrentUsername()
                .flatMap(username -> {
                    LOG.debug("REST request to get session count for user: {}", username);
                    return sessionService.countActiveSessionsByUserLogin(username)
                            .map(ResponseEntity::ok);
                })
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    private Mono<String> getCurrentUsername() {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getName);
    }

    private SessionResponseVM mapToResponse(SessionDTO session, String currentToken) {
        SessionResponseVM response = new SessionResponseVM();
        response.setId(session.getId());
        response.setDeviceName(session.getDeviceName());
        response.setDeviceType(session.getDeviceType() != null ? session.getDeviceType().name() : "WEB");
        response.setBrowserName(session.getBrowserName());
        response.setBrowserVersion(session.getBrowserVersion());
        response.setOsName(session.getOsName());
        response.setOsVersion(session.getOsVersion());
        response.setLocation(session.getLocation());
        response.setIpAddress(session.getIpAddress());
        response.setLoginTime(session.getLoginTime());
        response.setLastActivityTime(session.getLastActivityTime());
        response.setLastActive(formatLastActive(session.getLastActivityTime()));

        // Check if this is the current session by comparing tokens
        boolean isCurrent = currentToken != null && currentToken.equals(session.getToken());
        response.setCurrent(isCurrent);

        return response;
    }

    private String formatLastActive(Instant lastActivity) {
        if (lastActivity == null) {
            return "Không xác định";
        }

        Duration duration = Duration.between(lastActivity, Instant.now());
        long minutes = duration.toMinutes();

        if (minutes < 1) {
            return "Đang hoạt động";
        } else if (minutes < 60) {
            return minutes + " phút trước";
        } else if (minutes < 1440) { // Less than 24 hours
            long hours = duration.toHours();
            return hours + " giờ trước";
        } else {
            long days = duration.toDays();
            return days + " ngày trước";
        }
    }
}
