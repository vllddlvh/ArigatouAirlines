package ArigatouAirlines.ApiArigatouAirlines.service.chat;



import ArigatouAirlines.ApiArigatouAirlines.dto.request.chat.ChatMessageRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.chat.ChatMessageResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.chat.ChatSessionResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.chat.ContactResponse;

import java.util.List;
import java.util.UUID;

public interface ChatService {

    ChatSessionResponse getOrCreateSession(Integer userAId, Integer userBId);

    ChatSessionResponse createSession(Integer userAId, Integer userBId);

    ChatMessageResponse sendMessage(ChatMessageRequest request);

    List<ChatMessageResponse> getMessages(UUID sessionId);

    List<ContactResponse> getContacts(Integer currentUserId);


}

