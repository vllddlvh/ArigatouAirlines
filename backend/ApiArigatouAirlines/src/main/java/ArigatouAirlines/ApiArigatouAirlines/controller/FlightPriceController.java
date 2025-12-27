package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightPriceRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightPriceResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.FlightPriceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/flightPrice")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FlightPriceController {
    FlightPriceService flightPriceService;

    @PostMapping
    ApiResponse<FlightPriceResponse> creationFlightPrice(@RequestBody FlightPriceRequest flightPriceRequest) {
        return ApiResponse.<FlightPriceResponse>builder()
                .body(flightPriceService.creationFlightPrice(flightPriceRequest))
                .build();
    }
}
