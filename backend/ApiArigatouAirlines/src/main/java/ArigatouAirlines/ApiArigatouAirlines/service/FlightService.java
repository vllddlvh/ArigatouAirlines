package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightResponseWithoutList;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightSeatResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.*;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusFlightSeat;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.FlightMapper;
import ArigatouAirlines.ApiArigatouAirlines.mapper.FlightSeatMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.AircraftRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightScheduleRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightSeatRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class FlightService {
    FlightRepository flightRepository;
    FlightMapper flightMapper;
    FlightScheduleRepository flightScheduleRepository;
    AircraftRepository aircraftRepository;
    FlightSeatRepository flightSeatRepository;
    FlightSeatMapper flightSeatMapper;

    public FlightResponse creationFlight(FlightRequest flightRequest) {
        Flight flight = flightMapper.toFlight(flightRequest);
        List<FlightSeatResponse> flightSeatReponseList = new ArrayList<>();
        if(flightScheduleRepository.existsById(flightRequest.getScheduleId())) {
            FlightSchedule schedule = flightScheduleRepository.findById(flightRequest.getScheduleId())
                    .orElseThrow();
            flight.setSchedule(schedule);
        }

        LocalTime departureTime = flightRequest.getDepartureTime() == null
                ? flight.getSchedule().getDepartureTime() : flightRequest.getDepartureTime();

        LocalDateTime departureDateTime =  LocalDateTime.of(flightRequest.getFlightDate(), departureTime);
        flight.setDepartureDateTime(departureDateTime);
        flight.setArrivalDateTime(departureDateTime.plusMinutes(flight.getSchedule().getDurationMinutes()));

        flightRepository.save(flight);

        if(aircraftRepository.existsById(flightRequest.getAircraftId())) {
            Aircraft aircraft = aircraftRepository.findById(flightRequest.getAircraftId())
                    .orElseThrow();
            flight.setAircraft(aircraft);
            AircraftType aircraftType = aircraft.getAircraftType();
            List<SeatMap> seatMapList = aircraftType.getListSeatMap();
            List<FlightSeat> flightSeatList = new ArrayList<>();
            for(int i = 0; i < seatMapList.size(); i++) {
                FlightSeat flightSeat = FlightSeat.builder()
                        .flight(flight)
                        .seatMap(seatMapList.get(i))
                        .build();
                flightSeatRepository.save(flightSeat);
                flightSeatList.add(flightSeat);
            }
            flightSeatReponseList = flightSeatList.stream().map(flightSeatMapper::toFlightSeatResponse).toList();
        }
        FlightResponse flightResponse = flightMapper.toFlightResponse(flight);
        flightResponse.setFlightSeatList(flightSeatReponseList);
        return flightResponse;
    }

    public List<FlightResponseWithoutList> getListFlight() {
        return flightRepository.findAll().stream().map(flightMapper::toFlightResponseWithoutList).toList();
    }

    public FlightResponse getFlight(int flightId) {
        FlightResponse flightResponse = flightMapper.toFlightResponse(flightRepository.findById(flightId)
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED)));
        List<FlightSeatResponse> flightSeatResponseList = flightSeatRepository.findAllByFlight_FlightId(flightId)
                .stream().map(flightSeatMapper::toFlightSeatResponse).toList();
        flightResponse.setFlightSeatList(flightSeatResponseList);
        return flightResponse;
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

        return flightMapper.toFlightResponse(flight);
    }

    public String deleteFlight(int flightId) {
        if(flightRepository.existsById(flightId)) {
            flightRepository.deleteById(flightId);
            return "Delete Finished!";
        }
        return "FLightID doesn't found!";
    }
}
