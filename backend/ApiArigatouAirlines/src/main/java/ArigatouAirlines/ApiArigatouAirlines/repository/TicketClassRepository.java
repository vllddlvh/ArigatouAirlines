package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.TicketClass;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketClassRepository extends JpaRepository<TicketClass, Integer> {
}
