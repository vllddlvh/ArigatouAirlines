package ArigatouAirlines.ApiArigatouAirlines.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Entity(name = "aircraft_type")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AircraftType {
    @Id
    @Column(name = "aircraft_type_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int aircraftTypeId;

    @Column(name = "type_name")
    String typeName;

    @Column(name = "total_seats")
    int totalSeats;

    @OneToMany(
            mappedBy = "aircraftType",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    List<SeatMap> listSeatMap;

    @Column(name = "num_cols")
    int numCols;
}
