package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AircraftRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AircraftResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Aircraft;
import ArigatouAirlines.ApiArigatouAirlines.entity.AircraftType;
import ArigatouAirlines.ApiArigatouAirlines.entity.Airline;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.AircraftMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.AircraftRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.AircraftTypeRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.AirlineRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class AircraftService {
    AircraftRepository aircraftRepository;
    AircraftMapper aircraftMapper;
    AircraftTypeRepository aircraftTypeRepository;
    AirlineRepository airlineRepository;

    public AircraftResponse creationAircraft(AircraftRequest aircraftRequest) {
        Aircraft aircraft = aircraftMapper.toAircraft(aircraftRequest);
        AircraftType aircraftType = aircraftTypeRepository.findById(aircraftRequest.getAircraftTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.AIRCRAFT_TYPE_ID_NOT_EXSITED));
        Airline airline = airlineRepository.findById(aircraftRequest.getAirlineId())
                        .orElseThrow(() -> new AppException(ErrorCode.AIRLINEID_NOT_EXISTED));
        aircraft.setAircraftType(aircraftType);
        aircraft.setAirline(airline);
        aircraftRepository.save(aircraft);
        return aircraftMapper.toAircraftResponse(aircraft);
    }

    public AircraftResponse getAircraftById(int id){
        Aircraft aircraft = aircraftRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AIRCRAFT_ID_NOT_EXSITED));
        aircraft.setAircraftType(aircraft.getAircraftType());
        return aircraftMapper.toAircraftResponse(aircraft);
    }

    public List<AircraftResponse> getAllAircraft() {
        return aircraftRepository.findAll().stream()
                .map(aircraftMapper::toAircraftResponse).toList();
    }

    public AircraftResponse updateAircraft(AircraftRequest aircraftRequest ,int id) {
        Aircraft aircraft = aircraftRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AIRCRAFT_ID_NOT_EXSITED));
        if(aircraftTypeRepository.existsById(aircraftRequest.getAircraftTypeId())) {
            AircraftType aircraftType = aircraftTypeRepository.findById(aircraftRequest.getAircraftTypeId())
                    .orElseThrow(() -> new AppException(ErrorCode.AIRCRAFT_TYPE_ID_NOT_EXSITED));
            aircraft.setAircraftType(aircraftType);
        }
        if(airlineRepository.existsById(aircraftRequest.getAirlineId())) {
            Airline airline = airlineRepository.findById(aircraftRequest.getAirlineId())
                    .orElseThrow(() -> new AppException(ErrorCode.AIRLINEID_NOT_EXISTED));
            aircraft.setAirline(airline);
        }
        aircraftMapper.updateAircraft(aircraftRequest, aircraft);
        aircraftRepository.save(aircraft);
        return aircraftMapper.toAircraftResponse(aircraft);
    }

    public String deleteAircraft(int id) {
        if(aircraftRepository.existsById(id)) {
            aircraftRepository.deleteById(id);
            return "Delete aircraft finished!";
        }
        return "AircraftID doesn't exist!";
    }
}
