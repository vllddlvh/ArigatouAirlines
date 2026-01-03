package ArigatouAirlines.ApiArigatouAirlines.repository;


import ArigatouAirlines.ApiArigatouAirlines.entity.ChatMessage;
import ArigatouAirlines.ApiArigatouAirlines.entity.ChatSession;
import ArigatouAirlines.ApiArigatouAirlines.enums.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findBySessionOrderByCreatedAtAsc(ChatSession session);

    long countBySessionAndStatus(ChatSession session, MessageStatus status);


    ChatMessage findTopBySession_IdOrderByCreatedAtDesc(UUID sessionId);

    int countBySession_IdAndReceiver_UserIdAndStatus(UUID sessionId, Integer receiverId, MessageStatus status);

}
