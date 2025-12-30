package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.entity.AncillaryService;
import ArigatouAirlines.ApiArigatouAirlines.entity.Ticket;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingServiceResponse {
    TicketResponse ticket;
    AncillaryServiceResponse ancillaryService;
    BigDecimal priceAtPurchase;
}
