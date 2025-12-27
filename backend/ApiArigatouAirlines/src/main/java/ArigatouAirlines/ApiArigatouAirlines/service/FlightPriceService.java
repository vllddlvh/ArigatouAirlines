package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightPriceRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightPriceResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Flight;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightPrice;
import ArigatouAirlines.ApiArigatouAirlines.entity.TicketClass;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.FlightPriceMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightPriceRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.TicketClassRepository;
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
    FlightRepository flightRepository;
    TicketClassRepository ticketClassRepository;

    public FlightPriceResponse creationFlightPrice(FlightPriceRequest flightPriceRequest) {
        Flight fLight = flightRepository.findById(flightPriceRequest.getFlightId())
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED));
        TicketClass ticketClass = ticketClassRepository.findById(flightPriceRequest.getTicketClassId())
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_CLASS_ID_IS_NOT_AVAILABLE));

        FlightPrice flightPrice = flightPriceMapper.toFlightPrice(flightPriceRequest);
        flightPrice.setAvailableSeats(flightPriceRequest.getTotalSeats());
        flightPrice.setFlight(fLight);
        flightPrice.setTicketClass(ticketClass);
        flightPriceRepository.save(flightPrice);

        return flightPriceMapper.toFlightPriceResponse(flightPrice);
    }

    public FlightPriceResponse getFlightPrice(int flightPriceId) {
        FlightPrice flightPrice = flightPriceRepository.findById(flightPriceId)
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_PRICE_ID_IS_NOT_AVAILABLE));

        return flightPriceMapper.toFlightPriceResponse(flightPrice);
    }

    public FlightPriceResponse updateFlightPrice(int flightPriceId, FlightPriceRequest flightPriceRequest) {
        FlightPrice flightPrice = flightPriceRepository.findById(flightPriceId)
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_PRICE_ID_IS_NOT_AVAILABLE));

        if(flightRepository.existsById(flightPriceRequest.getFlightId())) {
            Flight fLight = flightRepository.findById(flightPriceRequest.getFlightId())
                    .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED));
            flightPrice.setFlight(fLight);
        }
        if(flightRepository.existsById(flightPriceRequest.getTicketClassId())) {
            TicketClass ticketClass = ticketClassRepository.findById(flightPriceRequest.getTicketClassId())
                    .orElseThrow(() -> new AppException(ErrorCode.TICKET_CLASS_ID_IS_NOT_AVAILABLE));
            flightPrice.setTicketClass(ticketClass);
        }

        flightPriceMapper.toUpdateFlightPrice(flightPriceRequest, flightPrice);
        flightPriceRepository.save(flightPrice);
        return flightPriceMapper.toFlightPriceResponse(flightPrice);
    }
}
