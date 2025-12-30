package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightScheduleRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightScheduleResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSchedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {AirlineMapper.class, AirportMapper.class})
public interface FlightScheduleMapper {
    FlightScheduleResponse toFlightScheduleResponse(FlightSchedule flightSchedule);

    @Mapping(target = "scheduleId",ignore = true)
    @Mapping(target = "airline", ignore = true)
    @Mapping(target = "departureAirport", ignore = true)
    @Mapping(target = "arrivalAirport", ignore = true)
    @Mapping(target = "durationMinutes", ignore = true)
    FlightSchedule toFlightSchedule(FlightScheduleRequest flightScheduleRequest);

    @Mapping(target = "scheduleId",ignore = true)
    @Mapping(target = "airline", ignore = true)
    @Mapping(target = "departureAirport", ignore = true)
    @Mapping(target = "arrivalAirport", ignore = true)
    @Mapping(target = "durationMinutes", ignore = true)
    void updateFlightSchedule(FlightScheduleRequest flightScheduleRequest,@MappingTarget FlightSchedule flightSchedule);
}
