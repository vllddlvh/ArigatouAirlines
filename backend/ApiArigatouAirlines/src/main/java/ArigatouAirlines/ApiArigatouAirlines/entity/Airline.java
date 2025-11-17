package ArigatouAirlines.ApiArigatouAirlines.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity(name = "airline")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Airline {
    @Id
    @Column(name = "airline_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int airlineId;

    @Column(name = "airline_code")
    @Size(max = 10)
    String airlineCode;

    @Column(name = "airline_name")
    String airlineName;

    String country;

    @Builder.Default
    @Column(name = "is_active", columnDefinition = "TINYINT(1) DEFAULT 1")
    boolean active = true;
}
