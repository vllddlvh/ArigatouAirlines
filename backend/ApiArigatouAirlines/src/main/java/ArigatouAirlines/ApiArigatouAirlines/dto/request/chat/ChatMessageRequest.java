package ArigatouAirlines.ApiArigatouAirlines.dto.request.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ChatMessageRequest {

    @NotNull(message = "Sender ID is required")
    private Integer senderId;

    @NotNull(message = "Session Id must not be blank")
    private UUID sessionId;

    @NotBlank(message = "Message content must not be blank")
    private String content;


}
