package ArigatouAirlines.ApiArigatouAirlines.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity(name = "ancillary_service")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AncillaryService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    int serviceId;

    @Column(name = "Service_name")
    String serviceName;

    String description;

    @Column(precision = 10, scale = 2)
    BigDecimal price;
}
