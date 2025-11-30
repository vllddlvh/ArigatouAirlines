package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlightScheduleRequest {
    String flightNumber;
    String aircraftType;
    String departureCity;
    String arrivalCity;
    String departureAirport;  // Mã IATA sân bay đi
    String arrivalAirport;    // Mã IATA sân bay đến
    LocalDateTime departureTime;
    LocalDateTime arrivalTime;
    Long basePrice;
    String status;
}
