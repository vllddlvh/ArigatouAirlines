package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketClassResponse {
    String className;

    int baggageAllowanceKg;

    boolean refundable;

    boolean changeable;
}
