package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AncillaryServiceRequest {
    String serviceName;

    String description;

    BigDecimal price;
}
