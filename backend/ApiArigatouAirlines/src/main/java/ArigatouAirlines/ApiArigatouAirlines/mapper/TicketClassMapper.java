package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.TicketClassRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.TicketClassResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.TicketClass;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TicketClassMapper {
    TicketClass toTicketClass(TicketClassRequest ticketClassRequest);

    TicketClassResponse toTicketClassResponse(TicketClass ticketClass);
}
