package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.BookingRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.BookingResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Booking;
import ArigatouAirlines.ApiArigatouAirlines.mapper.BookingMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.BookingRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class BookingService {
    BookingRepository bookingRepository;
    BookingMapper bookingMapper;

    public BookingResponse creationBooking(BookingRequest bookingRequest) {
        Booking booking = bookingMapper.toBooking(bookingRequest);
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
