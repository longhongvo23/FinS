package com.stockapp.aitoolsservice.web.rest;

import com.stockapp.aitoolsservice.repository.DailyMarketInsightRepository;
import com.stockapp.aitoolsservice.service.DailyMarketInsightService;
import com.stockapp.aitoolsservice.service.dto.DailyMarketInsightDTO;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.reactive.ResponseUtil;

/**
 * REST controller for managing {@link com.stockapp.aitoolsservice.domain.DailyMarketInsight}.
 */
@RestController
@RequestMapping("/api/daily-market-insights")
public class DailyMarketInsightResource {

    private static final Logger LOG = LoggerFactory.getLogger(DailyMarketInsightResource.class);

    private static final String ENTITY_NAME = "aitoolsserviceDailyMarketInsight";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DailyMarketInsightService dailyMarketInsightService;

    private final DailyMarketInsightRepository dailyMarketInsightRepository;

    public DailyMarketInsightResource(
        DailyMarketInsightService dailyMarketInsightService,
        DailyMarketInsightRepository dailyMarketInsightRepository
    ) {
        this.dailyMarketInsightService = dailyMarketInsightService;
        this.dailyMarketInsightRepository = dailyMarketInsightRepository;
    }

    /**
     * {@code POST  /daily-market-insights} : Create a new dailyMarketInsight.
     *
     * @param dailyMarketInsightDTO the dailyMarketInsightDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new dailyMarketInsightDTO, or with status {@code 400 (Bad Request)} if the dailyMarketInsight has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public Mono<ResponseEntity<DailyMarketInsightDTO>> createDailyMarketInsight(
        @Valid @RequestBody DailyMarketInsightDTO dailyMarketInsightDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to save DailyMarketInsight : {}", dailyMarketInsightDTO);
        if (dailyMarketInsightDTO.getId() != null) {
            throw new BadRequestAlertException("A new dailyMarketInsight cannot already have an ID", ENTITY_NAME, "idexists");
        }
        return dailyMarketInsightService
            .save(dailyMarketInsightDTO)
            .map(result -> {
                try {
                    return ResponseEntity.created(new URI("/api/daily-market-insights/" + result.getId()))
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId()))
                        .body(result);
                } catch (URISyntaxException e) {
                    throw new RuntimeException(e);
                }
            });
    }

    /**
     * {@code PUT  /daily-market-insights/:id} : Updates an existing dailyMarketInsight.
     *
     * @param id the id of the dailyMarketInsightDTO to save.
     * @param dailyMarketInsightDTO the dailyMarketInsightDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated dailyMarketInsightDTO,
     * or with status {@code 400 (Bad Request)} if the dailyMarketInsightDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the dailyMarketInsightDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public Mono<ResponseEntity<DailyMarketInsightDTO>> updateDailyMarketInsight(
        @PathVariable(value = "id", required = false) final String id,
        @Valid @RequestBody DailyMarketInsightDTO dailyMarketInsightDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update DailyMarketInsight : {}, {}", id, dailyMarketInsightDTO);
        if (dailyMarketInsightDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, dailyMarketInsightDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return dailyMarketInsightRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                return dailyMarketInsightService
                    .update(dailyMarketInsightDTO)
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(result ->
                        ResponseEntity.ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId()))
                            .body(result)
                    );
            });
    }

    /**
     * {@code PATCH  /daily-market-insights/:id} : Partial updates given fields of an existing dailyMarketInsight, field will ignore if it is null
     *
     * @param id the id of the dailyMarketInsightDTO to save.
     * @param dailyMarketInsightDTO the dailyMarketInsightDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated dailyMarketInsightDTO,
     * or with status {@code 400 (Bad Request)} if the dailyMarketInsightDTO is not valid,
     * or with status {@code 404 (Not Found)} if the dailyMarketInsightDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the dailyMarketInsightDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public Mono<ResponseEntity<DailyMarketInsightDTO>> partialUpdateDailyMarketInsight(
        @PathVariable(value = "id", required = false) final String id,
        @NotNull @RequestBody DailyMarketInsightDTO dailyMarketInsightDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update DailyMarketInsight partially : {}, {}", id, dailyMarketInsightDTO);
        if (dailyMarketInsightDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, dailyMarketInsightDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return dailyMarketInsightRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                Mono<DailyMarketInsightDTO> result = dailyMarketInsightService.partialUpdate(dailyMarketInsightDTO);

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
     * {@code GET  /daily-market-insights} : get all the dailyMarketInsights.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of dailyMarketInsights in body.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<List<DailyMarketInsightDTO>> getAllDailyMarketInsights() {
        LOG.debug("REST request to get all DailyMarketInsights");
        return dailyMarketInsightService.findAll().collectList();
    }

    /**
     * {@code GET  /daily-market-insights} : get all the dailyMarketInsights as a stream.
     * @return the {@link Flux} of dailyMarketInsights.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<DailyMarketInsightDTO> getAllDailyMarketInsightsAsStream() {
        LOG.debug("REST request to get all DailyMarketInsights as a stream");
        return dailyMarketInsightService.findAll();
    }

    /**
     * {@code GET  /daily-market-insights/:id} : get the "id" dailyMarketInsight.
     *
     * @param id the id of the dailyMarketInsightDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the dailyMarketInsightDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public Mono<ResponseEntity<DailyMarketInsightDTO>> getDailyMarketInsight(@PathVariable("id") String id) {
        LOG.debug("REST request to get DailyMarketInsight : {}", id);
        Mono<DailyMarketInsightDTO> dailyMarketInsightDTO = dailyMarketInsightService.findOne(id);
        return ResponseUtil.wrapOrNotFound(dailyMarketInsightDTO);
    }

    /**
     * {@code DELETE  /daily-market-insights/:id} : delete the "id" dailyMarketInsight.
     *
     * @param id the id of the dailyMarketInsightDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteDailyMarketInsight(@PathVariable("id") String id) {
        LOG.debug("REST request to delete DailyMarketInsight : {}", id);
        return dailyMarketInsightService
            .delete(id)
            .then(
                Mono.just(
                    ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build()
                )
            );
    }
}
