package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingRequest {
//    int userId;

//    BigDecimal totalAmount;

    int flightId;

    List<Integer> listFlightSeatId;

    List<PassengerRequest> listPassengerRequest;
}