package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AirlineRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AirlineResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Airline;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AirlineMapper {
    Airline toAirline(AirlineRequest airlineRequest);

    AirlineResponse toAirlineResponse(Airline airline);

    void updateAirline(AirlineRequest airlineRequest, @MappingTarget Airline airline);
}
