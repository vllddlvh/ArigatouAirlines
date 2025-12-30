package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

import static lombok.AccessLevel.PRIVATE;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = PRIVATE)
public class VoucherValidateResponse {
    String voucherCode;
    BigDecimal orderAmount;
    BigDecimal discountAmount;
    BigDecimal finalAmount;
}
