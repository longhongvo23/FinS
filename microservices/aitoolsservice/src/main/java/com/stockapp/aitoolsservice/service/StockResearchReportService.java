package com.stockapp.aitoolsservice.service;

import com.stockapp.aitoolsservice.repository.StockResearchReportRepository;
import com.stockapp.aitoolsservice.service.dto.StockResearchReportDTO;
import com.stockapp.aitoolsservice.service.mapper.StockResearchReportMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Implementation for managing {@link com.stockapp.aitoolsservice.domain.StockResearchReport}.
 */
@Service
public class StockResearchReportService {

    private static final Logger LOG = LoggerFactory.getLogger(StockResearchReportService.class);

    private final StockResearchReportRepository stockResearchReportRepository;

    private final StockResearchReportMapper stockResearchReportMapper;

    public StockResearchReportService(
        StockResearchReportRepository stockResearchReportRepository,
        StockResearchReportMapper stockResearchReportMapper
    ) {
        this.stockResearchReportRepository = stockResearchReportRepository;
        this.stockResearchReportMapper = stockResearchReportMapper;
    }

    /**
     * Save a stockResearchReport.
     *
     * @param stockResearchReportDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<StockResearchReportDTO> save(StockResearchReportDTO stockResearchReportDTO) {
        LOG.debug("Request to save StockResearchReport : {}", stockResearchReportDTO);
        return stockResearchReportRepository
            .save(stockResearchReportMapper.toEntity(stockResearchReportDTO))
            .map(stockResearchReportMapper::toDto);
    }

    /**
     * Update a stockResearchReport.
     *
     * @param stockResearchReportDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<StockResearchReportDTO> update(StockResearchReportDTO stockResearchReportDTO) {
        LOG.debug("Request to update StockResearchReport : {}", stockResearchReportDTO);
        return stockResearchReportRepository
            .save(stockResearchReportMapper.toEntity(stockResearchReportDTO))
            .map(stockResearchReportMapper::toDto);
    }

    /**
     * Partially update a stockResearchReport.
     *
     * @param stockResearchReportDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Mono<StockResearchReportDTO> partialUpdate(StockResearchReportDTO stockResearchReportDTO) {
        LOG.debug("Request to partially update StockResearchReport : {}", stockResearchReportDTO);

        return stockResearchReportRepository
            .findById(stockResearchReportDTO.getId())
            .map(existingStockResearchReport -> {
                stockResearchReportMapper.partialUpdate(existingStockResearchReport, stockResearchReportDTO);

                return existingStockResearchReport;
            })
            .flatMap(stockResearchReportRepository::save)
            .map(stockResearchReportMapper::toDto);
    }

    /**
     * Get all the stockResearchReports.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    public Flux<StockResearchReportDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all StockResearchReports");
        return stockResearchReportRepository.findAllBy(pageable).map(stockResearchReportMapper::toDto);
    }

    /**
     * Returns the number of stockResearchReports available.
     * @return the number of entities in the database.
     *
     */
    public Mono<Long> countAll() {
        return stockResearchReportRepository.count();
    }

    /**
     * Get one stockResearchReport by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    public Mono<StockResearchReportDTO> findOne(String id) {
        LOG.debug("Request to get StockResearchReport : {}", id);
        return stockResearchReportRepository.findById(id).map(stockResearchReportMapper::toDto);
    }

    /**
     * Delete the stockResearchReport by id.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    public Mono<Void> delete(String id) {
        LOG.debug("Request to delete StockResearchReport : {}", id);
        return stockResearchReportRepository.deleteById(id);
    }
}
