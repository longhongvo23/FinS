package com.stockapp.aitoolsservice.web.rest;

import com.stockapp.aitoolsservice.repository.StockResearchReportRepository;
import com.stockapp.aitoolsservice.service.StockResearchReportService;
import com.stockapp.aitoolsservice.service.dto.StockResearchReportDTO;
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
 * REST controller for managing {@link com.stockapp.aitoolsservice.domain.StockResearchReport}.
 */
@RestController
@RequestMapping("/api/stock-research-reports")
public class StockResearchReportResource {

    private static final Logger LOG = LoggerFactory.getLogger(StockResearchReportResource.class);

    private static final String ENTITY_NAME = "aitoolsserviceStockResearchReport";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final StockResearchReportService stockResearchReportService;

    private final StockResearchReportRepository stockResearchReportRepository;

    public StockResearchReportResource(
        StockResearchReportService stockResearchReportService,
        StockResearchReportRepository stockResearchReportRepository
    ) {
        this.stockResearchReportService = stockResearchReportService;
        this.stockResearchReportRepository = stockResearchReportRepository;
    }

    /**
     * {@code POST  /stock-research-reports} : Create a new stockResearchReport.
     *
     * @param stockResearchReportDTO the stockResearchReportDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new stockResearchReportDTO, or with status {@code 400 (Bad Request)} if the stockResearchReport has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public Mono<ResponseEntity<StockResearchReportDTO>> createStockResearchReport(
        @Valid @RequestBody StockResearchReportDTO stockResearchReportDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to save StockResearchReport : {}", stockResearchReportDTO);
        if (stockResearchReportDTO.getId() != null) {
            throw new BadRequestAlertException("A new stockResearchReport cannot already have an ID", ENTITY_NAME, "idexists");
        }
        return stockResearchReportService
            .save(stockResearchReportDTO)
            .map(result -> {
                try {
                    return ResponseEntity.created(new URI("/api/stock-research-reports/" + result.getId()))
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId()))
                        .body(result);
                } catch (URISyntaxException e) {
                    throw new RuntimeException(e);
                }
            });
    }

    /**
     * {@code PUT  /stock-research-reports/:id} : Updates an existing stockResearchReport.
     *
     * @param id the id of the stockResearchReportDTO to save.
     * @param stockResearchReportDTO the stockResearchReportDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated stockResearchReportDTO,
     * or with status {@code 400 (Bad Request)} if the stockResearchReportDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the stockResearchReportDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public Mono<ResponseEntity<StockResearchReportDTO>> updateStockResearchReport(
        @PathVariable(value = "id", required = false) final String id,
        @Valid @RequestBody StockResearchReportDTO stockResearchReportDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update StockResearchReport : {}, {}", id, stockResearchReportDTO);
        if (stockResearchReportDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, stockResearchReportDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return stockResearchReportRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                return stockResearchReportService
                    .update(stockResearchReportDTO)
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(result ->
                        ResponseEntity.ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId()))
                            .body(result)
                    );
            });
    }

    /**
     * {@code PATCH  /stock-research-reports/:id} : Partial updates given fields of an existing stockResearchReport, field will ignore if it is null
     *
     * @param id the id of the stockResearchReportDTO to save.
     * @param stockResearchReportDTO the stockResearchReportDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated stockResearchReportDTO,
     * or with status {@code 400 (Bad Request)} if the stockResearchReportDTO is not valid,
     * or with status {@code 404 (Not Found)} if the stockResearchReportDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the stockResearchReportDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public Mono<ResponseEntity<StockResearchReportDTO>> partialUpdateStockResearchReport(
        @PathVariable(value = "id", required = false) final String id,
        @NotNull @RequestBody StockResearchReportDTO stockResearchReportDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update StockResearchReport partially : {}, {}", id, stockResearchReportDTO);
        if (stockResearchReportDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, stockResearchReportDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return stockResearchReportRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                Mono<StockResearchReportDTO> result = stockResearchReportService.partialUpdate(stockResearchReportDTO);

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
     * {@code GET  /stock-research-reports} : get all the stockResearchReports.
     *
     * @param pageable the pagination information.
     * @param request a {@link ServerHttpRequest} request.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of stockResearchReports in body.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<List<StockResearchReportDTO>>> getAllStockResearchReports(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        ServerHttpRequest request
    ) {
        LOG.debug("REST request to get a page of StockResearchReports");
        return stockResearchReportService
            .countAll()
            .zipWith(stockResearchReportService.findAll(pageable).collectList())
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
     * {@code GET  /stock-research-reports/:id} : get the "id" stockResearchReport.
     *
     * @param id the id of the stockResearchReportDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the stockResearchReportDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public Mono<ResponseEntity<StockResearchReportDTO>> getStockResearchReport(@PathVariable("id") String id) {
        LOG.debug("REST request to get StockResearchReport : {}", id);
        Mono<StockResearchReportDTO> stockResearchReportDTO = stockResearchReportService.findOne(id);
        return ResponseUtil.wrapOrNotFound(stockResearchReportDTO);
    }

    /**
     * {@code DELETE  /stock-research-reports/:id} : delete the "id" stockResearchReport.
     *
     * @param id the id of the stockResearchReportDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteStockResearchReport(@PathVariable("id") String id) {
        LOG.debug("REST request to delete StockResearchReport : {}", id);
        return stockResearchReportService
            .delete(id)
            .then(
                Mono.just(
                    ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build()
                )
            );
    }
}
