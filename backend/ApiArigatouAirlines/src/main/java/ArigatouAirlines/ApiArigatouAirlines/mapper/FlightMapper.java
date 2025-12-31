package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightResponseWithoutList;
import ArigatouAirlines.ApiArigatouAirlines.entity.Flight;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {FlightScheduleMapper.class, AircraftMapper.class})
public interface FlightMapper {

    @Mapping(target = "flightSeatList", ignore = true)
    FlightResponse toFlightResponse(Flight flight);

    @Mapping(target = "schedule", ignore = true)
    @Mapping(target = "aircraft", ignore = true)
    @Mapping(source = "departureTime", target = "departureDateTime", ignore = true)
    Flight toFlight(FlightRequest flightRequest);

    FlightResponseWithoutList toFlightResponseWithoutList(Flight flight);
}
