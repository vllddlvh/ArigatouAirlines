package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.FlightPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlightPriceRepository extends JpaRepository<FlightPrice, Integer> {
    FlightPrice findFlightPriceByFlight_FlightId(int flightId);
    List<FlightPrice> findAllByFlight_FlightId(int flightId);

    Optional<FlightPrice> findByFlight_FlightIdAndTicketClass_ClassId(
            int flightId,
            int ticketClassId
    );

}
