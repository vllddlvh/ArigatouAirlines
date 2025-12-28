package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightPriceRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightPriceResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.FlightPriceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{flightId}")
    ApiResponse<FlightPriceResponse> getFlightPrice(@PathVariable int flightId) {
        return ApiResponse.<FlightPriceResponse>builder()
                .body(flightPriceService.getFlightPrice(flightId))
                .build();
    }

    @PutMapping("/{flightPriceId}")
    ApiResponse<FlightPriceResponse> updateFlightPrice(@PathVariable int flightPriceId, @RequestBody FlightPriceRequest flightPriceRequest) {
        return ApiResponse.<FlightPriceResponse>builder()
                .body(flightPriceService.updateFlightPrice(flightPriceId, flightPriceRequest))
                .build();
    }
}
