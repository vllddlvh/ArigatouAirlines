package ArigatouAirlines.ApiArigatouAirlines.dto.response.chat;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ContactResponse {
    private String id;
    private String name;
    private  String profilePic;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Integer unreadCount;
    private Boolean isOnline;
}
