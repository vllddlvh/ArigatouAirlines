package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.chat.ChatMessageRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.chat.ChatMessageResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.chat.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    /**
     * Gửi tin nhắn đến topic chat theo sessionId
     */
    @MessageMapping("/chat/session/{sessionId}")
    public void sendMessage(
            @DestinationVariable String sessionId,
            ChatMessageRequest request,
            Principal principal
    ) {

        try {
            ChatMessageResponse response = chatService.sendMessage(request);

        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
