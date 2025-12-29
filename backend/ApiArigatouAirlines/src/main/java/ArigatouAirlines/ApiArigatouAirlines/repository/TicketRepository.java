package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    List<Ticket> findAllByBooking_BookingId(int bookingId);

    @Modifying
    @Transactional
    @Query("UPDATE Ticket t SET t.status = ArigatouAirlines.ApiArigatouAirlines.enums.StatusTicket.Cancelled " +
            "WHERE t.booking.paymentDeadline <= :now " +
            "AND t.booking.statusBooking = ArigatouAirlines.ApiArigatouAirlines.enums.StatusBooking.Pending " +
            "AND t.booking.statusPayment != ArigatouAirlines.ApiArigatouAirlines.enums.StatusPaymentBooking.Paid")
    public void cancelTicketsForExpiredBookings(@Param("now") LocalDateTime now);
}
