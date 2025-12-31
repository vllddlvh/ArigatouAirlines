package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.BookingRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.request.PaymentRequest;
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

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    ApiResponse<List<BookingResponse>> getMyBookings() {
        return ApiResponse.<List<BookingResponse>>builder()
                .body(bookingService.getMyBookings())
                .build();
    }

    @GetMapping("/{id:\\d+}")
    ApiResponse<BookingResponse> getBooking(@PathVariable int id) {
        return ApiResponse.<BookingResponse>builder()
                .body(bookingService.getBooking(id))
                .build();
    }

    @PutMapping("/{id}/confirm-payment")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    ApiResponse<BookingResponse> confirmPayment(@PathVariable int id, @RequestBody(required = false) PaymentRequest paymentRequest) {
        return ApiResponse.<BookingResponse>builder()
                .body(bookingService.confirmPayment(id, paymentRequest))
                .build();
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<BookingResponse> cancelBooking(@PathVariable int id) {
        return ApiResponse.<BookingResponse>builder()
                .body(bookingService.cancelBooking(id))
                .build();
    }
}
