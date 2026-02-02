package com.stockapp.aitoolsservice.service;

import com.stockapp.aitoolsservice.repository.DailyMarketInsightRepository;
import com.stockapp.aitoolsservice.service.dto.DailyMarketInsightDTO;
import com.stockapp.aitoolsservice.service.mapper.DailyMarketInsightMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Implementation for managing {@link com.stockapp.aitoolsservice.domain.DailyMarketInsight}.
 */
@Service
public class DailyMarketInsightService {

    private static final Logger LOG = LoggerFactory.getLogger(DailyMarketInsightService.class);

    private final DailyMarketInsightRepository dailyMarketInsightRepository;

    private final DailyMarketInsightMapper dailyMarketInsightMapper;

    public DailyMarketInsightService(
        DailyMarketInsightRepository dailyMarketInsightRepository,
        DailyMarketInsightMapper dailyMarketInsightMapper
    ) {
        this.dailyMarketInsightRepository = dailyMarketInsightRepository;
        this.dailyMarketInsightMapper = dailyMarketInsightMapper;
    }

    /**
     * Save a dailyMarketInsight.
     *
     * @param dailyMarketInsightDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<DailyMarketInsightDTO> save(DailyMarketInsightDTO dailyMarketInsightDTO) {
        LOG.debug("Request to save DailyMarketInsight : {}", dailyMarketInsightDTO);
        return dailyMarketInsightRepository
            .save(dailyMarketInsightMapper.toEntity(dailyMarketInsightDTO))
            .map(dailyMarketInsightMapper::toDto);
    }

    /**
     * Update a dailyMarketInsight.
     *
     * @param dailyMarketInsightDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<DailyMarketInsightDTO> update(DailyMarketInsightDTO dailyMarketInsightDTO) {
        LOG.debug("Request to update DailyMarketInsight : {}", dailyMarketInsightDTO);
        return dailyMarketInsightRepository
            .save(dailyMarketInsightMapper.toEntity(dailyMarketInsightDTO))
            .map(dailyMarketInsightMapper::toDto);
    }

    /**
     * Partially update a dailyMarketInsight.
     *
     * @param dailyMarketInsightDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Mono<DailyMarketInsightDTO> partialUpdate(DailyMarketInsightDTO dailyMarketInsightDTO) {
        LOG.debug("Request to partially update DailyMarketInsight : {}", dailyMarketInsightDTO);

        return dailyMarketInsightRepository
            .findById(dailyMarketInsightDTO.getId())
            .map(existingDailyMarketInsight -> {
                dailyMarketInsightMapper.partialUpdate(existingDailyMarketInsight, dailyMarketInsightDTO);

                return existingDailyMarketInsight;
            })
            .flatMap(dailyMarketInsightRepository::save)
            .map(dailyMarketInsightMapper::toDto);
    }

    /**
     * Get all the dailyMarketInsights.
     *
     * @return the list of entities.
     */
    public Flux<DailyMarketInsightDTO> findAll() {
        LOG.debug("Request to get all DailyMarketInsights");
        return dailyMarketInsightRepository.findAll().map(dailyMarketInsightMapper::toDto);
    }

    /**
     * Returns the number of dailyMarketInsights available.
     * @return the number of entities in the database.
     *
     */
    public Mono<Long> countAll() {
        return dailyMarketInsightRepository.count();
    }

    /**
     * Get one dailyMarketInsight by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    public Mono<DailyMarketInsightDTO> findOne(String id) {
        LOG.debug("Request to get DailyMarketInsight : {}", id);
        return dailyMarketInsightRepository.findById(id).map(dailyMarketInsightMapper::toDto);
    }

    /**
     * Delete the dailyMarketInsight by id.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    public Mono<Void> delete(String id) {
        LOG.debug("Request to delete DailyMarketInsight : {}", id);
        return dailyMarketInsightRepository.deleteById(id);
    }
}
