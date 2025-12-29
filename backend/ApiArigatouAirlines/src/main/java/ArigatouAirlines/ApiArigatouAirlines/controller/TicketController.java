package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.TicketResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.TicketService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ticket")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketController {
    TicketService ticketService;

    @GetMapping("/{bookingId}")
    ApiResponse<List<TicketResponse>> getAllTicketByBookingId(@PathVariable int bookingId) {
        return ApiResponse.<List<TicketResponse>>builder()
                .body(ticketService.getTicketByBookingId(bookingId))
                .build();
    }
}
