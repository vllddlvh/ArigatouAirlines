package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.TicketClassRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.TicketClassResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.TicketClassService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ticketClass")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketClassController {
    TicketClassService ticketClassService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<TicketClassResponse> creationTicketClass(@RequestBody TicketClassRequest ticketClassRequest) {
        return ApiResponse.<TicketClassResponse>builder()
                .body(ticketClassService.creationTicketClass(ticketClassRequest))
                .build();
    }

    @GetMapping
    ApiResponse<List<TicketClassResponse>> getAllTicketClasses() {
        return ApiResponse.<List<TicketClassResponse>>builder()
                .body(ticketClassService.getAllTicketClasses())
                .build();
    }

    @GetMapping("/{ticketClassId}")
    ApiResponse<TicketClassResponse> getTicketClass(@PathVariable int ticketClassId) {
        return ApiResponse.<TicketClassResponse>builder()
                .body(ticketClassService.getTicketClass(ticketClassId))
                .build();
    }

    @PutMapping("/{ticketClassId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<TicketClassResponse> updateTicketClass(@PathVariable int ticketClassId, @RequestBody TicketClassRequest ticketClassRequest) {
        return ApiResponse.<TicketClassResponse>builder()
                .body(ticketClassService.updateTicketClass(ticketClassId, ticketClassRequest))
                .build();
    }

    @DeleteMapping("/{ticketClassId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<String> deleteTicketClass(@PathVariable int ticketClassId) {
        return ApiResponse.<String>builder()
                .body(ticketClassService.deleteTicketClass(ticketClassId))
                .build();
    }
}
