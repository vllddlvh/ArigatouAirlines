package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.SeatMapRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.SeatMapResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.SeatMapService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/seatMap")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class SeatMapController {
    SeatMapService seatMapService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<SeatMapResponse> creationSeatMap(@RequestBody SeatMapRequest seatMapRequest) {
        return ApiResponse.<SeatMapResponse>builder()
                .body(seatMapService.creationSeatMap(seatMapRequest))
                .build();
    }
}
