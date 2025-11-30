package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightScheduleRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightScheduleResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSchedule;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.FlightScheduleMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightScheduleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class FlightScheduleService {
    FlightScheduleRepository flightScheduleRepository;
    FlightScheduleMapper flightScheduleMapper;

    public FlightScheduleResponse createFlightSchedule(FlightScheduleRequest request) {
        FlightSchedule flightSchedule = FlightSchedule.builder()
                .flightNumber(request.getFlightNumber())
                .aircraftType(request.getAircraftType())
                .departureCity(request.getDepartureCity())
                .arrivalCity(request.getArrivalCity())
                .departureAirportCode(request.getDepartureAirport())
                .arrivalAirportCode(request.getArrivalAirport())
                .departureTime(request.getDepartureTime())
                .arrivalTime(request.getArrivalTime())
                .basePrice(request.getBasePrice())
                .status(request.getStatus() != null ? request.getStatus() : "Scheduled")
                .isActive(true)
                .build();

        // Calculate duration in minutes
        if (request.getDepartureTime() != null && request.getArrivalTime() != null) {
            long durationMinutes = Duration.between(request.getDepartureTime(), request.getArrivalTime()).toMinutes();
            flightSchedule.setDurationMinutes((int) Math.abs(durationMinutes));
        }

        flightScheduleRepository.save(flightSchedule);
        return flightScheduleMapper.toFlightScheduleResponse(flightSchedule);
    }

    public List<FlightScheduleResponse> getAllFlightSchedules() {
        return flightScheduleRepository.findAll().stream()
                .map(flightScheduleMapper::toFlightScheduleResponse)
                .toList();
    }

    public FlightScheduleResponse getFlightScheduleById(int id) {
        FlightSchedule flightSchedule = flightScheduleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_NOT_EXISTED));
        return flightScheduleMapper.toFlightScheduleResponse(flightSchedule);
    }

    public FlightScheduleResponse updateFlightSchedule(int id, FlightScheduleRequest request) {
        FlightSchedule flightSchedule = flightScheduleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_NOT_EXISTED));

        if (request.getFlightNumber() != null) {
            flightSchedule.setFlightNumber(request.getFlightNumber());
        }
        if (request.getAircraftType() != null) {
            flightSchedule.setAircraftType(request.getAircraftType());
        }
        if (request.getDepartureCity() != null) {
            flightSchedule.setDepartureCity(request.getDepartureCity());
        }
        if (request.getArrivalCity() != null) {
            flightSchedule.setArrivalCity(request.getArrivalCity());
        }
        if (request.getDepartureAirport() != null) {
            flightSchedule.setDepartureAirportCode(request.getDepartureAirport());
        }
        if (request.getArrivalAirport() != null) {
            flightSchedule.setArrivalAirportCode(request.getArrivalAirport());
        }
        if (request.getDepartureTime() != null) {
            flightSchedule.setDepartureTime(request.getDepartureTime());
        }
        if (request.getArrivalTime() != null) {
            flightSchedule.setArrivalTime(request.getArrivalTime());
        }
        if (request.getBasePrice() != null) {
            flightSchedule.setBasePrice(request.getBasePrice());
        }
        if (request.getStatus() != null) {
            flightSchedule.setStatus(request.getStatus());
        }

        // Recalculate duration
        if (flightSchedule.getDepartureTime() != null && flightSchedule.getArrivalTime() != null) {
            long durationMinutes = Duration.between(flightSchedule.getDepartureTime(), flightSchedule.getArrivalTime()).toMinutes();
            flightSchedule.setDurationMinutes((int) Math.abs(durationMinutes));
        }

        flightScheduleRepository.save(flightSchedule);
        return flightScheduleMapper.toFlightScheduleResponse(flightSchedule);
    }

    public String deleteFlightSchedule(int id) {
        if (flightScheduleRepository.existsById(id)) {
            flightScheduleRepository.deleteById(id);
            return "Flight schedule deleted successfully!";
        }
        return "Flight schedule ID doesn't exist!";
    }
}
