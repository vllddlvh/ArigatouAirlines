package ArigatouAirlines.ApiArigatouAirlines.dto.response.chat;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.UserResponse;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class ChatSessionResponse {
    private String sessionId;
    private List<UserResponse> participants;
    private LocalDate createAt;
    private LocalDate lastActivity;
}
