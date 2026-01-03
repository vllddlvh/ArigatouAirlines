package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.Flight;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Integer> {
    @Modifying
    @Transactional
    @Query("""
    UPDATE Flight f
    SET f.status =
        CASE
            WHEN f.departureDateTime < :now AND f.arrivalDateTime > :now
                THEN 'On_Time'
            WHEN f.arrivalDateTime < :now
                THEN 'Arrived'
            ELSE f.status
        END
""")
    public void checkFlight(@Param("now") LocalDateTime now);
}
