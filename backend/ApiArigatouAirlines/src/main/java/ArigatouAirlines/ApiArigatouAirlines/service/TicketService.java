package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.TicketResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightPrice;
import ArigatouAirlines.ApiArigatouAirlines.entity.Ticket;
import ArigatouAirlines.ApiArigatouAirlines.mapper.TicketMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketService {
    TicketRepository ticketRepository;
    TicketMapper ticketMapper;

    public List<TicketResponse> getTicketByBookingId(int bookingId) {
        List<Ticket> listTickets = ticketRepository.findAllByBooking_BookingId(bookingId);
        return listTickets.stream().map(ticketMapper :: toTicketResponse).toList();
    }

    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(ticketMapper::toTicketResponse)
                .toList();
    }

    public TicketResponse getTicketById(int ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return ticketMapper.toTicketResponse(ticket);
    }

    public List<TicketResponse> getTicketsByFlightId(int flightId) {
        List<Ticket> listTickets = ticketRepository.findAllByFlight_FlightId(flightId);
        return listTickets.stream().map(ticketMapper::toTicketResponse).toList();
    }
}
