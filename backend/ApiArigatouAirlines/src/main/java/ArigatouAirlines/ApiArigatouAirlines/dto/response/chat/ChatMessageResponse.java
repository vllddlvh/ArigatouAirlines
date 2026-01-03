package ArigatouAirlines.ApiArigatouAirlines.dto.response.chat;

import ArigatouAirlines.ApiArigatouAirlines.enums.MessageStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessageResponse {

    private String id;
    private String sessionId;
    private String senderId;
    private String senderName;
    private String receiverId;
    private String content;
    private MessageStatus status;
    private LocalDateTime timestamp;

}
