package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusBooking;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusPaymentBooking;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {
    int bookingId;

    UserResponse user;

    String bookingCode;

    StatusBooking statusBooking;

    StatusPaymentBooking statusPayment;

    BigDecimal totalAmount;

    LocalDateTime paymentDeadline;

    LocalDateTime createdAt;
}
