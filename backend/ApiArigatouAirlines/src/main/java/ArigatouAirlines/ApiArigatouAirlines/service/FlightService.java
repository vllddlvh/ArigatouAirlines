package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightResponseWithoutList;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightSeatResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.*;
import ArigatouAirlines.ApiArigatouAirlines.enums.SeatClass;
import ArigatouAirlines.ApiArigatouAirlines.enums.SeatType;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusFlightSeat;
import ArigatouAirlines.ApiArigatouAirlines.repository.SeatMapRepository;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.FlightMapper;
import ArigatouAirlines.ApiArigatouAirlines.mapper.FlightSeatMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.AircraftRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightPriceRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightScheduleRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightSeatRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.TicketRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class FlightService {
    FlightRepository flightRepository;
    FlightMapper flightMapper;
    FlightScheduleRepository flightScheduleRepository;
    AircraftRepository aircraftRepository;
    FlightPriceRepository flightPriceRepository;
    FlightSeatRepository flightSeatRepository;
    TicketRepository ticketRepository;
    FlightSeatMapper flightSeatMapper;
    SeatMapRepository seatMapRepository;

    private FlightPrice getDefaultFlightPrice(int flightId) {
        return flightPriceRepository
                .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, "ECONOMY")
                .orElseGet(() -> flightPriceRepository.findAllByFlight_FlightId(flightId)
                        .stream()
                        .min(Comparator.comparing(fp -> {
                            BigDecimal base = fp.getBasePrice() == null ? BigDecimal.ZERO : fp.getBasePrice();
                            BigDecimal tax = fp.getTax() == null ? BigDecimal.ZERO : fp.getTax();
                            return base.add(tax);
                        }))
                        .orElse(null));
    }

    private long computeBookedSeats(int flightId) {
        long bookedBySeatStatus = flightSeatRepository.countByFlight_FlightIdAndStatus(
                flightId,
                StatusFlightSeat.Booked
        );

        long soldByTicket = ticketRepository.countSoldTicketsByFlightId(flightId);

        return Math.max(bookedBySeatStatus, soldByTicket);
    }

    @Transactional
    public FlightResponse creationFlight(FlightRequest flightRequest) {
        Flight flight = flightMapper.toFlight(flightRequest);
        List<FlightSeatResponse> flightSeatReponseList;

        if(!flightScheduleRepository.existsById(flightRequest.getScheduleId())) {
            throw new AppException(ErrorCode.FLIGHT_SCHEDULE_ID_NOT_EXISTED);
        }
        FlightSchedule schedule = flightScheduleRepository.findById(flightRequest.getScheduleId())
                .orElseThrow();
        flight.setSchedule(schedule);

        if(!aircraftRepository.existsById(flightRequest.getAircraftId())) {
            throw new AppException(ErrorCode.FLIGHT_AIRCRAFT_REQUIRED);
        }
        Aircraft aircraft = aircraftRepository.findById(flightRequest.getAircraftId())
                .orElseThrow();
        flight.setAircraft(aircraft);

        LocalTime departureTime = flightRequest.getDepartureTime() == null
                ? flight.getSchedule().getDepartureTime() : flightRequest.getDepartureTime();

        LocalDateTime departureDateTime =  LocalDateTime.of(flightRequest.getFlightDate(), departureTime);
        flight.setFlightDate(flightRequest.getFlightDate());
        flight.setDepartureDateTime(departureDateTime);
        flight.setArrivalDateTime(departureDateTime.plusMinutes(flight.getSchedule().getDurationMinutes()));

        flightRepository.save(flight);

        AircraftType aircraftType = aircraft.getAircraftType();
        List<SeatMap> seatMapList = aircraftType.getListSeatMap();
        
        // Nếu AircraftType chưa có SeatMap, tự động tạo
        if (seatMapList == null || seatMapList.isEmpty()) {
            seatMapList = generateSeatMapForAircraftType(aircraftType);
            aircraftType.setListSeatMap(seatMapList);
        }
        
        List<FlightSeat> flightSeatList = new ArrayList<>();
        for(int i = 0; i < seatMapList.size(); i++) {
            FlightSeat flightSeat = FlightSeat.builder()
                    .flight(flight)
                    .seatMap(seatMapList.get(i))
                    .status(StatusFlightSeat.Available)  // Set status mặc định là Available
                    .build();
            flightSeatList.add(flightSeat);
        }
        flightSeatRepository.saveAll(flightSeatList);
        flightSeatReponseList = flightSeatList.stream().map(flightSeatMapper::toFlightSeatResponse).toList();
        FlightResponse flightResponse = flightMapper.toFlightResponse(flight);
        flightResponse.setFlightSeatList(flightSeatReponseList);
        return flightResponse;
    }

    public List<FlightResponseWithoutList> getListFlight() {
        return flightRepository.findAll().stream().map(flight -> {
            FlightResponseWithoutList response = flightMapper.toFlightResponseWithoutList(flight);
            // Populate flattened fields for easier frontend consumption
            if (flight.getSchedule() != null) {
                response.setFlightNumber(flight.getSchedule().getFlightNumber());
                if (flight.getSchedule().getDepartureAirport() != null) {
                    response.setDepartureAirportCode(flight.getSchedule().getDepartureAirport().getAirportCode());
                }
                if (flight.getSchedule().getArrivalAirport() != null) {
                    response.setArrivalAirportCode(flight.getSchedule().getArrivalAirport().getAirportCode());
                }
                if (flight.getSchedule().getAirline() != null) {
                    response.setAirline(flight.getSchedule().getAirline().getAirlineName());
                }
            }

            long totalSeats = flightSeatRepository.countByFlight_FlightId(flight.getFlightId());
            if (totalSeats <= 0
                    && flight.getAircraft() != null
                    && flight.getAircraft().getAircraftType() != null
                    && flight.getAircraft().getAircraftType().getTotalSeats() > 0) {
                totalSeats = flight.getAircraft().getAircraftType().getTotalSeats();
            }
            long bookedSeats = computeBookedSeats(flight.getFlightId());
            response.setTotalSeats((int) totalSeats);
            response.setBookedSeats((int) bookedSeats);

            FlightPrice flightPrice = getDefaultFlightPrice(flight.getFlightId());
            if (flightPrice != null) {
                response.setBasePrice(flightPrice.getBasePrice());
                response.setTax(flightPrice.getTax());
            }
            return response;
        }).toList();
    }

    public FlightResponse getFlight(int flightId) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED));
        FlightResponse flightResponse = flightMapper.toFlightResponse(flight);
        List<FlightSeatResponse> flightSeatResponseList = flightSeatRepository.findAllByFlight_FlightId(flightId)
                .stream().map(flightSeatMapper::toFlightSeatResponse).toList();
        flightResponse.setFlightSeatList(flightSeatResponseList);

        // flattened fields
        if (flight.getSchedule() != null) {
            flightResponse.setFlightNumber(flight.getSchedule().getFlightNumber());
            if (flight.getSchedule().getDepartureAirport() != null) {
                flightResponse.setDepartureAirportCode(flight.getSchedule().getDepartureAirport().getAirportCode());
            }
            if (flight.getSchedule().getArrivalAirport() != null) {
                flightResponse.setArrivalAirportCode(flight.getSchedule().getArrivalAirport().getAirportCode());
            }
            if (flight.getSchedule().getAirline() != null) {
                flightResponse.setAirline(flight.getSchedule().getAirline().getAirlineName());
            }
        }

        FlightPrice flightPrice = getDefaultFlightPrice(flightId);
        if (flightPrice != null) {
            flightResponse.setBasePrice(flightPrice.getBasePrice());
            flightResponse.setTax(flightPrice.getTax());
        }
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

        LocalDate flightDate = flightRequest.getFlightDate();
        if (flightDate == null) {
            if (flight.getFlightDate() != null) {
                flightDate = flight.getFlightDate();
            } else if (flight.getDepartureDateTime() != null) {
                flightDate = flight.getDepartureDateTime().toLocalDate();
            }
        }

        LocalDateTime departureDateTime = LocalDateTime.of(flightDate, departureTime);
        flight.setFlightDate(flightDate);
        flight.setDepartureDateTime(departureDateTime);
        flight.setArrivalDateTime(departureDateTime.plusMinutes(flight.getSchedule().getDurationMinutes()));

        flightRepository.save(flight);

        // Legacy fix: if a flight was created without aircraft/seats, generating seats after assigning aircraft
        if (flight.getAircraft() != null) {
            List<FlightSeat> existingSeats = flightSeatRepository.findAllByFlight_FlightId(flightId);
            if (existingSeats == null || existingSeats.isEmpty()) {
                AircraftType aircraftType = flight.getAircraft().getAircraftType();
                List<SeatMap> seatMapList = aircraftType.getListSeatMap();
                List<FlightSeat> flightSeatList = new ArrayList<>();
                for (int i = 0; i < seatMapList.size(); i++) {
                    FlightSeat flightSeat = FlightSeat.builder()
                            .flight(flight)
                            .seatMap(seatMapList.get(i))
                            .status(StatusFlightSeat.Available)  // Set status mặc định là Available
                            .build();
                    flightSeatList.add(flightSeat);
                }
                flightSeatRepository.saveAll(flightSeatList);
            }
        }

        return flightMapper.toFlightResponse(flight);
    }

    public String deleteFlight(int flightId) {
        if(flightRepository.existsById(flightId)) {
            flightRepository.deleteById(flightId);
            return "Delete Finished!";
        }
        return "FLightID doesn't found!";
    }

    /**
     * Search flights with filters
     * @param departureAirportCode Departure airport code (optional)
     * @param arrivalAirportCode Arrival airport code (optional)
     * @param departureDate Departure date (optional)
     * @return List of filtered flights
     */
    public List<FlightResponseWithoutList> searchFlights(
            String departureAirportCode, 
            String arrivalAirportCode, 
            LocalDate departureDate) {
        
        List<Flight> allFlights = flightRepository.findAll();
        
        // Apply filters
        List<Flight> filteredFlights = allFlights.stream()
            .filter(flight -> {
                // Filter by departure airport
                if (departureAirportCode != null && !departureAirportCode.isEmpty()) {
                    String flightDepartureCode = flight.getSchedule() != null 
                        && flight.getSchedule().getDepartureAirport() != null
                        ? flight.getSchedule().getDepartureAirport().getAirportCode()
                        : null;
                    if (flightDepartureCode == null || 
                        !flightDepartureCode.equalsIgnoreCase(departureAirportCode)) {
                        return false;
                    }
                }
                
                // Filter by arrival airport
                if (arrivalAirportCode != null && !arrivalAirportCode.isEmpty()) {
                    String flightArrivalCode = flight.getSchedule() != null 
                        && flight.getSchedule().getArrivalAirport() != null
                        ? flight.getSchedule().getArrivalAirport().getAirportCode()
                        : null;
                    if (flightArrivalCode == null || 
                        !flightArrivalCode.equalsIgnoreCase(arrivalAirportCode)) {
                        return false;
                    }
                }
                
                // Filter by departure date
                if (departureDate != null && flight.getDepartureDateTime() != null) {
                    LocalDate flightDate = flight.getDepartureDateTime().toLocalDate();
                    if (!flightDate.equals(departureDate)) {
                        return false;
                    }
                }
                
                return true;
            })
            .collect(Collectors.toList());
        
        // Map to response DTOs
        return filteredFlights.stream().map(flight -> {
            FlightResponseWithoutList response = flightMapper.toFlightResponseWithoutList(flight);
            
            // Populate flattened fields
            if (flight.getSchedule() != null) {
                response.setFlightNumber(flight.getSchedule().getFlightNumber());
                if (flight.getSchedule().getDepartureAirport() != null) {
                    response.setDepartureAirportCode(flight.getSchedule().getDepartureAirport().getAirportCode());
                }
                if (flight.getSchedule().getArrivalAirport() != null) {
                    response.setArrivalAirportCode(flight.getSchedule().getArrivalAirport().getAirportCode());
                }
                if (flight.getSchedule().getAirline() != null) {
                    response.setAirline(flight.getSchedule().getAirline().getAirlineName());
                }
            }

            long totalSeats = flightSeatRepository.countByFlight_FlightId(flight.getFlightId());
            if (totalSeats <= 0
                    && flight.getAircraft() != null
                    && flight.getAircraft().getAircraftType() != null
                    && flight.getAircraft().getAircraftType().getTotalSeats() > 0) {
                totalSeats = flight.getAircraft().getAircraftType().getTotalSeats();
            }
            long bookedSeats = computeBookedSeats(flight.getFlightId());
            response.setTotalSeats((int) totalSeats);
            response.setBookedSeats((int) bookedSeats);

            FlightPrice flightPrice = getDefaultFlightPrice(flight.getFlightId());
            if (flightPrice != null) {
                response.setBasePrice(flightPrice.getBasePrice());
                response.setTax(flightPrice.getTax());
            }
            return response;
        }).toList();
    }

    /**
     * Tự động tạo SeatMap cho AircraftType nếu chưa có
     */
    private List<SeatMap> generateSeatMapForAircraftType(AircraftType aircraftType) {
        List<SeatMap> listSeatMap = new ArrayList<>();
        int numCols = aircraftType.getNumCols() > 0 ? aircraftType.getNumCols() : 6;
        int totalSeats = aircraftType.getTotalSeats() > 0 ? aircraftType.getTotalSeats() : 180;
        int rows = totalSeats / numCols;
        
        for (int row = 1; row <= rows; row++) {
            for (int col = 1; col <= numCols; col++) {
                SeatMap seatMap = SeatMap.builder()
                        .aircraftType(aircraftType)
                        .visualRow(row)
                        .visualCol(col)
                        .build();
                
                // Phân bổ hạng ghế theo hàng: 1/3 Business, 1/3 Premium, 1/3 Economy
                if (row <= rows / 3) {
                    seatMap.setSeatClass(SeatClass.BUSINESS_PREMIER);
                } else if (row <= 2 * rows / 3) {
                    seatMap.setSeatClass(SeatClass.PREMIUM_ECONOMY);
                } else {
                    seatMap.setSeatClass(SeatClass.ECONOMY);
                }

                // Xác định loại ghế theo cột
                if (col == 1 || col == numCols) {
                    seatMap.setSeatType(SeatType.WINDOW);
                } else if (col == numCols / 2 || col == numCols / 2 + 1) {
                    seatMap.setSeatType(SeatType.AISLE);
                } else {
                    seatMap.setSeatType(SeatType.MIDDLE);
                }
                
                // Tạo số ghế: VD 1A, 1B, 2C...
                String seatNumber = row + Character.toString((char) ('A' + col - 1));
                seatMap.setSeatNumber(seatNumber);

                listSeatMap.add(seatMap);
            }
        }
        
        // Sort theo row, col
        listSeatMap.sort((s1, s2) -> {
            int rowCompare = Integer.compare(s1.getVisualRow(), s2.getVisualRow());
            if (rowCompare != 0) return rowCompare;
            return Integer.compare(s1.getVisualCol(), s2.getVisualCol());
        });
        
        // Lưu vào database
        seatMapRepository.saveAll(listSeatMap);
        
        return listSeatMap;
    }
}
