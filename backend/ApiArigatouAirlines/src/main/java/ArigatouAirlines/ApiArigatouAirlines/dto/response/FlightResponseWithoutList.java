package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.entity.Aircraft;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSeat;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusFlight;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlightResponseWithoutList {
    int flightId;
    FlightScheduleResponse schedule;
    AircraftResponse  aircraft;
    LocalDate flightDate;
    LocalDateTime departureDateTime;
    LocalDateTime arrivalDateTime;
    StatusFlight status;

    BigDecimal basePrice;
    BigDecimal tax;
    
    int totalSeats;
    int bookedSeats;
    
    // Flattened fields for easier frontend consumption
    String flightNumber;
    String departureAirportCode;
    String arrivalAirportCode;
    String airline;
}
