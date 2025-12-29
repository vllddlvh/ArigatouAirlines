package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.BookingRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.BookingResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.*;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.BookingMapper;
import ArigatouAirlines.ApiArigatouAirlines.mapper.PassengerMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class BookingService {
    BookingRepository bookingRepository;
    BookingMapper bookingMapper;
    UserRepository userRepository;
    TicketRepository ticketRepository;
    PassengerMapper passengerMapper;
    PassengerRepository passengerRepository;
    FlightRepository flightRepository;
    FlightSeatRepository flightSeatRepository;
    FlightPriceRepository flightPriceRepository;

    public BookingResponse creationBooking(BookingRequest bookingRequest) {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        Booking booking = new Booking();
        booking.setUser(user);

        List<Passenger> listPassenger = bookingRequest.getListPassengerRequest().stream()
                .map(passengerMapper :: toPassenger).toList();
        passengerRepository.saveAll(listPassenger);

        Flight flight = flightRepository.findById(bookingRequest.getFlightId())
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED));
        FlightPrice flightPrice = flightPriceRepository.findFlightPriceByFlight_FlightId(flight.getFlightId());

        List<Ticket> listTicket = new ArrayList<>();

        for(int i = 0; i < listPassenger.size(); i++) {
            Ticket ticket = Ticket.builder()
                    .booking(booking)
                    .flight(flight)
                    .passenger(listPassenger.get(i))
                    .flightSeat(flightSeatRepository.findById(bookingRequest.getListFlightSeatId().get(i))
                            .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_SEAT_ID_NOT_EXISTED)))
                    .flightPrice(flightPrice)
                    .build();
            listTicket.add(ticket);
        }
        ticketRepository.saveAll(listTicket);
        BigDecimal totalAmount =
                flightPrice.getBasePrice()
                        .add(flightPrice.getTax())
                        .multiply(BigDecimal.valueOf(listPassenger.size()));

        booking.setTotalAmount(totalAmount);
        bookingRepository.save(booking);
        return bookingMapper.toBookingResponse(booking);
    }

    public List<BookingResponse> getAllBooking() {
        return bookingRepository.findAll().stream().map(bookingMapper::toBookingResponse).toList();
    }

    public BookingResponse getBooking(int id) {
        Booking booking = bookingRepository.findById(id).orElseThrow();

        return bookingMapper.toBookingResponse(booking);
    }
}
