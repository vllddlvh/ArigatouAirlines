package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingServiceRequest {
    int ticketId;
    int serviceId;
    BigDecimal priceAtPurchase;
}
