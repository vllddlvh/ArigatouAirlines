package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.entity.*;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusTicket;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketResponse {

    BookingResponse booking;

    FlightResponse flight;

    PassengerResponse passenger;

    FlightPriceResponse flightPrice;

    FlightSeat flightSeat;

    String ticketNumber;

    StatusTicket status;
}
