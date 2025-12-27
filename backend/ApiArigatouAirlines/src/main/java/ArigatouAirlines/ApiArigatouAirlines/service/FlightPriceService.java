package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightPriceRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightPriceResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightPrice;
import ArigatouAirlines.ApiArigatouAirlines.mapper.FlightPriceMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightPriceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class FlightPriceService {
    FlightPriceRepository flightPriceRepository;

    FlightPriceMapper flightPriceMapper;

    public FlightPriceResponse creationFlightPrice(FlightPriceRequest flightPriceRequest) {
        FlightPrice flightPrice = flightPriceMapper.toFlightPrice(flightPriceRequest);
        flightPriceRepository.save(flightPrice);

        return flightPriceMapper.toFlightPriceResponse(flightPrice);
    }
}
