package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AircraftTypeRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AircraftTypeResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AircraftTypeResponseWithoutList;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.AircraftTypeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aircraftType")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AircraftTypeController {
    AircraftTypeService aircraftTypeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<AircraftTypeResponse> creationAircraftType(@RequestBody AircraftTypeRequest aircraftTypeRequest) {
        return ApiResponse.<AircraftTypeResponse>builder()
                .body(aircraftTypeService.creationAircraftType(aircraftTypeRequest))
                .build();
    }

    @GetMapping
    ApiResponse<List<AircraftTypeResponseWithoutList>> getAllAircraftTypes() {
        return ApiResponse.<List<AircraftTypeResponseWithoutList>>builder()
                .body(aircraftTypeService.getAllAircraftTypes())
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<AircraftTypeResponse> getAircraftTypeById(@PathVariable int id) {
        return ApiResponse.<AircraftTypeResponse>builder()
                .body(aircraftTypeService.getAircraftTypeById(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<AircraftTypeResponse> updateAircraftType(@RequestBody AircraftTypeRequest aircraftTypeRequest,@PathVariable int id) {
        return ApiResponse.<AircraftTypeResponse>builder()
                .body(aircraftTypeService.updateAircraftType(aircraftTypeRequest, id))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<String> deleteAircraftType(@PathVariable int id) {
        return ApiResponse.<String>builder()
                .body(aircraftTypeService.deleteAircraftType(id))
                .build();
    }
}
