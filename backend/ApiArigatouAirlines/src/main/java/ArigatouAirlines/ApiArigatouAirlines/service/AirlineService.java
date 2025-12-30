package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AirlineRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AirlineResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Airline;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.AirlineMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.AirlineRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.AircraftRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AirlineService {
    AirlineMapper airlineMapper;
    AirlineRepository airlineRepository;
    AircraftRepository aircraftRepository;

    public AirlineResponse creationAirline(AirlineRequest airlineRequest) {
        if(airlineRepository.existsAirlineByAirlineCode(airlineRequest.getAirlineCode())) {
            throw new AppException(ErrorCode.AIRLINECODE_EXISTED);
        }
        Airline airline = airlineMapper.toAirline(airlineRequest);
        airlineRepository.save(airline);

        return airlineMapper.toAirlineResponse(airline);
    }

    public List<AirlineResponse> getAllAirline() {
        List<AirlineResponse> listAirlines = airlineRepository.findAll()
                .stream().map(airlineMapper :: toAirlineResponse).toList();

        return listAirlines;
    }

    public AirlineResponse getById(int airlineId) {
        return airlineMapper.toAirlineResponse(airlineRepository
                .findById(airlineId).orElseThrow(() -> new AppException(ErrorCode.AIRLINEID_NOT_EXISTED)));
    }

    public AirlineResponse updateAirline(AirlineRequest airlineRequest, int airlineId) {
        Airline airline = airlineRepository.findById(airlineId)
                .orElseThrow(()-> new AppException(ErrorCode.AIRLINEID_NOT_EXISTED));
        if(!airlineRequest.getAirlineCode().equals(airline.getAirlineCode())
                && airlineRepository.existsAirlineByAirlineCode(airlineRequest.getAirlineCode())) {

            throw new AppException(ErrorCode.AIRLINECODE_EXISTED);
        }
        airlineMapper.updateAirline(airlineRequest, airline);
        airlineRepository.save(airline);

        return airlineMapper.toAirlineResponse(airline);
    }

    public void deleteAirline(int airlineId) {
        // Check if airline exists
        if (!airlineRepository.existsById(airlineId)) {
            throw new AppException(ErrorCode.AIRLINEID_NOT_EXISTED);
        }
        
        // Check if airline has associated aircrafts
        long aircraftCount = aircraftRepository.countByAirline_AirlineId(airlineId);
        if (aircraftCount > 0) {
            throw new RuntimeException("Cannot delete airline. There are " + aircraftCount + " aircraft(s) associated with this airline. Please delete or reassign the aircraft first.");
        }
        
        airlineRepository.deleteById(airlineId);
    }
}
