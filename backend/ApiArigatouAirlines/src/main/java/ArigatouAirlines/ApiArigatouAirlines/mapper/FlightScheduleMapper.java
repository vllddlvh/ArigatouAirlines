package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightScheduleResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSchedule;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FlightScheduleMapper {
    FlightScheduleResponse toFlightScheduleResponse(FlightSchedule flightSchedule);
}
