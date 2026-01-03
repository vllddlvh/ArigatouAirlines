package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.BookingServiceRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.BookingServiceResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.AncillaryService;
import ArigatouAirlines.ApiArigatouAirlines.entity.BookingServiceEntity;
import ArigatouAirlines.ApiArigatouAirlines.entity.Ticket;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.BookingServiceMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.AncillaryServiceRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.BookingServiceRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.TicketRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingServiceService {
    BookingServiceRepository bookingServiceRepository;
    TicketRepository ticketRepository;
    AncillaryServiceRepository ancillaryServiceRepository;
    BookingServiceMapper bookingServiceMapper;

    public List<BookingServiceResponse> getAllBookingServices() {
        return bookingServiceRepository.findAll().stream()
                .map(bookingServiceMapper::toBookingServiceResponse)
                .toList();
    }

    public BookingServiceResponse getBookingService(int id) {
        BookingServiceEntity bookingService = bookingServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking service not found"));
        return bookingServiceMapper.toBookingServiceResponse(bookingService);
    }

    @Transactional
    public BookingServiceResponse createBookingService(BookingServiceRequest request) {
        // 1. Tìm Ticket
        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_CLASS_ID_IS_NOT_AVAILABLE));

        AncillaryService service = ancillaryServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        BookingServiceEntity entity = new BookingServiceEntity();

        entity.setTicket(ticket);
        entity.setAncillaryService(service);

        if (request.getPriceAtPurchase() != null) {
            entity.setPriceAtPurchase(request.getPriceAtPurchase());
        } else {
            entity.setPriceAtPurchase(service.getPrice());
        }

        BookingServiceEntity savedEntity = bookingServiceRepository.save(entity);

        return bookingServiceMapper.toBookingServiceResponse(savedEntity);
    }
}
