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
@RequestMapping("/flightSchedules")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FlightScheduleController {
    FlightScheduleService flightScheduleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FlightScheduleResponse> creationFlightSchedule(@RequestBody FlightScheduleRequest flightScheduleRequest) {
        return ApiResponse.<FlightScheduleResponse>builder()
                .body(flightScheduleService.creationFlightSchedule(flightScheduleRequest))
                .build();
    }

    @GetMapping
    public ApiResponse<List<FlightScheduleResponse>> getListFlightSchedule() {
        return ApiResponse.<List<FlightScheduleResponse>>builder()
                .body(flightScheduleService.getListFlightSchedule())
                .build();
    }

    @GetMapping("/{flightScheduleId}")
    public ApiResponse<FlightScheduleResponse> getFlightSchedule(@PathVariable int flightScheduleId) {
        return ApiResponse.<FlightScheduleResponse>builder()
                .body(flightScheduleService.getFlightSchedule(flightScheduleId))
                .build();
    }

    @PutMapping("/{flightScheduleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FlightScheduleResponse>
    updateFlightSchedule(@RequestBody FlightScheduleRequest flightScheduleRequest, @PathVariable int flightScheduleId) {
        return ApiResponse.<FlightScheduleResponse>builder()
                .body(flightScheduleService.updateFlightSchedule(flightScheduleRequest, flightScheduleId))
                .build();
    }

    @DeleteMapping("/{flightScheduleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public  ApiResponse<String> deleteFlightSchedule(@PathVariable int flightScheduleId) {
        return ApiResponse.<String>builder()
                .body(flightScheduleService.deleteFlightSchedule(flightScheduleId))
                .build();
    }

}
