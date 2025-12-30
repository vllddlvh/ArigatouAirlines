package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.BookingRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.BookingResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface BookingMapper {
    @Mapping(target = "user", ignore = true)
    Booking toBooking(BookingRequest bookingRequest);

    @Mapping(target = "tickets", ignore = true)
    BookingResponse toBookingResponse(Booking booking);
}
