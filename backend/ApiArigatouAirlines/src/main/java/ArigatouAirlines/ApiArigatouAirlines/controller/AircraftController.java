package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AircraftRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AircraftResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.AircraftService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aircraft")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AircraftController {
    AircraftService aircraftService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<AircraftResponse> creationAircraft(@RequestBody AircraftRequest aircraftRequest) {
        return ApiResponse.<AircraftResponse>builder()
                .body(aircraftService.creationAircraft(aircraftRequest))
                .build();
    }

    @GetMapping("/{aircraftId}")
    ApiResponse<AircraftResponse> getAircraftById(@PathVariable int aircraftId) {
        return ApiResponse.<AircraftResponse>builder()
                .body(aircraftService.getAircraftById(aircraftId))
                .build();
    }

    @GetMapping
    ApiResponse<List<AircraftResponse>> getAllAircraft() {
        return ApiResponse.<List<AircraftResponse>>builder()
                .body(aircraftService.getAllAircraft())
                .build();
    }

    @PutMapping("/{aircraftId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<AircraftResponse> updateAircraft(@RequestBody AircraftRequest aircraftRequest, @PathVariable int aircraftId) {
        return ApiResponse.<AircraftResponse>builder()
                .body(aircraftService.updateAircraft(aircraftRequest, aircraftId))
                .build();
    }

    @DeleteMapping("/{aircraftId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<String> deleteAircraft(@PathVariable int aircraftId) {
        return ApiResponse.<String>builder()
                .body(aircraftService.deleteAircraft(aircraftId))
                .build();
    }
}
