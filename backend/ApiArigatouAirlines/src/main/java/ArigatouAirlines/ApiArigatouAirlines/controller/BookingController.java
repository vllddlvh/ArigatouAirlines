package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.BookingRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.BookingResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.BookingService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/booking")
public class BookingController {
    BookingService bookingService;

    @PostMapping
    ApiResponse<BookingResponse> creationBooking(@RequestBody BookingRequest bookingRequest) {
        return ApiResponse.<BookingResponse>builder()
                .body(bookingService.creationBooking(bookingRequest))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<List<BookingResponse>> getAllBooking() {
        return ApiResponse.<List<BookingResponse>>builder()
                .body(bookingService.getAllBooking())
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<BookingResponse> getBooking(@PathVariable int id) {
        return ApiResponse.<BookingResponse>builder()
                .body(bookingService.getBooking(id))
                .build();
    }

    @GetMapping("/myBooking")
    ApiResponse<List<BookingResponse>> getMyBooking() {
        return ApiResponse.<List<BookingResponse>>builder()
                .body(bookingService.getMyBooking())
                .build();
    }
}
