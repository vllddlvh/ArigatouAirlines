package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.Booking;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findAllByUser_UserId(int userId);
    
    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.user WHERE b.user.userId = :userId")
    List<Booking> findAllByUserIdWithUser(@Param("userId") int userId);
    
    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.user")
    List<Booking> findAllWithUser();

    @Transactional
    @Modifying
    @Query("UPDATE Booking b SET b.statusBooking = ArigatouAirlines.ApiArigatouAirlines.enums.StatusBooking.Cancelled " +
            "WHERE b.paymentDeadline <= :now " +
            "AND b.statusBooking = ArigatouAirlines.ApiArigatouAirlines.enums.StatusBooking.Pending " +
            "AND b.statusPayment != ArigatouAirlines.ApiArigatouAirlines.enums.StatusPaymentBooking.Paid")
    public void checkPaymentBooking(@Param("now") LocalDateTime now);
}
