package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightSeatResponse;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.FlightSeatMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightSeatRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class FlightSeatService {
    FlightSeatMapper flightSeatMapper;
    FlightSeatRepository flightSeatRepository;

    public FlightSeatResponse getFlightSeat(int flightSeatId) {
        return flightSeatMapper.toFlightSeatResponse(flightSeatRepository.findById(flightSeatId)
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_SEAT_ID_NOT_EXISTED)));
    }
}
