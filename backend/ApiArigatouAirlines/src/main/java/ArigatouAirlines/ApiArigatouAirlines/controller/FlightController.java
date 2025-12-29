package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightResponseWithoutList;
import ArigatouAirlines.ApiArigatouAirlines.service.FlightService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/flights")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FlightController {
    FlightService flightService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FlightResponse> creationFlight(@RequestBody FlightRequest flightRequest) {
        return ApiResponse.<FlightResponse>builder()
                .body(flightService.creationFlight(flightRequest))
                .build();
    }

    @GetMapping
    public ApiResponse<List<FlightResponseWithoutList>> getListFlight() {
        return ApiResponse.<List<FlightResponseWithoutList>>builder()
                .body(flightService.getListFlight())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<FlightResponse> getFlight(@PathVariable int id) {
        return ApiResponse.<FlightResponse>builder()
                .body(flightService.getFlight(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FlightResponse> updateFlight(@PathVariable int id, @RequestBody FlightRequest flightRequest) {
        return ApiResponse.<FlightResponse>builder()
                .body(flightService.updateFlight(id, flightRequest))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteFlight(@PathVariable int id) {
        return ApiResponse.<String>builder()
                .body(flightService.deleteFlight(id))
                .build();
    }
}
