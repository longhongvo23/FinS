package com.stockapp.aitoolsservice.service;

import com.stockapp.aitoolsservice.repository.ChatHistoryRepository;
import com.stockapp.aitoolsservice.service.dto.ChatHistoryDTO;
import com.stockapp.aitoolsservice.service.mapper.ChatHistoryMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Implementation for managing {@link com.stockapp.aitoolsservice.domain.ChatHistory}.
 */
@Service
public class ChatHistoryService {

    private static final Logger LOG = LoggerFactory.getLogger(ChatHistoryService.class);

    private final ChatHistoryRepository chatHistoryRepository;

    private final ChatHistoryMapper chatHistoryMapper;

    public ChatHistoryService(ChatHistoryRepository chatHistoryRepository, ChatHistoryMapper chatHistoryMapper) {
        this.chatHistoryRepository = chatHistoryRepository;
        this.chatHistoryMapper = chatHistoryMapper;
    }

    /**
     * Save a chatHistory.
     *
     * @param chatHistoryDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<ChatHistoryDTO> save(ChatHistoryDTO chatHistoryDTO) {
        LOG.debug("Request to save ChatHistory : {}", chatHistoryDTO);
        return chatHistoryRepository.save(chatHistoryMapper.toEntity(chatHistoryDTO)).map(chatHistoryMapper::toDto);
    }

    /**
     * Update a chatHistory.
     *
     * @param chatHistoryDTO the entity to save.
     * @return the persisted entity.
     */
    public Mono<ChatHistoryDTO> update(ChatHistoryDTO chatHistoryDTO) {
        LOG.debug("Request to update ChatHistory : {}", chatHistoryDTO);
        return chatHistoryRepository.save(chatHistoryMapper.toEntity(chatHistoryDTO)).map(chatHistoryMapper::toDto);
    }

    /**
     * Partially update a chatHistory.
     *
     * @param chatHistoryDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Mono<ChatHistoryDTO> partialUpdate(ChatHistoryDTO chatHistoryDTO) {
        LOG.debug("Request to partially update ChatHistory : {}", chatHistoryDTO);

        return chatHistoryRepository
            .findById(chatHistoryDTO.getId())
            .map(existingChatHistory -> {
                chatHistoryMapper.partialUpdate(existingChatHistory, chatHistoryDTO);

                return existingChatHistory;
            })
            .flatMap(chatHistoryRepository::save)
            .map(chatHistoryMapper::toDto);
    }

    /**
     * Get all the chatHistories.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    public Flux<ChatHistoryDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ChatHistories");
        return chatHistoryRepository.findAllBy(pageable).map(chatHistoryMapper::toDto);
    }

    /**
     * Returns the number of chatHistories available.
     * @return the number of entities in the database.
     *
     */
    public Mono<Long> countAll() {
        return chatHistoryRepository.count();
    }

    /**
     * Get one chatHistory by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    public Mono<ChatHistoryDTO> findOne(String id) {
        LOG.debug("Request to get ChatHistory : {}", id);
        return chatHistoryRepository.findById(id).map(chatHistoryMapper::toDto);
    }

    /**
     * Delete the chatHistory by id.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    public Mono<Void> delete(String id) {
        LOG.debug("Request to delete ChatHistory : {}", id);
        return chatHistoryRepository.deleteById(id);
    }
}
