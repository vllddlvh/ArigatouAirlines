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
    @Mapping(target = "basePrice", ignore = true)
    @Mapping(target = "tax", ignore = true)
    @Mapping(source = "schedule.flightNumber", target = "flightNumber")
    @Mapping(source = "schedule.departureAirport.airportCode", target = "departureAirportCode")
    @Mapping(source = "schedule.arrivalAirport.airportCode", target = "arrivalAirportCode")
    @Mapping(source = "schedule.airline.airlineName", target = "airline")
    FlightResponse toFlightResponse(Flight flight);

    @Mapping(target = "schedule", ignore = true)
    @Mapping(target = "aircraft", ignore = true)
    @Mapping(source = "departureTime", target = "departureDateTime", ignore = true)
    Flight toFlight(FlightRequest flightRequest);

    @Mapping(target = "basePrice", ignore = true)
    @Mapping(target = "tax", ignore = true)
    @Mapping(source = "schedule.flightNumber", target = "flightNumber")
    @Mapping(source = "schedule.departureAirport.airportCode", target = "departureAirportCode")
    @Mapping(source = "schedule.arrivalAirport.airportCode", target = "arrivalAirportCode")
    @Mapping(source = "schedule.airline.airlineName", target = "airline")
    FlightResponseWithoutList toFlightResponseWithoutList(Flight flight);
}
