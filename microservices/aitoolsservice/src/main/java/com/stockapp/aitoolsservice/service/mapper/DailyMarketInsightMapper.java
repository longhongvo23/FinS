package com.stockapp.aitoolsservice.service.mapper;

import com.stockapp.aitoolsservice.domain.DailyMarketInsight;
import com.stockapp.aitoolsservice.service.dto.DailyMarketInsightDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link DailyMarketInsight} and its DTO {@link DailyMarketInsightDTO}.
 */
@Mapper(componentModel = "spring")
public interface DailyMarketInsightMapper extends EntityMapper<DailyMarketInsightDTO, DailyMarketInsight> {}
