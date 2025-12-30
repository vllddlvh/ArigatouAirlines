package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.PassengerRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.PassengerResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Passenger;
import ArigatouAirlines.ApiArigatouAirlines.mapper.PassengerMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.PassengerRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PassengerService {
    PassengerRepository passengerRepository;

    PassengerMapper passengerMapper;

    public PassengerResponse creationPassenger(PassengerRequest passengerRequest) {
        Passenger passenger = passengerMapper.toPassenger(passengerRequest);
        passengerRepository.save(passenger);
        return passengerMapper.toPassengerResponse(passenger);
    }

    public  List<PassengerResponse> getAllPassenger() {
        return passengerRepository.findAll().stream().map(passengerMapper::toPassengerResponse).toList();
    }

    public  PassengerResponse getPassenger(int passengerId) {
        return passengerMapper.toPassengerResponse(passengerRepository.findById(passengerId).orElseThrow());
    }

    public PassengerResponse updatePassenger(int passengerId, PassengerRequest passengerRequest) {
        Passenger passenger = passengerRepository.findById(passengerId).orElseThrow();
        passenger = passengerMapper.toPassenger(passengerRequest);
        passengerRepository.save(passenger);

        return passengerMapper.toPassengerResponse(passenger);
    }

    public String deletePassenger(int passengerId) {
        passengerRepository.deleteById(passengerId);

        return "Delete finish!";
    }
}
