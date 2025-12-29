package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightScheduleRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightScheduleResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Airline;
import ArigatouAirlines.ApiArigatouAirlines.entity.Airport;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSchedule;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.FlightScheduleMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.AirlineRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.AirportRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightScheduleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class FlightScheduleService {
    FlightScheduleRepository flightScheduleRepository;
    FlightScheduleMapper flightScheduleMapper;
    AirportRepository airportRepository;
    AirlineRepository airlineRepository;

    public FlightScheduleResponse creationFlightSchedule(FlightScheduleRequest flightScheduleRequest) {
        if (flightScheduleRequest.getArrivalAirportId()
                .compareTo(flightScheduleRequest.getDepartureAirportId()) == 0) {
            throw new AppException(ErrorCode.DEPARTURE_AND_ARRIVAL_TIME_CANNOT_CONFLICT);
        }

        Airport departureAirport = airportRepository.findByAirportCode(flightScheduleRequest.getDepartureAirportId())
                .orElseThrow(() -> new AppException(ErrorCode.AIRPORTID_NOT_EXISTD));

        Airport arrivalAirport = airportRepository.findByAirportCode(flightScheduleRequest.getArrivalAirportId())
                .orElseThrow(() -> new AppException(ErrorCode.AIRPORTID_NOT_EXISTD));

        Airline airline = airlineRepository.findById(flightScheduleRequest.getAirlineId())
                .orElseThrow(() -> new AppException(ErrorCode.AIRLINEID_NOT_EXISTED));

        long durationMinutes = Math.abs(ChronoUnit.MINUTES.between
                (flightScheduleRequest.getDepartureTime(), flightScheduleRequest.getArrivalTime()));

        FlightSchedule flightSchedule = flightScheduleMapper.toFlightSchedule(flightScheduleRequest);
        flightSchedule.setAirline(airline);
        flightSchedule.setArrivalAirport(arrivalAirport);
        flightSchedule.setDepartureAirport(departureAirport);
        flightSchedule.setDurationMinutes((int)durationMinutes);

        flightScheduleRepository.save(flightSchedule);

        return flightScheduleMapper.toFlightScheduleResponse(flightSchedule);
    }

    public List<FlightScheduleResponse> getListFlightSchedule() {
        return flightScheduleRepository.findAll().stream()
                .map(flightScheduleMapper::toFlightScheduleResponse).toList();
    }

    public FlightScheduleResponse getFlightSchedule(int flightScheduleId) {
        FlightSchedule flightSchedule = flightScheduleRepository.findById(flightScheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_SCHEDULE_ID_NOT_EXISTED));

        return flightScheduleMapper.toFlightScheduleResponse(flightSchedule);
    }

    public FlightScheduleResponse updateFlightSchedule(
            FlightScheduleRequest flightScheduleRequest,
            int flightScheduleId
    ) {

        FlightSchedule flightSchedule = flightScheduleRepository.findById(flightScheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_SCHEDULE_ID_NOT_EXISTED));

        if (flightScheduleRequest.getArrivalAirportId()
                .compareTo(flightScheduleRequest.getDepartureAirportId()) == 0) {
            throw new AppException(ErrorCode.DEPARTURE_AND_ARRIVAL_TIME_CANNOT_CONFLICT);
        }

        Airport departureAirport = airportRepository
                .findByAirportCode(flightScheduleRequest.getDepartureAirportId())
                .orElseThrow(() -> new AppException(ErrorCode.AIRPORTID_NOT_EXISTD));

        Airport arrivalAirport = airportRepository
                .findByAirportCode(flightScheduleRequest.getArrivalAirportId())
                .orElseThrow(() -> new AppException(ErrorCode.AIRPORTID_NOT_EXISTD));

        Airline airline = airlineRepository
                .findById(flightScheduleRequest.getAirlineId())
                .orElseThrow(() -> new AppException(ErrorCode.AIRLINEID_NOT_EXISTED));

        long durationMinutes = Math.abs(
                ChronoUnit.MINUTES.between(
                        flightScheduleRequest.getDepartureTime(),
                        flightScheduleRequest.getArrivalTime()
                )
        );

        flightScheduleMapper.updateFlightSchedule(flightScheduleRequest, flightSchedule);
        flightSchedule.setAirline(airline);
        flightSchedule.setDepartureAirport(departureAirport);
        flightSchedule.setArrivalAirport(arrivalAirport);
        flightSchedule.setDurationMinutes((int) durationMinutes);

        flightScheduleRepository.save(flightSchedule);

        return flightScheduleMapper.toFlightScheduleResponse(flightSchedule);
    }

    public String deleteFlightSchedule(int id) {
        if(flightScheduleRepository.existsById(id)) {
            flightScheduleRepository.deleteById(id);

            return "Delete finished!";
        }
        return "FlightScheduleId doesn't existed!";
    }
}
