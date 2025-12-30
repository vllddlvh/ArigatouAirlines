package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AircraftTypeRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AircraftTypeResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AircraftTypeResponseWithoutList;
import ArigatouAirlines.ApiArigatouAirlines.entity.AircraftType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AircraftTypeMapper {
    AircraftTypeResponse toAircraftTypeResponse(AircraftType aircraftType);

    AircraftTypeResponseWithoutList toAircraftTypeResponseWithoutList(AircraftType aircraftType);

    AircraftType toAircraftType(AircraftTypeRequest aircraftTypeRequest);

    void updateAircraftType(AircraftTypeRequest aircraftTypeRequest, @MappingTarget AircraftType aircraftType);
}
