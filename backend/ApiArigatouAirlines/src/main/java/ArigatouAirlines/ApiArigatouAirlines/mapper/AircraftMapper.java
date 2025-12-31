package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AircraftRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AircraftResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Aircraft;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {AircraftTypeMapper.class, AirlineMapper.class})
public interface AircraftMapper {
    AircraftResponse toAircraftResponse(Aircraft aircraft);

    @Mapping(target = "aircraftType", ignore = true)
    @Mapping(target = "airline", ignore = true)
    Aircraft toAircraft(AircraftRequest aircraftRequest);

    @Mapping(target = "aircraftType", ignore = true)
    @Mapping(target = "airline", ignore = true)
    void updateAircraft(AircraftRequest aircraftRequest, @MappingTarget Aircraft aircraft);
}
