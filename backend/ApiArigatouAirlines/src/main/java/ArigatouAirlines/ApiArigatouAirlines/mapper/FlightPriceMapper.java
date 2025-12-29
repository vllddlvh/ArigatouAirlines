package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightPriceRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightPriceResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightPrice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FlightPriceMapper {
    @Mapping(target = "flight", ignore = true)
    @Mapping(target = "ticketClass", ignore = true)
    FlightPrice toFlightPrice(FlightPriceRequest flightPriceRequest);

    FlightPriceResponse toFlightPriceResponse(FlightPrice flightPrice);

    @Mapping(target = "flight", ignore = true)
    @Mapping(target = "ticketClass", ignore = true)
    FlightPrice toUpdateFlightPrice(FlightPriceRequest flightPriceRequest, @MappingTarget FlightPrice flightPrice);
}
