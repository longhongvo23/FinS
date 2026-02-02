package com.stockapp.aitoolsservice.service.mapper;

import com.stockapp.aitoolsservice.domain.DailyMarketInsight;
import com.stockapp.aitoolsservice.domain.IndustryAnalysis;
import com.stockapp.aitoolsservice.service.dto.DailyMarketInsightDTO;
import com.stockapp.aitoolsservice.service.dto.IndustryAnalysisDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link IndustryAnalysis} and its DTO {@link IndustryAnalysisDTO}.
 */
@Mapper(componentModel = "spring")
public interface IndustryAnalysisMapper extends EntityMapper<IndustryAnalysisDTO, IndustryAnalysis> {
    @Mapping(target = "dailyInsight", source = "dailyInsight", qualifiedByName = "dailyMarketInsightReportDate")
    IndustryAnalysisDTO toDto(IndustryAnalysis s);

    @Named("dailyMarketInsightReportDate")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "reportDate", source = "reportDate")
    DailyMarketInsightDTO toDtoDailyMarketInsightReportDate(DailyMarketInsight dailyMarketInsight);
}
