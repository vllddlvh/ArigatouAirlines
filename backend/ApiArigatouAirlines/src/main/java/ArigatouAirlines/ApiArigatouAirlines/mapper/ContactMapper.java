package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.chat.ContactResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.ChatMessage;
import ArigatouAirlines.ApiArigatouAirlines.entity.ChatSession;
import ArigatouAirlines.ApiArigatouAirlines.entity.User;
import ArigatouAirlines.ApiArigatouAirlines.enums.MessageStatus;
import ArigatouAirlines.ApiArigatouAirlines.repository.ChatMessageRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ContactMapper {

    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;

    public ContactResponse toDto(ChatSession session, Integer currentUserId) {
        if (session == null) {
            throw new IllegalArgumentException("ChatSession is null");
        }

        User user1 = session.getUser1();
        User user2 = session.getUser2();

        if (user1 == null || user2 == null) {
            throw new IllegalStateException("ChatSession contains null users");
        }

        // Xác định người còn lại trong chat
        Integer otherUserId = (user1.getUserId() == currentUserId)
                ? user2.getUserId()
                : user1.getUserId();

        // Lấy thông tin người còn lại
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ContactResponse response = new ContactResponse();
        response.setId(session.getId().toString());
        response.setName(otherUser.getFullName() != null ? otherUser.getFullName() : otherUser.getUsername());
        response.setProfilePic(otherUser.getAvatar());

        // Lấy last message
        ChatMessage lastMessage = chatMessageRepository
                .findTopBySession_IdOrderByCreatedAtDesc(session.getId());
        if (lastMessage != null) {
            response.setLastMessage(lastMessage.getContent());
            response.setLastMessageTime(lastMessage.getCreatedAt());
        } else {
            response.setLastMessage("");
            response.setLastMessageTime(null);
        }

        // Số tin nhắn chưa đọc
        int unreadCount = chatMessageRepository.countBySession_IdAndReceiver_UserIdAndStatus(
                session.getId(), currentUserId, MessageStatus.SENT
        );
        response.setUnreadCount(unreadCount);

        // Online status
        boolean isOnline = (user1.getUserId() == otherUserId)
                ? session.isUser1Online()
                : session.isUser2Online();
        response.setIsOnline(isOnline);

        return response;
    }
}
