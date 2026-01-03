package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSeat;
import ArigatouAirlines.ApiArigatouAirlines.enums.SeatClass;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusFlightSeat;
import jakarta.persistence.LockModeType;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlightSeatRepository extends JpaRepository<FlightSeat, Integer> {
    List<FlightSeat> findAllByFlight_FlightId(int flightId);

    long countByFlight_FlightId(int flightId);

    long countByFlight_FlightIdAndStatus(int flightId, StatusFlightSeat status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select fs from FlightSeat fs where fs.flight.flightId = ?1 and fs.status = ?2 order by fs.flightSeatId asc")
    List<FlightSeat> findAllByFlight_FlightIdAndStatusForUpdate(int flightId, StatusFlightSeat status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select fs from FlightSeat fs where fs.flight.flightId = ?1 and fs.status = ?2 and fs.seatMap.seatClass = ?3 order by fs.flightSeatId asc")
    List<FlightSeat> findAllByFlight_FlightIdAndStatusAndSeatClassForUpdate(int flightId, StatusFlightSeat status, SeatClass seatClass);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select fs from FlightSeat fs where fs.flight.flightId = ?1 and fs.status = ?2 and fs.seatMap.seatClass is null order by fs.flightSeatId asc")
    List<FlightSeat> findAllByFlight_FlightIdAndStatusAndNullSeatClassForUpdate(int flightId, StatusFlightSeat status);

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
