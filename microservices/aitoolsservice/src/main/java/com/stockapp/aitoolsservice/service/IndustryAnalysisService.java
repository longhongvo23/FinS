package com.stockapp.aitoolsservice.service;

import com.stockapp.aitoolsservice.repository.IndustryAnalysisRepository;
import com.stockapp.aitoolsservice.service.dto.IndustryAnalysisDTO;
import com.stockapp.aitoolsservice.service.mapper.IndustryAnalysisMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Implementation for managing {@link com.stockapp.aitoolsservice.domain.IndustryAnalysis}.
 */
@Service
public class IndustryAnalysisService {

    private static final Logger LOG = LoggerFactory.getLogger(IndustryAnalysisService.class);

    private final IndustryAnalysisRepository industryAnalysisRepository;

    private final IndustryAnalysisMapper industryAnalysisMapper;

    public IndustryAnalysisService(IndustryAnalysisRepository industryAnalysisRepository, IndustryAnalysisMapper industryAnalysisMapper) {
        this.industryAnalysisRepository = industryAnalysisRepository;
        this.industryAnalysisMapper = industryAnalysisMapper;
    }

    /**
     * Save a industryAnalysis.
     *
     * @param industryAnalysisDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<IndustryAnalysisDTO> save(IndustryAnalysisDTO industryAnalysisDTO) {
        LOG.debug("Request to save IndustryAnalysis : {}", industryAnalysisDTO);
        return industryAnalysisRepository.save(industryAnalysisMapper.toEntity(industryAnalysisDTO)).map(industryAnalysisMapper::toDto);
    }

    /**
     * Update a industryAnalysis.
     *
     * @param industryAnalysisDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<IndustryAnalysisDTO> update(IndustryAnalysisDTO industryAnalysisDTO) {
        LOG.debug("Request to update IndustryAnalysis : {}", industryAnalysisDTO);
        return industryAnalysisRepository.save(industryAnalysisMapper.toEntity(industryAnalysisDTO)).map(industryAnalysisMapper::toDto);
    }

    /**
     * Partially update a industryAnalysis.
     *
     * @param industryAnalysisDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Mono<IndustryAnalysisDTO> partialUpdate(IndustryAnalysisDTO industryAnalysisDTO) {
        LOG.debug("Request to partially update IndustryAnalysis : {}", industryAnalysisDTO);

        return industryAnalysisRepository
            .findById(industryAnalysisDTO.getId())
            .map(existingIndustryAnalysis -> {
                industryAnalysisMapper.partialUpdate(existingIndustryAnalysis, industryAnalysisDTO);

                return existingIndustryAnalysis;
            })
            .flatMap(industryAnalysisRepository::save)
            .map(industryAnalysisMapper::toDto);
    }

    /**
     * Get all the industryAnalyses.
     *
     * @return the list of entities.
     */
    public Flux<IndustryAnalysisDTO> findAll() {
        LOG.debug("Request to get all IndustryAnalyses");
        return industryAnalysisRepository.findAll().map(industryAnalysisMapper::toDto);
    }

    /**
     * Get all the industryAnalyses with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Flux<IndustryAnalysisDTO> findAllWithEagerRelationships(Pageable pageable) {
        return industryAnalysisRepository.findAllWithEagerRelationships(pageable).map(industryAnalysisMapper::toDto);
    }

    /**
     * Returns the number of industryAnalyses available.
     * @return the number of entities in the database.
     *
     */
    public Mono<Long> countAll() {
        return industryAnalysisRepository.count();
    }

    /**
     * Get one industryAnalysis by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    public Mono<IndustryAnalysisDTO> findOne(String id) {
        LOG.debug("Request to get IndustryAnalysis : {}", id);
        return industryAnalysisRepository.findOneWithEagerRelationships(id).map(industryAnalysisMapper::toDto);
    }

    /**
     * Delete the industryAnalysis by id.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    public Mono<Void> delete(String id) {
        LOG.debug("Request to delete IndustryAnalysis : {}", id);
        return industryAnalysisRepository.deleteById(id);
    }
}
