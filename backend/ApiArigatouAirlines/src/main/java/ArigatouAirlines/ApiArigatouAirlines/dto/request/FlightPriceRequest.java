package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import ArigatouAirlines.ApiArigatouAirlines.entity.Flight;
import ArigatouAirlines.ApiArigatouAirlines.entity.TicketClass;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlightPriceRequest {
    int flightId;
    int ticketClassId;
    BigDecimal basePrice;
    BigDecimal tax;
    int totalSeats;
    int availableSeats;
}
