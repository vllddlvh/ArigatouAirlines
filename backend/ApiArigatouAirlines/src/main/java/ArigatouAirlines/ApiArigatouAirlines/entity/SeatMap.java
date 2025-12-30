package ArigatouAirlines.ApiArigatouAirlines.entity;

import ArigatouAirlines.ApiArigatouAirlines.enums.SeatClass;
import ArigatouAirlines.ApiArigatouAirlines.enums.SeatType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity(name = "seat_map")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatMap {
    @Id
    @Column(name = "seat_map_id")
            @GeneratedValue(strategy = GenerationType.IDENTITY)
    int seatMapId;

    @Column(name = "seat_number")
    String seatNumber;

    @Column(name = "seat_class")
    @Enumerated(EnumType.STRING)
    SeatClass seatClass;

    @Column(name = "seat_type")
    @Enumerated(EnumType.STRING)
    SeatType seatType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aircraft_type_id")
    AircraftType aircraftType;

    @Column(name = "visual_row")
    Integer visualRow;

    @Column(name = "visual_col")
    Integer visualCol;
}
