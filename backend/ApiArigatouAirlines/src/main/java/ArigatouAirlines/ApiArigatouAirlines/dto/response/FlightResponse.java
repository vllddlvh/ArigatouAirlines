package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.entity.Aircraft;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSchedule;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusFlight;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlightResponse {
    FlightSchedule schedule;
    int  aircraftId;
    LocalDate flightDate;
    LocalDateTime departureDateTime;
    LocalDateTime arrivalDateTime;
    StatusFlight status;
}
