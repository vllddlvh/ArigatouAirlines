package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostResponse {
    int postId;
    UserResponse user;
    String title;
    String content;
    LocalDateTime createdAt;
}
