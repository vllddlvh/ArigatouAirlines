package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.entity.User;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusBooking;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusPayment;
import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

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

    StatusPayment statusPayment;

    BigDecimal totalAmount;

    LocalDateTime paymentDeadline;

    Instant createdAt;
    
    List<TicketSummary> tickets;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketSummary {
        int ticketId;
        String ticketNumber;
        String passengerName;
        String flightNumber;
        String ticketClassName;
        BigDecimal basePrice;
        BigDecimal tax;
        String seatNumber;
        String status;
    }
}
