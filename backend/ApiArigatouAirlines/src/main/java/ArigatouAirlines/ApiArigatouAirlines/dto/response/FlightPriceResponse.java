package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.entity.Flight;
import ArigatouAirlines.ApiArigatouAirlines.entity.TicketClass;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlightPriceResponse {
    Flight flight;
    TicketClass ticketClass;
    BigDecimal basePrice;
    BigDecimal tax;
    int totalSeats;
    int availableSeats;
}
