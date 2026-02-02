package com.stockapp.aitoolsservice.web.rest;

import com.stockapp.aitoolsservice.repository.IndustryAnalysisRepository;
import com.stockapp.aitoolsservice.service.IndustryAnalysisService;
import com.stockapp.aitoolsservice.service.dto.IndustryAnalysisDTO;
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
 * REST controller for managing {@link com.stockapp.aitoolsservice.domain.IndustryAnalysis}.
 */
@RestController
@RequestMapping("/api/industry-analyses")
public class IndustryAnalysisResource {

    private static final Logger LOG = LoggerFactory.getLogger(IndustryAnalysisResource.class);

    private static final String ENTITY_NAME = "aitoolsserviceIndustryAnalysis";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final IndustryAnalysisService industryAnalysisService;

    private final IndustryAnalysisRepository industryAnalysisRepository;

    public IndustryAnalysisResource(
        IndustryAnalysisService industryAnalysisService,
        IndustryAnalysisRepository industryAnalysisRepository
    ) {
        this.industryAnalysisService = industryAnalysisService;
        this.industryAnalysisRepository = industryAnalysisRepository;
    }

    /**
     * {@code POST  /industry-analyses} : Create a new industryAnalysis.
     *
     * @param industryAnalysisDTO the industryAnalysisDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new industryAnalysisDTO, or with status {@code 400 (Bad Request)} if the industryAnalysis has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public Mono<ResponseEntity<IndustryAnalysisDTO>> createIndustryAnalysis(@Valid @RequestBody IndustryAnalysisDTO industryAnalysisDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save IndustryAnalysis : {}", industryAnalysisDTO);
        if (industryAnalysisDTO.getId() != null) {
            throw new BadRequestAlertException("A new industryAnalysis cannot already have an ID", ENTITY_NAME, "idexists");
        }
        return industryAnalysisService
            .save(industryAnalysisDTO)
            .map(result -> {
                try {
                    return ResponseEntity.created(new URI("/api/industry-analyses/" + result.getId()))
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId()))
                        .body(result);
                } catch (URISyntaxException e) {
                    throw new RuntimeException(e);
                }
            });
    }

    /**
     * {@code PUT  /industry-analyses/:id} : Updates an existing industryAnalysis.
     *
     * @param id the id of the industryAnalysisDTO to save.
     * @param industryAnalysisDTO the industryAnalysisDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated industryAnalysisDTO,
     * or with status {@code 400 (Bad Request)} if the industryAnalysisDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the industryAnalysisDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public Mono<ResponseEntity<IndustryAnalysisDTO>> updateIndustryAnalysis(
        @PathVariable(value = "id", required = false) final String id,
        @Valid @RequestBody IndustryAnalysisDTO industryAnalysisDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update IndustryAnalysis : {}, {}", id, industryAnalysisDTO);
        if (industryAnalysisDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, industryAnalysisDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return industryAnalysisRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                return industryAnalysisService
                    .update(industryAnalysisDTO)
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(result ->
                        ResponseEntity.ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId()))
                            .body(result)
                    );
            });
    }

    /**
     * {@code PATCH  /industry-analyses/:id} : Partial updates given fields of an existing industryAnalysis, field will ignore if it is null
     *
     * @param id the id of the industryAnalysisDTO to save.
     * @param industryAnalysisDTO the industryAnalysisDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated industryAnalysisDTO,
     * or with status {@code 400 (Bad Request)} if the industryAnalysisDTO is not valid,
     * or with status {@code 404 (Not Found)} if the industryAnalysisDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the industryAnalysisDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public Mono<ResponseEntity<IndustryAnalysisDTO>> partialUpdateIndustryAnalysis(
        @PathVariable(value = "id", required = false) final String id,
        @NotNull @RequestBody IndustryAnalysisDTO industryAnalysisDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update IndustryAnalysis partially : {}, {}", id, industryAnalysisDTO);
        if (industryAnalysisDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, industryAnalysisDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return industryAnalysisRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                Mono<IndustryAnalysisDTO> result = industryAnalysisService.partialUpdate(industryAnalysisDTO);

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
     * {@code GET  /industry-analyses} : get all the industryAnalyses.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of industryAnalyses in body.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<List<IndustryAnalysisDTO>> getAllIndustryAnalyses(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all IndustryAnalyses");
        return industryAnalysisService.findAll().collectList();
    }

    /**
     * {@code GET  /industry-analyses} : get all the industryAnalyses as a stream.
     * @return the {@link Flux} of industryAnalyses.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<IndustryAnalysisDTO> getAllIndustryAnalysesAsStream() {
        LOG.debug("REST request to get all IndustryAnalyses as a stream");
        return industryAnalysisService.findAll();
    }

    /**
     * {@code GET  /industry-analyses/:id} : get the "id" industryAnalysis.
     *
     * @param id the id of the industryAnalysisDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the industryAnalysisDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public Mono<ResponseEntity<IndustryAnalysisDTO>> getIndustryAnalysis(@PathVariable("id") String id) {
        LOG.debug("REST request to get IndustryAnalysis : {}", id);
        Mono<IndustryAnalysisDTO> industryAnalysisDTO = industryAnalysisService.findOne(id);
        return ResponseUtil.wrapOrNotFound(industryAnalysisDTO);
    }

    /**
     * {@code DELETE  /industry-analyses/:id} : delete the "id" industryAnalysis.
     *
     * @param id the id of the industryAnalysisDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteIndustryAnalysis(@PathVariable("id") String id) {
        LOG.debug("REST request to delete IndustryAnalysis : {}", id);
        return industryAnalysisService
            .delete(id)
            .then(
                Mono.just(
                    ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build()
                )
            );
    }
}
