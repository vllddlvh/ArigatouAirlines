package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlightSeatRepository extends JpaRepository<FlightSeat, Integer> {
    List<FlightSeat> findAllByFlight_FlightId(int flightId);

    @Modifying
    @Transactional
    @Query("UPDATE FlightSeat fs SET fs.status = ArigatouAirlines.ApiArigatouAirlines.enums.StatusFlightSeat.Available " +
            "WHERE fs.flightSeatId IN ( " +
            "  SELECT t.flightSeat.flightSeatId FROM Ticket t " +
            "  WHERE t.booking.bookingId IN ( " +
            "    SELECT b.bookingId FROM Booking b " +
            "    WHERE b.paymentDeadline <= :now AND b.statusBooking = ArigatouAirlines.ApiArigatouAirlines.enums.StatusBooking.Pending" +
            "  ) " +
            ")")
    void releaseSeatsForExpiredBookings(@Param("now") LocalDateTime now);
}
