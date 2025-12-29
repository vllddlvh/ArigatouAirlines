package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.BookingServiceResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.BookingService;
import ArigatouAirlines.ApiArigatouAirlines.mapper.BookingServiceMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.BookingServiceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingServiceService {
    BookingServiceRepository bookingServiceRepository;
    BookingServiceMapper bookingServiceMapper;

    public List<BookingServiceResponse> getAllBookingServices() {
        return bookingServiceRepository.findAll().stream()
                .map(bookingServiceMapper::toBookingServiceResponse)
                .toList();
    }

    public BookingServiceResponse getBookingService(int id) {
        BookingService bookingService = bookingServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking service not found"));
        return bookingServiceMapper.toBookingServiceResponse(bookingService);
    }
}
