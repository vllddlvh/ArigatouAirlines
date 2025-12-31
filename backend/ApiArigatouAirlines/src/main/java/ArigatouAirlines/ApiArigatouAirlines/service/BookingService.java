package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.BookingRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.request.PaymentRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.BookingResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.*;
import ArigatouAirlines.ApiArigatouAirlines.enums.*;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.BookingMapper;
import ArigatouAirlines.ApiArigatouAirlines.mapper.PassengerMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

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
    VoucherService voucherService;
    VoucherRepository voucherRepository;
    VoucherUsageRepository voucherUsageRepository;

    private FlightPrice getDefaultFlightPrice(int flightId) {
        return flightPriceRepository
                .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, "ECONOMY")
                .orElseGet(() -> flightPriceRepository.findAllByFlight_FlightId(flightId)
                        .stream()
                        .min(Comparator.comparing(fp -> {
                            BigDecimal base = fp.getBasePrice() == null ? BigDecimal.ZERO : fp.getBasePrice();
                            BigDecimal tax = fp.getTax() == null ? BigDecimal.ZERO : fp.getTax();
                            return base.add(tax);
                        }))
                        .orElse(null));
    }

    private FlightPrice getFlightPriceForBooking(int flightId, String ticketClassName) {
        String normalized = ticketClassName == null ? "" : ticketClassName.trim();
        if (!normalized.isBlank()) {
            FlightPrice direct = flightPriceRepository
                    .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, normalized)
                    .orElse(null);
            if (direct != null) {
                return direct;
            }

            // Support legacy/alias naming: PREMIUM <-> PREMIUM_ECONOMY
            if ("PREMIUM_ECONOMY".equalsIgnoreCase(normalized)) {
                return flightPriceRepository
                        .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, "PREMIUM")
                        .orElse(null);
            }
            if ("PREMIUM".equalsIgnoreCase(normalized)) {
                return flightPriceRepository
                        .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, "PREMIUM_ECONOMY")
                        .orElse(null);
            }

            // Support legacy/alias naming: BUSINESS <-> BUSINESS_CLASS/BUSINESS_PREMIER
            if ("BUSINESS".equalsIgnoreCase(normalized)) {
                FlightPrice alt = flightPriceRepository
                        .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, "BUSINESS_CLASS")
                        .orElse(null);
                if (alt != null) {
                    return alt;
                }
                return flightPriceRepository
                        .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, "BUSINESS_PREMIER")
                        .orElse(null);
            }
            if ("BUSINESS_CLASS".equalsIgnoreCase(normalized) || "BUSINESS_PREMIER".equalsIgnoreCase(normalized)) {
                return flightPriceRepository
                        .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, "BUSINESS")
                        .orElse(null);
            }

            return null;
        }
        return getDefaultFlightPrice(flightId);
    }

    private SeatClass resolveSeatClassForBooking(FlightPrice flightPrice) {
        String className = flightPrice == null || flightPrice.getTicketClass() == null
                ? ""
                : String.valueOf(flightPrice.getTicketClass().getClassName());
        String normalized = className.trim().toUpperCase();
        if (normalized.equals("BUSINESS") || normalized.equals("BUSINESS_CLASS") || normalized.equals("BUSINESS_PREMIER")) {
            return SeatClass.BUSINESS_PREMIER;
        }
        if (normalized.equals("PREMIUM_ECONOMY") || normalized.equals("PREMIUM")) {
            return SeatClass.PREMIUM_ECONOMY;
        }
        return SeatClass.ECONOMY;
    }

    @Transactional
    public BookingResponse creationBooking(BookingRequest bookingRequest) {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        User user = userRepository.findByUsernameAndIsActiveTrue(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setStatusBooking(StatusBooking.Pending);
        booking.setStatusPayment(StatusPayment.Pending);

        List<Passenger> listPassenger = bookingRequest.getListPassengerRequest().stream()
                .map(passengerMapper :: toPassenger).toList();
        passengerRepository.saveAll(listPassenger);

        Flight flight = flightRepository.findById(bookingRequest.getFlightId())
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED));
        FlightPrice flightPrice = getFlightPriceForBooking(flight.getFlightId(), bookingRequest.getTicketClassName());
        if (flightPrice == null) {
            throw new AppException(ErrorCode.FLIGHT_PRICE_ID_IS_NOT_AVAILABLE);
        }

        SeatClass expectedSeatClass = resolveSeatClassForBooking(flightPrice);

        // Xử lý null cho basePrice và tax
        BigDecimal basePrice = flightPrice.getBasePrice() != null ? flightPrice.getBasePrice() : BigDecimal.ZERO;
        BigDecimal tax = flightPrice.getTax() != null ? flightPrice.getTax() : BigDecimal.ZERO;
        BigDecimal baseAmount = basePrice.add(tax).multiply(BigDecimal.valueOf(listPassenger.size()));

        booking.setTotalAmount(baseAmount);
        bookingRepository.save(booking);

        List<FlightSeat> chosenSeats = new ArrayList<>();
        Set<Integer> seenSeatIds = new HashSet<>();

        List<Integer> requestedSeatIds = bookingRequest.getListFlightSeatId();
        if (requestedSeatIds != null) {
            for (Integer seatId : requestedSeatIds) {
                if (seatId == null) continue;
                if (!seenSeatIds.add(seatId)) continue;

                FlightSeat seat = flightSeatRepository.findById(seatId)
                        .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_SEAT_ID_NOT_EXISTED));
                if (seat.getFlight() == null || seat.getFlight().getFlightId() != flight.getFlightId()) {
                    throw new AppException(ErrorCode.FLIGHT_SEAT_ID_NOT_EXISTED);
                }
                if (seat.getStatus() != StatusFlightSeat.Available) {
                    throw new AppException(ErrorCode.SEAT_NOT_AVAILABLE);
                }

                // Kiểm tra seatClass - cho phép đặt vé ECONOMY nếu seatClass null (legacy data)
                SeatClass actualSeatClass = (seat.getSeatMap() != null) ? seat.getSeatMap().getSeatClass() : null;
                boolean seatClassMatch = (actualSeatClass == null && expectedSeatClass == SeatClass.ECONOMY)
                        || (actualSeatClass != null && actualSeatClass == expectedSeatClass);
                if (!seatClassMatch) {
                    throw new AppException(ErrorCode.SEAT_CLASS_MISMATCH);
                }
                chosenSeats.add(seat);
                if (chosenSeats.size() >= listPassenger.size()) break;
            }
        }

        if (chosenSeats.size() < listPassenger.size()) {
            List<FlightSeat> available = flightSeatRepository.findAllByFlight_FlightIdAndStatusAndSeatClassForUpdate(
                    flight.getFlightId(),
                    StatusFlightSeat.Available,
                    expectedSeatClass
            );
            for (FlightSeat seat : available) {
                if (seat == null) continue;
                if (!seenSeatIds.add(seat.getFlightSeatId())) continue;
                chosenSeats.add(seat);
                if (chosenSeats.size() >= listPassenger.size()) break;
            }
        }

        // Fallback: Nếu đặt vé ECONOMY và vẫn thiếu ghế, tìm thêm ghế có seatClass null (legacy data)
        if (chosenSeats.size() < listPassenger.size() && expectedSeatClass == SeatClass.ECONOMY) {
            List<FlightSeat> legacySeats = flightSeatRepository.findAllByFlight_FlightIdAndStatusAndNullSeatClassForUpdate(
                    flight.getFlightId(),
                    StatusFlightSeat.Available
            );
            for (FlightSeat seat : legacySeats) {
                if (seat == null) continue;
                if (!seenSeatIds.add(seat.getFlightSeatId())) continue;
                chosenSeats.add(seat);
                if (chosenSeats.size() >= listPassenger.size()) break;
            }
        }

        if (chosenSeats.size() < listPassenger.size()) {
            throw new AppException(ErrorCode.NOT_ENOUGH_SEATS);
        }

        for (FlightSeat seat : chosenSeats) {
            seat.setStatus(StatusFlightSeat.Booked);
        }
        flightSeatRepository.saveAll(chosenSeats);

        List<Ticket> listTicket = new ArrayList<>();
        for (int i = 0; i < listPassenger.size(); i++) {
            Ticket ticket = Ticket.builder()
                    .booking(booking)
                    .flight(flight)
                    .passenger(listPassenger.get(i))
                    .flightSeat(chosenSeats.get(i))
                    .flightPrice(flightPrice)
                    .ticketNumber(UUID.randomUUID().toString()) // Explicitly set ticket number
                    .status(StatusTicket.Issued) // Explicitly set status
                    .build();
            listTicket.add(ticket);
        }

        try {
            ticketRepository.saveAll(listTicket);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.RUNTIME_EXCEPTION);
        }

        return bookingMapper.toBookingResponse(booking);
    }

    public List<BookingResponse> getMyBookings() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        User user = userRepository.findByUsernameAndIsActiveTrue(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        // Use custom query with FETCH JOIN to properly load User
        return bookingRepository.findAllByUserIdWithUser(user.getUserId())
                .stream()
                .map(bookingMapper::toBookingResponse)
                .toList();
    }

    public List<BookingResponse> getAllBooking() {
        return bookingRepository.findAll().stream().map(this::toBookingResponseWithTickets).toList();
    }
    
    private BookingResponse toBookingResponseWithTickets(Booking booking) {
        BookingResponse response = bookingMapper.toBookingResponse(booking);
        
        List<Ticket> tickets = ticketRepository.findAllByBooking_BookingId(booking.getBookingId());
        List<BookingResponse.TicketSummary> ticketSummaries = tickets.stream().map(ticket -> {
            String passengerName = ticket.getPassenger() != null ? ticket.getPassenger().getFullName() : "N/A";
            String flightNumber = ticket.getFlight() != null && ticket.getFlight().getSchedule() != null 
                    ? ticket.getFlight().getSchedule().getFlightNumber() : "N/A";
            String ticketClassName = ticket.getFlightPrice() != null && ticket.getFlightPrice().getTicketClass() != null 
                    ? ticket.getFlightPrice().getTicketClass().getClassName() : "ECONOMY";
            BigDecimal basePrice = ticket.getFlightPrice() != null ? ticket.getFlightPrice().getBasePrice() : BigDecimal.ZERO;
            BigDecimal tax = ticket.getFlightPrice() != null ? ticket.getFlightPrice().getTax() : BigDecimal.ZERO;
            String seatNumber = ticket.getFlightSeat() != null && ticket.getFlightSeat().getSeatMap() != null 
                    ? ticket.getFlightSeat().getSeatMap().getSeatNumber() : "N/A";
            String status = ticket.getStatus() != null ? ticket.getStatus().name() : "N/A";
            
            return BookingResponse.TicketSummary.builder()
                    .ticketId(ticket.getTicketId())
                    .ticketNumber(ticket.getTicketNumber())
                    .passengerName(passengerName)
                    .flightNumber(flightNumber)
                    .ticketClassName(ticketClassName)
                    .basePrice(basePrice)
                    .tax(tax)
                    .seatNumber(seatNumber)
                    .status(status)
                    .build();
        }).toList();
        
        response.setTickets(ticketSummaries);
        return response;
    }

    public BookingResponse getBooking(int id) {
        Booking booking = bookingRepository.findById(id).orElseThrow();

        return bookingMapper.toBookingResponse(booking);
    }

    @Transactional
    public BookingResponse confirmPayment(int id, PaymentRequest paymentRequest) {
        // Get current user
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        User currentUser = userRepository.findByUsernameAndIsActiveTrue(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        // Check if user owns this booking (skip for admin)
        boolean isAdmin = context.getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && booking.getUser().getUserId() != currentUser.getUserId()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        if (booking.getStatusBooking() == StatusBooking.Cancelled) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CANCELLED);
        }

        if (booking.getStatusPayment() == StatusPayment.Paid) {
            if (booking.getStatusBooking() != StatusBooking.Confirmed) {
                booking.setStatusBooking(StatusBooking.Confirmed);
                bookingRepository.save(booking);
            }
            return bookingMapper.toBookingResponse(booking);
        }

        String voucherCode = paymentRequest == null ? null : paymentRequest.getVoucherCode();
        BigDecimal discountAmount = BigDecimal.ZERO;
        Voucher voucher = null;
        if (voucherCode != null && !voucherCode.trim().isBlank()) {
            boolean alreadyUsed = voucherUsageRepository.existsByBooking_BookingId(booking.getBookingId());
            if (!alreadyUsed) {
                BigDecimal baseAmount = booking.getTotalAmount() == null ? BigDecimal.ZERO : booking.getTotalAmount();
                voucher = voucherService.validateVoucherForApply(voucherCode, baseAmount);
                discountAmount = voucherService.computeDiscountAmount(voucher, baseAmount);

                BigDecimal newTotal = baseAmount.subtract(discountAmount);
                if (newTotal.compareTo(BigDecimal.ZERO) < 0) {
                    newTotal = BigDecimal.ZERO;
                }
                booking.setTotalAmount(newTotal);

                if (voucher != null) {
                    voucher.setUsedCount(voucher.getUsedCount() + 1);
                    voucherRepository.save(voucher);

                    VoucherUsage usage = VoucherUsage.builder()
                            .voucher(voucher)
                            .booking(booking)
                            .user(currentUser)
                            .discountAmount(discountAmount)
                            .build();
                    voucherUsageRepository.save(usage);
                }
            }
        }
        
        booking.setStatusBooking(StatusBooking.Confirmed);
        booking.setStatusPayment(StatusPayment.Paid);
        bookingRepository.save(booking);
        
        return bookingMapper.toBookingResponse(booking);
    }

    public BookingResponse cancelBooking(int id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        if (booking.getStatusBooking() == StatusBooking.Cancelled) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CANCELLED);
        }
        
        // Release all seats associated with this booking
        List<Ticket> tickets = ticketRepository.findAllByBooking_BookingId(booking.getBookingId());
        for (Ticket ticket : tickets) {
            if (ticket.getFlightSeat() != null) {
                FlightSeat seat = ticket.getFlightSeat();
                seat.setStatus(StatusFlightSeat.Available);
                flightSeatRepository.save(seat);
            }
        }
        
        booking.setStatusBooking(StatusBooking.Cancelled);
        if (booking.getStatusPayment() == StatusPayment.Paid) {
            booking.setStatusPayment(StatusPayment.Refunded);
        } else {
            booking.setStatusPayment(StatusPayment.Failed);
        }
        bookingRepository.save(booking);
        
        return bookingMapper.toBookingResponse(booking);
    }
}
