package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightSeatResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSeat;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FlightSeatMapper {
    @Mapping(source = "seatMap.seatNumber", target = "seatNumber")
    @Mapping(source = "seatMap.seatClass", target = "seatClass")
    @Mapping(source = "seatMap.seatType", target = "seatType")
    @Mapping(source = "seatMap.visualRow", target = "visualRow")
    @Mapping(source = "seatMap.visualCol", target = "visualCol")
    FlightSeatResponse toFlightSeatResponse(FlightSeat flightSeat);
}
