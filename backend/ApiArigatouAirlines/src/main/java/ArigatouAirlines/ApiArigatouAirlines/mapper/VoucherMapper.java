package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.VoucherRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.VoucherResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Voucher;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VoucherMapper {
    Voucher toVoucher(VoucherRequest voucherRequest);

    VoucherResponse toVoucherResponse(Voucher voucher);
}
