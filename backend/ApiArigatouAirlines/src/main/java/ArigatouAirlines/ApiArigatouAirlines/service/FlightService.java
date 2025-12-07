package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Aircraft;
import ArigatouAirlines.ApiArigatouAirlines.entity.Flight;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSchedule;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.FlightMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.AircraftRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightScheduleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class FlightService {
    FlightRepository flightRepository;
    FlightMapper flightMapper;
    FlightScheduleRepository flightScheduleRepository;
    AircraftRepository aircraftRepository;

    public FlightResponse creationFlight(FlightRequest flightRequest) {
        Flight flight = flightMapper.toFlight(flightRequest);
        if(flightScheduleRepository.existsById(flightRequest.getScheduleId())) {
            FlightSchedule schedule = flightScheduleRepository.findById(flightRequest.getScheduleId())
                    .orElseThrow();
            flight.setSchedule(schedule);
        }

        if(aircraftRepository.existsById(flightRequest.getAircraftId())) {
            Aircraft aircraft = aircraftRepository.findById(flightRequest.getAircraftId())
                    .orElseThrow();
            flight.setAircraft(aircraft);
        }

        LocalTime departureTime = flightRequest.getDepartureTime() == null
                ? flight.getSchedule().getDepartureTime() : flightRequest.getDepartureTime();

        LocalDateTime departureDateTime =  LocalDateTime.of(flightRequest.getFlightDate(), departureTime);
        flight.setDepartureDateTime(departureDateTime);
        flight.setArrivalDateTime(departureDateTime.plusMinutes(flight.getSchedule().getDurationMinutes()));

        flightRepository.save(flight);

        FlightResponse flightResponse = flightMapper.toFlightResponse(flight);
        flightResponse.setAircraftId(flight.getAircraft().getAircraftId());
        return flightResponse;
    }

    public List<FlightResponse> getListFlight() {
        return flightRepository.findAll().stream().map(flightMapper::toFlightResponse).toList();
    }

    public FlightResponse getFlight(int flightId) {
        return flightMapper.toFlightResponse(flightRepository.findById(flightId)
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED)));
    }

    public FlightResponse updateFlight(int flightId, FlightRequest flightRequest) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED));

        if(flightScheduleRepository.existsById(flightRequest.getScheduleId())) {
            FlightSchedule schedule = flightScheduleRepository.findById(flightRequest.getScheduleId())
                    .orElseThrow();
            flight.setSchedule(schedule);
        }

        if(aircraftRepository.existsById(flightRequest.getAircraftId())) {
            Aircraft aircraft = aircraftRepository.findById(flightRequest.getAircraftId())
                    .orElseThrow();
            flight.setAircraft(aircraft);
        }

        LocalTime departureTime = flightRequest.getDepartureTime() == null
                ? flight.getSchedule().getDepartureTime() : flightRequest.getDepartureTime();

        LocalDateTime departureDateTime =  LocalDateTime.of(flightRequest.getFlightDate(), departureTime);
        flight.setDepartureDateTime(departureDateTime);
        flight.setArrivalDateTime(departureDateTime.plusMinutes(flight.getSchedule().getDurationMinutes()));

        flightRepository.save(flight);

        FlightResponse flightResponse = flightMapper.toFlightResponse(flight);
        flightResponse.setAircraftId(flight.getAircraft().getAircraftId());
        return flightResponse;
    }

    public String deleteFlight(int flightId) {
        if(flightRepository.existsById(flightId)) {
            flightRepository.deleteById(flightId);
            return "Delete Finished!";
        }
        return "FLightID doesn't found!";
    }
}
