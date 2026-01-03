package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.TicketRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.TicketResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Ticket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {BookingMapper.class, FlightMapper.class, PassengerMapper.class, FlightPriceMapper.class})
public interface TicketMapper {
    @Mapping(target = "booking", ignore = true)
    @Mapping(target = "flight", ignore = true)
    @Mapping(target = "passenger", ignore = true)
    @Mapping(target = "flightPrice", ignore = true)
    @Mapping(target = "flightSeat", ignore = true)
    Ticket toTicket(TicketRequest ticketRequest);


    @Mapping(source = "flight", target = "flight")
    @Mapping(source = "flightSeat.flightSeatId", target = "flightSeatId")
    TicketResponse toTicketResponse(Ticket ticket);
}
