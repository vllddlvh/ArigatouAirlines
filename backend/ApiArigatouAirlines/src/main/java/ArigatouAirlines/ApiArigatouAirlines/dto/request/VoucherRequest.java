package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import ArigatouAirlines.ApiArigatouAirlines.enums.DiscountType;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static lombok.AccessLevel.PRIVATE;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = PRIVATE)
public class VoucherRequest {
    String voucherCode;

    DiscountType discountType;

    BigDecimal discountValue;

    BigDecimal maxDiscountAmount;

    BigDecimal minOrderAmount;

    int usageLimit;

    LocalDateTime validFrom;

    LocalDateTime validTo;

    Boolean isActive;
}
