package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.ChatMessage;
import ArigatouAirlines.ApiArigatouAirlines.dto.request.ChatbotRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ChatbotResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatbotService {

    @NonFinal
    @Value("${gemini.api-key:}")
    String geminiApiKey;

    @NonFinal
    @Value("${gemini.model:gemini-1.5-flash-latest}")
    String geminiModel;

    RestTemplate restTemplate = new RestTemplate();

    public ChatbotResponse chat(ChatbotRequest request) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new RuntimeException("Gemini API key is not configured");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + geminiModel + ":generateContent?key=" + geminiApiKey;

        List<Map<String, Object>> contents = new ArrayList<>();

        if (request.getHistory() != null) {
            for (ChatMessage msg : request.getHistory()) {
                if (msg.getText() == null || msg.getText().isBlank()) continue;
                contents.add(buildContent(msg.getRole(), msg.getText()));
            }
        }

        if (request.getMessage() != null && !request.getMessage().isBlank()) {
            contents.add(buildContent("user", request.getMessage()));
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", contents);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<GeminiGenerateContentResponse> response = restTemplate
                    .postForEntity(url, entity, GeminiGenerateContentResponse.class);

            if (response.getBody() == null
                    || response.getBody().getCandidates() == null
                    || response.getBody().getCandidates().isEmpty()) {
                return ChatbotResponse.builder()
                        .reply("Xin lỗi, mình chưa nhận được câu trả lời từ mô hình.")
                        .build();
            }

            GeminiGenerateContentResponse.Candidate candidate =
                    response.getBody().getCandidates().get(0);

            StringBuilder replyBuilder = new StringBuilder();
            if (candidate.getContent() != null && candidate.getContent().getParts() != null) {
                for (GeminiGenerateContentResponse.Part part : candidate.getContent().getParts()) {
                    if (part.getText() != null) {
                        replyBuilder.append(part.getText());
                    }
                }
            }

            String replyText = replyBuilder.length() > 0
                    ? replyBuilder.toString()
                    : "Xin lỗi, mình không thể tạo câu trả lời phù hợp.";

            return ChatbotResponse.builder()
                    .reply(replyText)
                    .build();
        } catch (RestClientException ex) {
            log.error("Lỗi khi gọi Gemini API", ex);
            throw new RuntimeException("Không thể kết nối tới Gemini API");
        }
    }

    private Map<String, Object> buildContent(String role, String text) {
        Map<String, Object> part = new HashMap<>();
        part.put("text", text);

        Map<String, Object> content = new HashMap<>();
        if (role != null && !role.isBlank()) {
            content.put("role", role);
        }
        content.put("parts", Collections.singletonList(part));
        return content;
    }

    @lombok.Data
    public static class GeminiGenerateContentResponse {
        List<Candidate> candidates;

        @lombok.Data
        public static class Candidate {
            Content content;
        }

        @lombok.Data
        public static class Content {
            List<Part> parts;
        }

        @lombok.Data
        public static class Part {
            String text;
        }
    }
}
