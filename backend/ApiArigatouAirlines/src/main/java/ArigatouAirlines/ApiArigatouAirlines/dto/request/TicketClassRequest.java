package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketClassRequest {
    String className;

    int baggageAllowanceKg;

    boolean refundable;

    boolean changeable;
}
