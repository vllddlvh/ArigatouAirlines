package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.SeatMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface SeatMapRepository extends JpaRepository<SeatMap, Integer> {

    List<SeatMap> findAllByAircraftType_AircraftTypeId(int aircraftTypeId);
}
