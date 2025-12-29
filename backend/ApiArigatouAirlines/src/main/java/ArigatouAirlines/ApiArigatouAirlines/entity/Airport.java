package ArigatouAirlines.ApiArigatouAirlines.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity(name = "airport")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Airport {
    @Id
            @Column(name = "airport_id")
            @GeneratedValue(strategy = GenerationType.IDENTITY)
    int airportId;

    @Column(name = "airport_code")
            @Size(max = 10)
    String airportCode;

    @Column(name = "airport_name")
    String airportName;

    String city;
    String country;
}
