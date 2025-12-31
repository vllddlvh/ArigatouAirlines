package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.TicketResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.TicketService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/tickets")
public class TicketController {
    TicketService ticketService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<List<TicketResponse>> getAllTickets() {
        return ApiResponse.<List<TicketResponse>>builder()
                .body(ticketService.getAllTickets())
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<TicketResponse> getTicketById(@PathVariable int id) {
        return ApiResponse.<TicketResponse>builder()
                .body(ticketService.getTicketById(id))
                .build();
    }

    @GetMapping("/booking/{bookingId}")
    ApiResponse<List<TicketResponse>> getTicketsByBookingId(@PathVariable int bookingId) {
        return ApiResponse.<List<TicketResponse>>builder()
                .body(ticketService.getTicketByBookingId(bookingId))
                .build();
    }

    @GetMapping("/flight/{flightId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<List<TicketResponse>> getTicketsByFlightId(@PathVariable int flightId) {
        return ApiResponse.<List<TicketResponse>>builder()
                .body(ticketService.getTicketsByFlightId(flightId))
                .build();
    }
}
