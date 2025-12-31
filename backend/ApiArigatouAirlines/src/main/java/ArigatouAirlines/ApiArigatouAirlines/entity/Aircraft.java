package ArigatouAirlines.ApiArigatouAirlines.entity;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusAircraft;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity(name = "aircraft")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Aircraft {
    @Id
            @Column(name = "aircraft_id")
            @GeneratedValue(strategy = GenerationType.IDENTITY)
    int aircraftId;

    @Column(name = "registration_number")
    String registrationNumber;

    @Enumerated(EnumType.STRING)
            @Column(name = "status")
    StatusAircraft statusAircraft;

    @ManyToOne
    @JoinColumn(name = "aircraft_type_id")
    AircraftType aircraftType;

    @ManyToOne
    @JoinColumn(name = "airline_id")
    Airline airline;
}
