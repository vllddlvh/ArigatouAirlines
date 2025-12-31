package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AirportRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AirportResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Airport;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AirportMapper {

    Airport toAirport(AirportRequest airportRequest);

    AirportResponse toAirportResponse(Airport airport);

    void updateAirport(AirportRequest airportRequest, @MappingTarget Airport airport);
}
