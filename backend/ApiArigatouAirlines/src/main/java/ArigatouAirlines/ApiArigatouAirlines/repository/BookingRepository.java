package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findAllByUser_UserId(int userId);
    
    @Query("SELECT b FROM booking b LEFT JOIN FETCH b.user WHERE b.user.userId = :userId")
    List<Booking> findAllByUserIdWithUser(@Param("userId") int userId);
    
    @Query("SELECT b FROM booking b LEFT JOIN FETCH b.user")
    List<Booking> findAllWithUser();
}
