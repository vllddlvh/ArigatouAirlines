package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.FlightPriceRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.FlightPriceResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Flight;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightPrice;
import ArigatouAirlines.ApiArigatouAirlines.entity.TicketClass;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.FlightPriceMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightPriceRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.TicketClassRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class FlightPriceService {
    FlightPriceRepository flightPriceRepository;
    FlightPriceMapper flightPriceMapper;
    FlightRepository flightRepository;
    TicketClassRepository ticketClassRepository;

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

    private FlightPrice getFlightPriceByClass(int flightId, String ticketClassName) {
        String normalized = ticketClassName == null ? "" : ticketClassName.trim();
        if (normalized.isBlank()) {
            return getDefaultFlightPrice(flightId);
        }
        FlightPrice direct = flightPriceRepository
                .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, normalized)
                .orElse(null);
        if (direct != null) {
            return direct;
        }

        // Support legacy/alias naming: PREMIUM <-> PREMIUM_ECONOMY
        if ("PREMIUM_ECONOMY".equalsIgnoreCase(normalized)) {
            return flightPriceRepository
                    .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, "PREMIUM")
                    .orElse(null);
        }
        if ("PREMIUM".equalsIgnoreCase(normalized)) {
            return flightPriceRepository
                    .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, "PREMIUM_ECONOMY")
                    .orElse(null);
        }

        // Support legacy/alias naming: BUSINESS <-> BUSINESS_CLASS/BUSINESS_PREMIER
        if ("BUSINESS".equalsIgnoreCase(normalized)) {
            FlightPrice alt = flightPriceRepository
                    .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, "BUSINESS_CLASS")
                    .orElse(null);
            if (alt != null) {
                return alt;
            }
            return flightPriceRepository
                    .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, "BUSINESS_PREMIER")
                    .orElse(null);
        }
        if ("BUSINESS_CLASS".equalsIgnoreCase(normalized) || "BUSINESS_PREMIER".equalsIgnoreCase(normalized)) {
            return flightPriceRepository
                    .findFirstByFlight_FlightIdAndTicketClass_ClassNameIgnoreCase(flightId, "BUSINESS")
                    .orElse(null);
        }
        return null;
    }

    public FlightPriceResponse creationFlightPrice(FlightPriceRequest flightPriceRequest) {
        Flight fLight = flightRepository.findById(flightPriceRequest.getFlightId())
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED));
        TicketClass ticketClass = ticketClassRepository.findById(flightPriceRequest.getTicketClassId())
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_CLASS_ID_IS_NOT_AVAILABLE));

        FlightPrice flightPrice = flightPriceMapper.toFlightPrice(flightPriceRequest);
        flightPrice.setAvailableSeats(flightPriceRequest.getTotalSeats());
        flightPrice.setFlight(fLight);
        flightPrice.setTicketClass(ticketClass);
        flightPriceRepository.save(flightPrice);

        return flightPriceMapper.toFlightPriceResponse(flightPrice);
    }

    public FlightPriceResponse getFlightPrice(int flightId) {
        if(!flightRepository.existsById(flightId)) {
            throw new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED);
        }

        FlightPrice flightPrice = getDefaultFlightPrice(flightId);
        return flightPriceMapper.toFlightPriceResponse(flightPrice);
    }

    public FlightPriceResponse getFlightPrice(int flightId, String ticketClassName) {
        if(!flightRepository.existsById(flightId)) {
            throw new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED);
        }

        // Luôn backfill trước để đảm bảo có đủ 3 hạng vé
        backfillFlightPrices(flightId);
        
        FlightPrice flightPrice = getFlightPriceByClass(flightId, ticketClassName);
        if (flightPrice == null) {
            // Nếu không tìm thấy đúng class, fallback về ECONOMY
            flightPrice = getDefaultFlightPrice(flightId);
        }
        if (flightPrice == null) {
            throw new AppException(ErrorCode.FLIGHT_PRICE_ID_IS_NOT_AVAILABLE);
        }
        return flightPriceMapper.toFlightPriceResponse(flightPrice);
    }

    public FlightPriceResponse updateFlightPrice(int flightPriceId, FlightPriceRequest flightPriceRequest) {
        FlightPrice flightPrice = flightPriceRepository.findById(flightPriceId)
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_PRICE_ID_IS_NOT_AVAILABLE));

        if(flightRepository.existsById(flightPriceRequest.getFlightId())) {
            Flight fLight = flightRepository.findById(flightPriceRequest.getFlightId())
                    .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED));
            flightPrice.setFlight(fLight);
        }
        if(ticketClassRepository.existsById(flightPriceRequest.getTicketClassId())) {
            TicketClass ticketClass = ticketClassRepository.findById(flightPriceRequest.getTicketClassId())
                    .orElseThrow(() -> new AppException(ErrorCode.TICKET_CLASS_ID_IS_NOT_AVAILABLE));
            flightPrice.setTicketClass(ticketClass);
        }
        flightPriceMapper.toUpdateFlightPrice(flightPriceRequest, flightPrice);
        flightPriceRepository.save(flightPrice);
        return flightPriceMapper.toFlightPriceResponse(flightPrice);
    }

    public List<FlightPriceResponse> getFlightPricesByFlight(int flightId) {
        if (!flightRepository.existsById(flightId)) {
            throw new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED);
        }
        // Luôn backfill để đảm bảo đủ 3 hạng vé và giá đúng theo multiplier (kể cả trường hợp đã có record nhưng basePrice/tax = 0 hoặc sai)
        backfillFlightPrices(flightId);

        List<FlightPrice> prices = flightPriceRepository.findAllByFlight_FlightId(flightId);

        return prices.stream()
                .map(flightPriceMapper::toFlightPriceResponse)
                .toList();
    }

    /**
     * Backfill FlightPrice cho các chuyến bay cũ chưa có đủ giá cho 3 hạng vé
     * Tỷ lệ: ECONOMY x1, PREMIUM_ECONOMY x1.5, BUSINESS x2
     */
    public List<FlightPriceResponse> backfillFlightPrices(int flightId) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new AppException(ErrorCode.FLIGHT_ID_NOT_EXISTED));
        
        List<FlightPrice> existingPrices = flightPriceRepository.findAllByFlight_FlightId(flightId);
        List<TicketClass> allTicketClasses = ticketClassRepository.findAll();
        
        // Tìm giá ECONOMY làm cơ sở
        BigDecimal baseEconomyPrice = BigDecimal.ZERO;
        BigDecimal baseTax = BigDecimal.ZERO;
        
        for (FlightPrice fp : existingPrices) {
            if (fp.getTicketClass() != null && 
                "ECONOMY".equalsIgnoreCase(fp.getTicketClass().getClassName())) {
                baseEconomyPrice = fp.getBasePrice() != null ? fp.getBasePrice() : BigDecimal.ZERO;
                baseTax = fp.getTax() != null ? fp.getTax() : BigDecimal.ZERO;
                break;
            }
        }
        
        // Nếu không có giá ECONOMY, lấy giá đầu tiên làm cơ sở
        if (baseEconomyPrice.compareTo(BigDecimal.ZERO) == 0 && !existingPrices.isEmpty()) {
            FlightPrice first = existingPrices.get(0);
            baseEconomyPrice = first.getBasePrice() != null ? first.getBasePrice() : BigDecimal.valueOf(1000000);
            baseTax = first.getTax() != null ? first.getTax() : BigDecimal.ZERO;
        }
        
        // Nếu vẫn không có giá, dùng giá mặc định
        if (baseEconomyPrice.compareTo(BigDecimal.ZERO) == 0) {
            baseEconomyPrice = BigDecimal.valueOf(1000000);
        }
        
        List<FlightPrice> createdPrices = new java.util.ArrayList<>();
        
        for (TicketClass tc : allTicketClasses) {
            // Tính giá theo tỷ lệ
            BigDecimal multiplier = getMultiplier(tc.getClassName());
            BigDecimal correctPrice = baseEconomyPrice.multiply(multiplier);
            BigDecimal correctTax = baseTax.multiply(multiplier);
            
            // Tính số ghế theo hạng (từ SeatMap)
            int totalSeats = countSeatsForTicketClass(flight, tc.getClassName());
            
            // Tìm giá đã tồn tại cho hạng này
            FlightPrice existingPrice = existingPrices.stream()
                    .filter(fp -> fp.getTicketClass() != null && 
                                  fp.getTicketClass().getClassId() == tc.getClassId())
                    .findFirst()
                    .orElse(null);
            
            if (existingPrice != null) {
                // Cập nhật giá nếu khác với giá đúng (theo multiplier)
                if (existingPrice.getBasePrice() == null || 
                    existingPrice.getBasePrice().compareTo(correctPrice) != 0) {
                    existingPrice.setBasePrice(correctPrice);
                    existingPrice.setTax(correctTax);
                    if (existingPrice.getTotalSeats() == 0) {
                        existingPrice.setTotalSeats(totalSeats);
                        existingPrice.setAvailableSeats(totalSeats);
                    }
                    flightPriceRepository.save(existingPrice);
                }
            } else {
                // Tạo mới nếu chưa có
                FlightPrice newPrice = FlightPrice.builder()
                        .flight(flight)
                        .ticketClass(tc)
                        .basePrice(correctPrice)
                        .tax(correctTax)
                        .totalSeats(totalSeats)
                        .availableSeats(totalSeats)
                        .build();
                
                flightPriceRepository.save(newPrice);
                createdPrices.add(newPrice);
            }
        }
        
        // Trả về tất cả giá (cũ + mới)
        List<FlightPrice> allPrices = flightPriceRepository.findAllByFlight_FlightId(flightId);
        return allPrices.stream()
                .map(flightPriceMapper::toFlightPriceResponse)
                .toList();
    }
    
    private BigDecimal getMultiplier(String className) {
        if (className == null) return BigDecimal.ONE;
        String normalized = className.toUpperCase();
        if (normalized.equals("BUSINESS") || normalized.equals("BUSINESS_CLASS") || normalized.equals("BUSINESS_PREMIER")) {
            return BigDecimal.valueOf(2.0);
        }
        if (normalized.equals("PREMIUM_ECONOMY") || normalized.equals("PREMIUM")) return BigDecimal.valueOf(1.5);
        return BigDecimal.ONE;
    }
    
    private int countSeatsForTicketClass(Flight flight, String ticketClassName) {
        if (flight.getAircraft() == null || flight.getAircraft().getAircraftType() == null) {
            return 0;
        }
        
        var seatMapList = flight.getAircraft().getAircraftType().getListSeatMap();
        if (seatMapList == null) return 0;
        
        String targetSeatClass = mapTicketClassToSeatClass(ticketClassName);
        
        return (int) seatMapList.stream()
                .filter(sm -> sm.getSeatClass() != null && 
                             sm.getSeatClass().name().equalsIgnoreCase(targetSeatClass))
                .count();
    }
    
    private String mapTicketClassToSeatClass(String ticketClassName) {
        if (ticketClassName == null) return "ECONOMY";
        String normalized = ticketClassName.toUpperCase();
        if (normalized.equals("BUSINESS") || normalized.equals("BUSINESS_CLASS") || normalized.equals("BUSINESS_PREMIER")) return "BUSINESS_PREMIER";
        if (normalized.equals("PREMIUM_ECONOMY") || normalized.equals("PREMIUM")) return "PREMIUM_ECONOMY";
        return "ECONOMY";
    }

    /**
     * Backfill FlightPrice cho TẤT CẢ chuyến bay trong hệ thống
     */
    public void backfillAllFlights() {
        List<Flight> allFlights = flightRepository.findAll();
        for (Flight flight : allFlights) {
            try {
                backfillFlightPrices(flight.getFlightId());
            } catch (Exception e) {
                // Log and continue with next flight
                System.err.println("Failed to backfill flight " + flight.getFlightId() + ": " + e.getMessage());
            }
        }
    }
}
