package ArigatouAirlines.ApiArigatouAirlines.entity;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusFlightSeat;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "flight_seat")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlightSeat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
            @Column(name = "flight_seat_id")
    int flightSeatId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    StatusFlightSeat status = StatusFlightSeat.Available;

    @ManyToOne
            @JoinColumn(name = "seat_map_id")
    SeatMap seatMap;

    @ManyToOne
            @JoinColumn(name = "flight_id")
    Flight flight;
}
