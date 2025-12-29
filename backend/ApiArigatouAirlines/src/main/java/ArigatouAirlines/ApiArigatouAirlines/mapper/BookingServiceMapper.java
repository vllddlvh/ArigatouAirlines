package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.BookingServiceResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.BookingService;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {TicketMapper.class})
public interface BookingServiceMapper {
    BookingServiceResponse toBookingServiceResponse(BookingService bookingService);
}
