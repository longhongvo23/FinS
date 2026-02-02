package com.stockapp.aitoolsservice.service.mapper;

import com.stockapp.aitoolsservice.domain.StockResearchReport;
import com.stockapp.aitoolsservice.service.dto.StockResearchReportDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link StockResearchReport} and its DTO {@link StockResearchReportDTO}.
 */
@Mapper(componentModel = "spring")
public interface StockResearchReportMapper extends EntityMapper<StockResearchReportDTO, StockResearchReport> {}
