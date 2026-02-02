package com.stockapp.aitoolsservice.web.rest;

import com.stockapp.aitoolsservice.repository.ChatHistoryRepository;
import com.stockapp.aitoolsservice.service.ChatHistoryService;
import com.stockapp.aitoolsservice.service.dto.ChatHistoryDTO;
import com.stockapp.aitoolsservice.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.ForwardedHeaderUtils;
import reactor.core.publisher.Mono;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.reactive.ResponseUtil;

/**
 * REST controller for managing {@link com.stockapp.aitoolsservice.domain.ChatHistory}.
 */
@RestController
@RequestMapping("/api/chat-histories")
public class ChatHistoryResource {

    private static final Logger LOG = LoggerFactory.getLogger(ChatHistoryResource.class);

    private static final String ENTITY_NAME = "aitoolsserviceChatHistory";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ChatHistoryService chatHistoryService;

    private final ChatHistoryRepository chatHistoryRepository;

    public ChatHistoryResource(ChatHistoryService chatHistoryService, ChatHistoryRepository chatHistoryRepository) {
        this.chatHistoryService = chatHistoryService;
        this.chatHistoryRepository = chatHistoryRepository;
    }

    /**
     * {@code POST  /chat-histories} : Create a new chatHistory.
     *
     * @param chatHistoryDTO the chatHistoryDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new chatHistoryDTO, or with status {@code 400 (Bad Request)} if the chatHistory has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public Mono<ResponseEntity<ChatHistoryDTO>> createChatHistory(@Valid @RequestBody ChatHistoryDTO chatHistoryDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save ChatHistory : {}", chatHistoryDTO);
        if (chatHistoryDTO.getId() != null) {
            throw new BadRequestAlertException("A new chatHistory cannot already have an ID", ENTITY_NAME, "idexists");
        }
        return chatHistoryService
            .save(chatHistoryDTO)
            .map(result -> {
                try {
                    return ResponseEntity.created(new URI("/api/chat-histories/" + result.getId()))
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId()))
                        .body(result);
                } catch (URISyntaxException e) {
                    throw new RuntimeException(e);
                }
            });
    }

    /**
     * {@code PUT  /chat-histories/:id} : Updates an existing chatHistory.
     *
     * @param id the id of the chatHistoryDTO to save.
     * @param chatHistoryDTO the chatHistoryDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated chatHistoryDTO,
     * or with status {@code 400 (Bad Request)} if the chatHistoryDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the chatHistoryDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public Mono<ResponseEntity<ChatHistoryDTO>> updateChatHistory(
        @PathVariable(value = "id", required = false) final String id,
        @Valid @RequestBody ChatHistoryDTO chatHistoryDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update ChatHistory : {}, {}", id, chatHistoryDTO);
        if (chatHistoryDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, chatHistoryDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return chatHistoryRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                return chatHistoryService
                    .update(chatHistoryDTO)
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(result ->
                        ResponseEntity.ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId()))
                            .body(result)
                    );
            });
    }

    /**
     * {@code PATCH  /chat-histories/:id} : Partial updates given fields of an existing chatHistory, field will ignore if it is null
     *
     * @param id the id of the chatHistoryDTO to save.
     * @param chatHistoryDTO the chatHistoryDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated chatHistoryDTO,
     * or with status {@code 400 (Bad Request)} if the chatHistoryDTO is not valid,
     * or with status {@code 404 (Not Found)} if the chatHistoryDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the chatHistoryDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public Mono<ResponseEntity<ChatHistoryDTO>> partialUpdateChatHistory(
        @PathVariable(value = "id", required = false) final String id,
        @NotNull @RequestBody ChatHistoryDTO chatHistoryDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ChatHistory partially : {}, {}", id, chatHistoryDTO);
        if (chatHistoryDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, chatHistoryDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return chatHistoryRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                Mono<ChatHistoryDTO> result = chatHistoryService.partialUpdate(chatHistoryDTO);

                return result
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(res ->
                        ResponseEntity.ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, res.getId()))
                            .body(res)
                    );
            });
    }

    /**
     * {@code GET  /chat-histories} : get all the chatHistories.
     *
     * @param pageable the pagination information.
     * @param request a {@link ServerHttpRequest} request.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of chatHistories in body.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<List<ChatHistoryDTO>>> getAllChatHistories(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        ServerHttpRequest request
    ) {
        LOG.debug("REST request to get a page of ChatHistories");
        return chatHistoryService
            .countAll()
            .zipWith(chatHistoryService.findAll(pageable).collectList())
            .map(countWithEntities ->
                ResponseEntity.ok()
                    .headers(
                        PaginationUtil.generatePaginationHttpHeaders(
                            ForwardedHeaderUtils.adaptFromForwardedHeaders(request.getURI(), request.getHeaders()),
                            new PageImpl<>(countWithEntities.getT2(), pageable, countWithEntities.getT1())
                        )
                    )
                    .body(countWithEntities.getT2())
            );
    }

    /**
     * {@code GET  /chat-histories/:id} : get the "id" chatHistory.
     *
     * @param id the id of the chatHistoryDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the chatHistoryDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public Mono<ResponseEntity<ChatHistoryDTO>> getChatHistory(@PathVariable("id") String id) {
        LOG.debug("REST request to get ChatHistory : {}", id);
        Mono<ChatHistoryDTO> chatHistoryDTO = chatHistoryService.findOne(id);
        return ResponseUtil.wrapOrNotFound(chatHistoryDTO);
    }

    /**
     * {@code DELETE  /chat-histories/:id} : delete the "id" chatHistory.
     *
     * @param id the id of the chatHistoryDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteChatHistory(@PathVariable("id") String id) {
        LOG.debug("REST request to delete ChatHistory : {}", id);
        return chatHistoryService
            .delete(id)
            .then(
                Mono.just(
                    ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build()
                )
            );
    }
}
