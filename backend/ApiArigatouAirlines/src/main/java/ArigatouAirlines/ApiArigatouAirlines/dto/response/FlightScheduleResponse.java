package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.entity.Airline;
import ArigatouAirlines.ApiArigatouAirlines.entity.Airport;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Time;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlightScheduleResponse {
    String flightNumber;
    Airline airline;
    AirportResponse departureAirport;
    Airport arrivalAirport;
    Time departureTime;
    Time arrivalTime;
    int durationMinutes;
    boolean isActive;
}
