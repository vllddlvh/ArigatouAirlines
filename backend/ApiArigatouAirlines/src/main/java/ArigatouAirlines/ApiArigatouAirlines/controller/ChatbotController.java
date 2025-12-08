package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.ChatbotRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ChatbotResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.ChatbotService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatbotController {

    ChatbotService chatbotService;

    @PostMapping("/ask")
    public ApiResponse<ChatbotResponse> ask(@RequestBody ChatbotRequest request) {
        return ApiResponse.<ChatbotResponse>builder()
                .body(chatbotService.chat(request))
                .build();
    }
}
