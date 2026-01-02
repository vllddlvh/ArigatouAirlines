package ArigatouAirlines.ApiArigatouAirlines.service.chat;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.chat.ChatMessageRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.chat.ChatMessageResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.chat.ChatSessionResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.chat.ContactResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.ChatMessage;
import ArigatouAirlines.ApiArigatouAirlines.entity.ChatSession;
import ArigatouAirlines.ApiArigatouAirlines.entity.User;
import ArigatouAirlines.ApiArigatouAirlines.enums.MessageStatus;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.ChatMessageMapper;
import ArigatouAirlines.ApiArigatouAirlines.mapper.ChatSessionMapper;
import ArigatouAirlines.ApiArigatouAirlines.mapper.ContactMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.ChatMessageRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.ChatSessionRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatSessionRepository chatSessionRepo;
    private final ChatMessageRepository chatMessageRepo;
    private final UserRepository userRepo;

    private final ChatMessageMapper chatMessageMapper;
    private final ChatSessionMapper chatSessionMapper;
    private final ContactMapper contactMapper;
    // ========================= SESSION =========================

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public ChatSessionResponse createSession(Integer userAId, Integer userBId) {

        ChatSession session = chatSessionRepo
                .findSessionBetween(userAId, userBId)
                .orElseGet(() -> {

                    User userA = userRepo.findById(userAId)
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

                    User userB = userRepo.findById(userBId)
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

                    ChatSession newSession = ChatSession.builder()
                            .user1(userA)
                            .user2(userB)
                            .build();

                    return chatSessionRepo.save(newSession);
                });

        return chatSessionMapper.toDto(session);
    }

    @Override
    @Transactional
    public ChatSessionResponse getOrCreateSession(Integer userAId, Integer userBId) {
        return createSession(userAId, userBId);
    }

    // ========================= MESSAGE =========================

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request) {

        ChatSession session = chatSessionRepo.findById(request.getSessionId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        User sender = userRepo.findById(request.getSenderId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        ChatMessage message = ChatMessage.builder()
                .session(session)
                .sender(sender)
                .content(request.getContent())
                .status(MessageStatus.SENT)
                .build();

        ChatMessage savedMessage = chatMessageRepo.save(message);

        session.setLastMessageAt(savedMessage.getCreatedAt());
        chatSessionRepo.save(session);

        // ----------------------
        // 1. gửi tin nhắn tới session topic
        ChatMessageResponse response = chatMessageMapper.toDto(savedMessage);
        messagingTemplate.convertAndSend("/topic/chat/" + session.getId(), response);

        List<Integer> userIds = List.of(session.getUser1().getUserId(), session.getUser2().getUserId());
        for (Integer userId : userIds) {
            ContactResponse contactUpdate = contactMapper.toDto(session, userId);
            messagingTemplate.convertAndSend("/topic/contacts/" + userId, contactUpdate);
        }
        // ----------------------

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(UUID sessionId) {

        ChatSession session = chatSessionRepo.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        return chatMessageRepo
                .findBySessionOrderByCreatedAtAsc(session)
                .stream()
                .map(chatMessageMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ContactResponse> getContacts(Integer currentUserId) {
        // lấy tất cả session mà user này tham gia
        List<ChatSession> sessions =
                chatSessionRepo.findByUser1UserIdOrUser2UserId(currentUserId,currentUserId);

        // map sang ContactResponse
        return sessions.stream()
                .map(session -> contactMapper.toDto(session, currentUserId))
                .toList();
    }
}
