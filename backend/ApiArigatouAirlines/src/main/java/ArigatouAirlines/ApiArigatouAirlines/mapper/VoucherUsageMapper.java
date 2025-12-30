package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.VoucherUsageResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.VoucherUsage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VoucherUsageMapper {
    VoucherUsageResponse toVoucherUsageResponse(VoucherUsage voucherUsage);
}
