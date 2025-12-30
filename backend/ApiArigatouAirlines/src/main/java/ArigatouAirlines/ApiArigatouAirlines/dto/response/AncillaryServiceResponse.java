package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AncillaryServiceResponse {
    String serviceName;

    String description;

    BigDecimal price;
}
