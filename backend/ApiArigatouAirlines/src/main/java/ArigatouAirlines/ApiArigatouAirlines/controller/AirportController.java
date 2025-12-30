package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AirportRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AirportResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.AirportService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/airport")
public class AirportController {
    AirportService airportService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<AirportResponse> creationAirport(@RequestBody AirportRequest airportRequest) {
        return ApiResponse.<AirportResponse>builder()
                .body(airportService.creationAirport(airportRequest))
                .build();
    }

    @GetMapping
    ApiResponse<List<AirportResponse>> getAllAirport() {
        return ApiResponse.<List<AirportResponse>>builder()
                .body(airportService.getAllAirport())
                .build();
    }

    @GetMapping("/{airportId}")
    ApiResponse<AirportResponse> getAirportById(@PathVariable String airportId) {
        return ApiResponse.<AirportResponse>builder()
                .body(airportService.getById(airportId))
                .build();
    }

    @PutMapping("/{airportId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<AirportResponse> updateAirport(@RequestBody AirportRequest airportRequest,@PathVariable String airportId) {
        return ApiResponse.<AirportResponse>builder()
                .body(airportService.updateAirport(airportRequest, airportId))
                .build();
    }

    @DeleteMapping("/{airportId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<Void> deleteAirport(@PathVariable String airportId) {
        airportService.deleteAirport(airportId);
        return new ApiResponse<>();
    }
}
