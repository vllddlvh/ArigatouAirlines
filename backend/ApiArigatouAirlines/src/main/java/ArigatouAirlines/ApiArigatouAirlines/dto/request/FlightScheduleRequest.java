package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.AirportResponse;
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
public class FlightScheduleRequest {
    String flightNumber;
    Airline airline;
    String departureAirportId;
    String arrivalAirportId;
    Time departureTime;
    Time arrivalTime;
}
