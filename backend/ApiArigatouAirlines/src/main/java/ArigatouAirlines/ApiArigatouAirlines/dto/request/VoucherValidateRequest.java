package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

import static lombok.AccessLevel.PRIVATE;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = PRIVATE)
public class VoucherValidateRequest {
    String voucherCode;
    BigDecimal orderAmount;
}
