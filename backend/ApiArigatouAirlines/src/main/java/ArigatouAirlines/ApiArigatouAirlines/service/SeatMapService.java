package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.SeatMapRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.SeatMapResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.SeatMap;
import ArigatouAirlines.ApiArigatouAirlines.enums.SeatClass;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.SeatMapMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.AircraftTypeRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.SeatMapRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class SeatMapService {
    SeatMapRepository seatMapRepository;
    SeatMapMapper seatMapMapper;
    AircraftTypeRepository aircraftTypeRepository;

    public SeatMapResponse creationSeatMap(SeatMapRequest seatMapRequest) {
        SeatMap seatMap = seatMapMapper.toSeatMap(seatMapRequest);
        seatMap.setAircraftType(aircraftTypeRepository.findById(seatMapRequest.getAircraftTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.AIRCRAFT_TYPE_ID_NOT_EXSITED)));

        seatMapRepository.save(seatMap);
        return seatMapMapper.toSeatMapResponse(seatMap);
    }
}
