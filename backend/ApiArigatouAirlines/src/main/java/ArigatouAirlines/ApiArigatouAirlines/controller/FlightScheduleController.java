package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightScheduleRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightScheduleResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.FlightScheduleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flight")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class FlightScheduleController {
    FlightScheduleService flightScheduleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<FlightScheduleResponse> createFlightSchedule(@RequestBody FlightScheduleRequest request) {
        return ApiResponse.<FlightScheduleResponse>builder()
                .body(flightScheduleService.createFlightSchedule(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<FlightScheduleResponse>> getAllFlightSchedules() {
        return ApiResponse.<List<FlightScheduleResponse>>builder()
                .body(flightScheduleService.getAllFlightSchedules())
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<FlightScheduleResponse> getFlightScheduleById(@PathVariable int id) {
        return ApiResponse.<FlightScheduleResponse>builder()
                .body(flightScheduleService.getFlightScheduleById(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<FlightScheduleResponse> updateFlightSchedule(
            @PathVariable int id,
            @RequestBody FlightScheduleRequest request) {
        return ApiResponse.<FlightScheduleResponse>builder()
                .body(flightScheduleService.updateFlightSchedule(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<String> deleteFlightSchedule(@PathVariable int id) {
        return ApiResponse.<String>builder()
                .body(flightScheduleService.deleteFlightSchedule(id))
                .build();
    }
}
