package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.PassengerRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.PassengerResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Passenger;
import ArigatouAirlines.ApiArigatouAirlines.service.PassengerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/passenger")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PassengerController {
    PassengerService passengerService;

    @PostMapping
    ApiResponse<PassengerResponse> creationPassenger(@RequestBody PassengerRequest passengerRequest) {
        return ApiResponse.<PassengerResponse>builder()
                .body(passengerService.creationPassenger(passengerRequest))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<List<PassengerResponse>> getAllPassenger() {
        return ApiResponse.<List<PassengerResponse>>builder()
                .body(passengerService.getAllPassenger())
                .build();
    }

    @GetMapping("/{passengerId}")
    ApiResponse<PassengerResponse> getPassenger(@PathVariable int passengerId) {
        return ApiResponse.<PassengerResponse>builder()
                .body(passengerService.getPassenger(passengerId))
                .build();
    }

    @PutMapping("/{passengerId}")
    ApiResponse<PassengerResponse> updatePassenger(@PathVariable int passengerId, @RequestBody PassengerRequest passengerRequest) {
        return ApiResponse.<PassengerResponse>builder()
                .body(passengerService.updatePassenger(passengerId, passengerRequest))
                .build();
    }

    @DeleteMapping("/{passengerId}")
    ApiResponse<String> deletePassenger(@PathVariable int passengerId) {
        return ApiResponse.<String>builder()
                .body(passengerService.deletePassenger(passengerId))
                .build();
    }
}
