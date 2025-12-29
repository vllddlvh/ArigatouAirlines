package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse implements Serializable {
    int paymentId;
    String status;
    String message;
    String URL;
}