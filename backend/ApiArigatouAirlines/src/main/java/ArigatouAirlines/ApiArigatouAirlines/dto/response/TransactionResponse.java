package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusPayment;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransactionResponse {
    int paymentId;
    int bookingId;
    BigDecimal amount;
    String paymentMethod;
    String transactionId;
    StatusPayment paymentStatus;
    LocalDateTime paymentDate;
}