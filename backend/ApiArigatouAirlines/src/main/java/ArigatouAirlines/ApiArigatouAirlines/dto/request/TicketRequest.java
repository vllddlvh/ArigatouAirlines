package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.BookingResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightPriceResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.PassengerResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSeat;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusTicket;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketRequest {

    int bookingId;

    int flightId;

    int passengerId;

    int flightPriceId;

    int flightSeatId;

    String ticketNumber;

    StatusTicket status;
}
