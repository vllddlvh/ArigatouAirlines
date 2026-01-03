package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.ChatSession;
import ArigatouAirlines.ApiArigatouAirlines.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {

    Optional<ChatSession> findByUser1AndUser2(User user1, User user2);


    Optional<ChatSession> findByUser1UserIdAndUser2UserId(
            Integer user1Id,
            Integer user2Id
    );

    boolean existsByIdAndUser1UserId(UUID sessionId, Integer userId);

    boolean existsByIdAndUser2UserId(UUID sessionId, Integer userId);

    default Optional<ChatSession> findSessionBetween(Integer userAId, Integer userBId) {
        return findByUser1UserIdAndUser2UserId(userAId, userBId)
                .or(() -> findByUser1UserIdAndUser2UserId(userBId, userAId));
    }

    List<ChatSession> findByUser1UserIdOrUser2UserId(
            Integer user1Id,
            Integer user2Id
    );
}