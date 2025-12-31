package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightPriceRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightPriceResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.FlightPriceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/flightPrice")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FlightPriceController {
    FlightPriceService flightPriceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<FlightPriceResponse> creationFlightPrice(@RequestBody FlightPriceRequest flightPriceRequest) {
        return ApiResponse.<FlightPriceResponse>builder()
                .body(flightPriceService.creationFlightPrice(flightPriceRequest))
                .build();
    }

    @GetMapping("/{flightId}")
    ApiResponse<FlightPriceResponse> getFlightPrice(
            @PathVariable int flightId,
            @RequestParam(required = false) String ticketClassName
    ) {
        return ApiResponse.<FlightPriceResponse>builder()
                .body(flightPriceService.getFlightPrice(flightId, ticketClassName))
                .build();
    }

    @PutMapping("/{flightPriceId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<FlightPriceResponse> updateFlightPrice(@PathVariable int flightPriceId, @RequestBody FlightPriceRequest flightPriceRequest) {
        return ApiResponse.<FlightPriceResponse>builder()
                .body(flightPriceService.updateFlightPrice(flightPriceId, flightPriceRequest))
                .build();
    }

    @GetMapping("/byFlight/{flightId}")
    ApiResponse<List<FlightPriceResponse>> getFlightPricesByFlight(@PathVariable int flightId) {
        return ApiResponse.<List<FlightPriceResponse>>builder()
                .body(flightPriceService.getFlightPricesByFlight(flightId))
                .build();
    }

    @PostMapping("/backfill/{flightId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<List<FlightPriceResponse>> backfillFlightPrices(@PathVariable int flightId) {
        return ApiResponse.<List<FlightPriceResponse>>builder()
                .body(flightPriceService.backfillFlightPrices(flightId))
                .build();
    }

    @PostMapping("/backfillAll")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<String> backfillAllFlightPrices() {
        flightPriceService.backfillAllFlights();
        return ApiResponse.<String>builder()
                .body("Đã backfill giá vé cho tất cả chuyến bay!")
                .build();
    }
}