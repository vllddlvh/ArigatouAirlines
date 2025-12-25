package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.PassengerRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.PassengerResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Passenger;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PassengerMapper {
    Passenger toPassenger(PassengerRequest passengerRequest);

    PassengerResponse toPassengerResponse(Passenger passenger);
}
