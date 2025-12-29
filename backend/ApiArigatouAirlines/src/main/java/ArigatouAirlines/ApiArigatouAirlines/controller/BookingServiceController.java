package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.BookingServiceResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.BookingServiceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booking-service")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingServiceController {
    BookingServiceService bookingServiceService;

    @GetMapping
    ApiResponse<List<BookingServiceResponse>> getAllBookingServices() {
        return ApiResponse.<List<BookingServiceResponse>>builder()
                .body(bookingServiceService.getAllBookingServices())
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<BookingServiceResponse> getBookingService(@PathVariable int id) {
        return ApiResponse.<BookingServiceResponse>builder()
                .body(bookingServiceService.getBookingService(id))
                .build();
    }
}
