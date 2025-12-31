package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlightPriceResponse {
    int priceId;
    int flightId;
    TicketClassResponse ticketClass;
    BigDecimal basePrice;
    BigDecimal tax;
    int totalSeats;
    int availableSeats;
}
