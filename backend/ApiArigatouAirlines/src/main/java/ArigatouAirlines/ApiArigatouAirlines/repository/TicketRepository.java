package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.Ticket;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusBooking;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    List<Ticket> findAllByBooking_BookingId(int bookingId);
    List<Ticket> findAllByFlight_FlightId(int flightId);

    long countByFlight_FlightIdAndStatusInAndBooking_StatusBookingNot(
            int flightId,
            List<StatusTicket> statuses,
            StatusBooking statusBooking
    );

    long countByFlight_FlightIdAndStatusInAndBooking_StatusBooking(
            int flightId,
            List<StatusTicket> statuses,
            StatusBooking statusBooking
    );

    long countByFlight_FlightIdAndStatusIn(
            int flightId,
            List<StatusTicket> statuses
    );

    @Query(
            value = "select count(*) from ticket t " +
                    "left join booking b on b.booking_id = t.booking_id " +
                    "where t.flight_id = ?1 " +
                    "and (t.status is null or upper(t.status) not in ('CANCELLED','REFUNDED')) " +
                    "and (b.booking_status is null or (upper(b.booking_status) <> 'CANCELLED' and b.booking_status <> '2'))",
            nativeQuery = true
    )
    long countSoldTicketsByFlightId(int flightId);
}
