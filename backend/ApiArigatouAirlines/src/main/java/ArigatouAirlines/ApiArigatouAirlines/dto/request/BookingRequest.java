package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.UserResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Passenger;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusBooking;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusPayment;
import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingRequest {
//    int userId;

//    BigDecimal totalAmount;

    int flightId;

    @JsonAlias("ticketClass")
    String ticketClassName;

    List<Integer> listFlightSeatId;

    List<PassengerRequest> listPassengerRequest;

    String voucherCode;
}