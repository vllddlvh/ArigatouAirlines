package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.BookingRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.BookingResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BookingMapper {
    @Mapping(target = "user", ignore = true)
    Booking toBooking(BookingRequest bookingRequest);

    BookingResponse toBookingResponse(Booking booking);
}
