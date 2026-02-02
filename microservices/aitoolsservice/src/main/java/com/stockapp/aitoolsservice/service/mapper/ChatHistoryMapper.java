package com.stockapp.aitoolsservice.service.mapper;

import com.stockapp.aitoolsservice.domain.ChatHistory;
import com.stockapp.aitoolsservice.service.dto.ChatHistoryDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ChatHistory} and its DTO {@link ChatHistoryDTO}.
 */
@Mapper(componentModel = "spring")
public interface ChatHistoryMapper extends EntityMapper<ChatHistoryDTO, ChatHistory> {}
