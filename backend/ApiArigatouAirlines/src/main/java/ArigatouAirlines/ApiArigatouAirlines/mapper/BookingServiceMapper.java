package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.BookingServiceResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.BookingServiceEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {TicketMapper.class})
public interface BookingServiceMapper {
    BookingServiceResponse toBookingServiceResponse(BookingServiceEntity bookingService);
}
