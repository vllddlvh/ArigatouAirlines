package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSeat;
import ArigatouAirlines.ApiArigatouAirlines.enums.SeatClass;
import ArigatouAirlines.ApiArigatouAirlines.enums.SeatType;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusFlightSeat;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlightSeatResponse {
    int flightSeatId;
    StatusFlightSeat status;
    String seatNumber;
    SeatClass seatClass;
    SeatType seatType;
    int visualRow;
    int visualCol;
}
