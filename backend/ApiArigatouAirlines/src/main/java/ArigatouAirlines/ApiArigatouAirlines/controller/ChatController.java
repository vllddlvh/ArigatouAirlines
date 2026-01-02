package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.chat.ChatMessageRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.chat.ChatMessageResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.chat.ChatSessionResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.chat.ContactResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.chat.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

//    @PreAuthorize("#request.senderId == principal.id")
    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @Valid @RequestBody ChatMessageRequest request
    ) {
        ChatMessageResponse response = chatService.sendMessage(request);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Message sent", response)
        );
    }

//    @PreAuthorize("@chatSecurity.isUserInSession(#sessionId, principal.id)")
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(
            @PathVariable UUID sessionId
    ) {
        List<ChatMessageResponse> messages = chatService.getMessages(sessionId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Fetched messages", messages)
        );
    }

//    @PreAuthorize("#userAId == principal.id || #userBId == principal.id")
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<ChatSessionResponse>> getOrCreateSession(
            @RequestParam Integer userAId,
            @RequestParam Integer userBId
    ) {
        ChatSessionResponse session = chatService.getOrCreateSession(userAId, userBId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Session ready", session)
        );
    }



//    @PreAuthorize("#receiverId == principal.id")
    @PostMapping("/sessions/{sessionId}/mark-read")
    public ResponseEntity<ApiResponse<Void>> markMessagesAsRead(
            @PathVariable UUID sessionId,
            @RequestParam Integer receiverId
    ) {
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Messages marked as read", null)
        );
    }

    @GetMapping("/contacts")
    public ApiResponse<List<ContactResponse>> getContacts(@RequestParam Integer currentUserId) {
        List<ContactResponse> contacts = chatService.getContacts(currentUserId);
        return new ApiResponse<>(200, "OK", contacts);
    }

}
