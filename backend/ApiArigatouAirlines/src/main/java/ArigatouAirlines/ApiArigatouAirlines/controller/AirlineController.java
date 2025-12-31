package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AirlineRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.request.AirportRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AirlineResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.AirlineService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/airline")
public class AirlineController {
    AirlineService airlineService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<AirlineResponse> creationAirline(@RequestBody AirlineRequest airlineRequest) {
        return ApiResponse.<AirlineResponse>builder()
                .body(airlineService.creationAirline(airlineRequest))
                .build();
    }

    @GetMapping
    ApiResponse<List<AirlineResponse>> getAllAirlines() {
        return ApiResponse.<List<AirlineResponse>>builder()
                .body(airlineService.getAllAirline())
                .build();
    }

    @GetMapping("/{airlineId}")
    ApiResponse<AirlineResponse> getAirline(@PathVariable int airlineId) {
        return ApiResponse.<AirlineResponse>builder()
                .body(airlineService.getById(airlineId))
                .build();
    }

    @PutMapping("{airlineId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<AirlineResponse> updateAirline(@RequestBody AirlineRequest airlineRequest, @PathVariable int airlineId) {
        return ApiResponse.<AirlineResponse>builder()
                .body(airlineService.updateAirline(airlineRequest, airlineId))
                .build();
    }

    @DeleteMapping("{airlineId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<Void> deleteAirline(@PathVariable int airlineId) {
        airlineService.deleteAirline(airlineId);
        return new ApiResponse<>();
    }
}
