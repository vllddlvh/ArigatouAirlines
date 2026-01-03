package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.TransactionResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Payment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    TransactionResponse toTransactionResponse(Payment payment);
}