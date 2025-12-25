package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.BookingRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.BookingResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Booking;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookingMapper {
    Booking toBooking(BookingRequest bookingRequest);

    BookingResponse toBookingResponse(Booking booking);
}
