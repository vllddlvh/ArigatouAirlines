package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.SeatMapRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.SeatMapResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.SeatMap;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SeatMapMapper {
    SeatMapResponse toSeatMapResponse(SeatMap seatMap);

    @Mapping(target = "aircraftType", ignore = true)
    SeatMap toSeatMap(SeatMapRequest seatMapRequest);
}
