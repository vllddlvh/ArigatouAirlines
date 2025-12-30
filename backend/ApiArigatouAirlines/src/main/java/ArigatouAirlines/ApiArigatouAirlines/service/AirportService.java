package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AirportRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AirportResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Airport;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.AirportMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.AirportRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AirportService {
    AirportMapper airportMapper;
    AirportRepository airportRepository;

    public AirportResponse creationAirport(AirportRequest airportRequest) {
        if(airportRepository.existsAirportByAirportCode(airportRequest.getAirportCode())) {
            throw new AppException(ErrorCode.AIRPORTCODE_EXISTED);
        }
        Airport airport = airportMapper.toAirport(airportRequest);
        airportRepository.save(airport);

        return airportMapper.toAirportResponse(airport);
    }

    public List<AirportResponse> getAllAirport() {
        List<AirportResponse> listAirports = airportRepository.findAll()
                .stream().map(airportMapper :: toAirportResponse).toList();

        return listAirports;
    }

    public AirportResponse getById(String airportId) {
        return airportMapper.toAirportResponse(airportRepository
                .findById(airportId).orElseThrow(() -> new AppException(ErrorCode.AIRPORTID_NOT_EXISTD)));
    }

    public AirportResponse updateAirport(AirportRequest airportRequest, String airportId) {
        Airport airport = airportRepository.findById(airportId)
                .orElseThrow(()-> new AppException(ErrorCode.AIRPORTID_NOT_EXISTD));
        if(!airportRequest.getAirportCode().equals(airport.getAirportCode())
                && airportRepository.existsAirportByAirportCode(airportRequest.getAirportCode())) {

                throw new AppException(ErrorCode.AIRPORTCODE_EXISTED);
        }
        airportMapper.updateAirport(airportRequest, airport);
        airportRepository.save(airport);

        return airportMapper.toAirportResponse(airport);
    }

    public void deleteAirport(String airportId) {
        if (!airportRepository.existsById(airportId)) {
            throw new AppException(ErrorCode.AIRPORTID_NOT_EXISTD);
        }
        try {
            airportRepository.deleteById(airportId);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.AIRPORT_IN_USE);
        }
    }
}
