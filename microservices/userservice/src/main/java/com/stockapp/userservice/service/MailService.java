package com.stockapp.userservice.service;

import com.stockapp.userservice.service.dto.AppUserDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * Service for sending emails.
 * Uses Thymeleaf templates for email content.
 */
@Service
public class MailService {

    private static final Logger LOG = LoggerFactory.getLogger(MailService.class);

    private static final String USER = "user";
    private static final String BASE_URL = "baseUrl";

    @Value("${spring.mail.from:honglongvo23@gmail.com}")
    private String from;

    @Value("${application.base-url:http://localhost:2302}")
    private String baseUrl;

    private final JavaMailSender javaMailSender;
    private final SpringTemplateEngine templateEngine;

    public MailService(JavaMailSender javaMailSender, SpringTemplateEngine templateEngine) {
        this.javaMailSender = javaMailSender;
        this.templateEngine = templateEngine;
    }

    /**
     * Send email from template - blocking method.
     */
    private void sendEmailFromTemplateBlocking(AppUserDTO user, String templateName, String subject) {
        if (user.getEmail() == null) {
            LOG.warn("Email doesn't exist for user '{}'", user.getLogin());
            return;
        }
        try {
            Locale locale = Locale.forLanguageTag("en");
            Context context = new Context(locale);
            context.setVariable(USER, user);
            context.setVariable(BASE_URL, baseUrl);
            String content = templateEngine.process(templateName, context);
            sendEmailBlocking(user.getEmail(), subject, content, false, true);
        } catch (Exception e) {
            LOG.error("Failed to process email template for user '{}'", user.getLogin(), e);
        }
    }

    /**
     * Send email - blocking method.
     */
    private void sendEmailBlocking(String to, String subject, String content, boolean isMultipart, boolean isHtml) {
        LOG.info("Sending email to '{}' with subject '{}'", to, subject);

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper message = new MimeMessageHelper(mimeMessage, isMultipart, StandardCharsets.UTF_8.name());
            message.setTo(to);
            message.setFrom(from);
            message.setSubject(subject);
            message.setText(content, isHtml);
            javaMailSender.send(mimeMessage);
            LOG.info("Email sent successfully to '{}'", to);
        } catch (MessagingException e) {
            LOG.error("Email could not be sent to user '{}'", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    /**
     * Send activation email.
     */
    public Mono<Void> sendActivationEmail(AppUserDTO user) {
        return Mono.fromRunnable(() -> {
            LOG.info("Sending activation email to '{}'", user.getEmail());
            sendEmailFromTemplateBlocking(user, "mail/activationEmail", "Kích hoạt tài khoản - SmartTrade AI");
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    /**
     * Send creation email.
     */
    public Mono<Void> sendCreationEmail(AppUserDTO user) {
        return Mono.fromRunnable(() -> {
            LOG.info("Sending creation email to '{}'", user.getEmail());
            sendEmailFromTemplateBlocking(user, "mail/creationEmail", "Tài khoản đã được tạo - SmartTrade AI");
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    /**
     * Send password reset email.
     */
    public Mono<Void> sendPasswordResetMail(AppUserDTO user) {
        return Mono.fromRunnable(() -> {
            LOG.info("Sending password reset email to '{}', token: {}", user.getEmail(), user.getPasswordResetToken());
            sendEmailFromTemplateBlocking(user, "mail/passwordResetEmail", "Đặt lại mật khẩu - SmartTrade AI");
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    /**
     * Send simple email asynchronously (legacy method).
     */
    @Async
    public void sendEmail(String to, String subject, String content, boolean isMultipart, boolean isHtml) {
        sendEmailBlocking(to, subject, content, isMultipart, isHtml);
    }
}
