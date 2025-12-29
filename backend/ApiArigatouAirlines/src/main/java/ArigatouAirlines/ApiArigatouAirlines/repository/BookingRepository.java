package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findAllByUser_UserId(int userId);
}
