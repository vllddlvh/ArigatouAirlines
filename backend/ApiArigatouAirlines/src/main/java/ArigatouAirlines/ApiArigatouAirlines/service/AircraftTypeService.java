package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AircraftTypeRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AircraftTypeResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AircraftTypeResponseWithoutList;
import ArigatouAirlines.ApiArigatouAirlines.entity.AircraftType;
import ArigatouAirlines.ApiArigatouAirlines.entity.SeatMap;
import ArigatouAirlines.ApiArigatouAirlines.enums.SeatClass;
import ArigatouAirlines.ApiArigatouAirlines.enums.SeatType;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.AircraftTypeMapper;
import ArigatouAirlines.ApiArigatouAirlines.mapper.SeatMapMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.AircraftTypeRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.SeatMapRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AircraftTypeService {
    AircraftTypeRepository aircraftTypeRepository;
    SeatMapRepository seatMapRepository;
    SeatMapMapper seatMapMapper;
    AircraftTypeMapper aircraftTypeMapper;

    @Transactional
     public AircraftTypeResponse creationAircraftType(AircraftTypeRequest aircraftTypeRequest) {
        AircraftType aircraftType = aircraftTypeMapper.toAircraftType(aircraftTypeRequest);
        
        // Khởi tạo empty list TRƯỚC khi save để tránh lỗi orphanRemoval
        List<SeatMap> listSeatMap = new ArrayList<>();
        aircraftType.setListSeatMap(listSeatMap);
        
        // Save AircraftType trước để có ID
        aircraftTypeRepository.save(aircraftType);
        
        // Tạo seats
        int rows = aircraftType.getTotalSeats()/ aircraftType.getNumCols();
        for(int row = 1; row <= rows; row++) {
            for(int col = 1; col <= aircraftType.getNumCols(); col++) {
                SeatMap seatMap = SeatMap.builder()
                        .aircraftType(aircraftType)
                        .visualRow(row)
                        .visualCol(col)
                        .build();
                if(row <= rows/3) {
                    seatMap.setSeatClass(SeatClass.BUSINESS_PREMIER);
                } else if(row <= 2*rows/3) {
                    seatMap.setSeatClass(SeatClass.PREMIUM_ECONOMY);
                } else {
                    seatMap.setSeatClass(SeatClass.ECONOMY);
                }

                if(col == 1 || col == aircraftType.getNumCols()) {
                    seatMap.setSeatType(SeatType.WINDOW);
                } else if(col == aircraftType.getNumCols()/2) {
                    seatMap.setSeatType(SeatType.AISLE);
                } else {
                    seatMap.setSeatType(SeatType.MIDDLE);
                }
                String seatNumber = Integer.toString(row) + Character.toString('A' + col - 1);
                seatMap.setSeatNumber(seatNumber);

                listSeatMap.add(seatMap);
            }
        }
        listSeatMap.sort((s1, s2) -> {
            int colCompare = Integer.compare(s1.getVisualRow(), s2.getVisualRow());
            if (colCompare != 0) {
                return colCompare;
            }
            return Integer.compare(s1.getVisualCol(), s2.getVisualCol());
        });

        // Save tất cả seats (cascade sẽ tự động update AircraftType)
        seatMapRepository.saveAll(listSeatMap);

        return aircraftTypeMapper.toAircraftTypeResponse(aircraftType);
    }

    public List<AircraftTypeResponseWithoutList> getAllAircraftTypes() {
        return aircraftTypeRepository.findAll()
                .stream().map(aircraftTypeMapper :: toAircraftTypeResponseWithoutList).toList();
    }

    public AircraftTypeResponse getAircraftTypeById(int aircraftTypeId) {
        AircraftType aircraftType = aircraftTypeRepository.findById(aircraftTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.AIRCRAFT_TYPE_ID_NOT_EXSITED));
        List<SeatMap> listSeatMap = seatMapRepository.findAllByAircraftType_AircraftTypeId(aircraftTypeId);

        listSeatMap.sort((s1, s2) -> {
            int colCompare = Integer.compare(s1.getVisualRow(), s2.getVisualRow());
            if (colCompare != 0) {
                return colCompare;
            }
            return Integer.compare(s1.getVisualCol(), s2.getVisualCol());
        });

        aircraftType.setListSeatMap(listSeatMap);

        return aircraftTypeMapper.toAircraftTypeResponse(aircraftType);
    }

    public AircraftTypeResponse updateAircraftType(AircraftTypeRequest aircraftTypeRequest, int id) {
        AircraftType aircraftType = aircraftTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AIRCRAFT_TYPE_ID_NOT_EXSITED));
        aircraftTypeMapper.updateAircraftType(aircraftTypeRequest, aircraftType);
        aircraftTypeRepository.save(aircraftType);

        return  aircraftTypeMapper.toAircraftTypeResponse(aircraftType);
    }

    public String deleteAircraftType(int id) {
        if(!aircraftTypeRepository.existsById(id)) {
            return "AircraftTypeID doesn't exist!";
        }
        aircraftTypeRepository.deleteById(id);
        return "Delete AircraftType finished!";
    }


}
