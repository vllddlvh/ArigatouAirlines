package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.UserResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostRequest {
    int userId;
    String title;
    String content;
}