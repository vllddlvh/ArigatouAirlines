package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightSeatResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.FlightSeatService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/flightSeat")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FlightSeatController {
    FlightSeatService flightSeatService;

    @GetMapping("/{flightSeatId}")
    ApiResponse<FlightSeatResponse> getFlightSeat(@PathVariable int flightSeatId) {
        return ApiResponse.<FlightSeatResponse>builder()
                .body(flightSeatService.getFlightSeat(flightSeatId))
                .build();
    }
}
