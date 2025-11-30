package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlightScheduleResponse {
    int scheduleId;
    String flightNumber;
    String aircraftType;
    String departureCity;
    String arrivalCity;
    String departureAirportCode;
    String arrivalAirportCode;
    LocalDateTime departureTime;
    LocalDateTime arrivalTime;
    Long basePrice;
    int durationMinutes;
    String status;
    boolean isActive;
}
