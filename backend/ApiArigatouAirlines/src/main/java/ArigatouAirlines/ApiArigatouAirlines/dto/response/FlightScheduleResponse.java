package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.entity.Airline;
import ArigatouAirlines.ApiArigatouAirlines.entity.Airport;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Time;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlightScheduleResponse {
    int scheduleId;
    String flightNumber;
    AirlineResponse airline;
    AirportResponse departureAirport;
    AirportResponse arrivalAirport;
    LocalTime departureTime;
    LocalTime arrivalTime;
    int durationMinutes;
    boolean active;
}
