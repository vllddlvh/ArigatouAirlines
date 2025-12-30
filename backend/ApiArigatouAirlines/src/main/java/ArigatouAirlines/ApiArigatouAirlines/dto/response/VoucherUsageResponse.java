package ArigatouAirlines.ApiArigatouAirlines.dto.response;

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
public class VoucherUsageResponse {
    int usageId;
    VoucherResponse voucher;
    BookingResponse booking;
    UserResponse user;
    BigDecimal discountAmount;;
    LocalDateTime usedAt;


}
