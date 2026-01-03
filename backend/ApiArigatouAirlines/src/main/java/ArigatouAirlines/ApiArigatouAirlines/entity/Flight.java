package ArigatouAirlines.ApiArigatouAirlines.entity;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusFlight;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "flight")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Flight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "flight_id")
    int flightId;

    @ManyToOne
    @JoinColumn(name = "schedule_id")
    FlightSchedule schedule;

    @ManyToOne
    @JoinColumn(name = "aircraft_id")
    Aircraft aircraft;

    @Column(name = "flight_date")
    LocalDate flightDate;

    @Column(name = "departure_datetime")
    LocalDateTime departureDateTime;

    @Column(name = "arrival_datetime")
    LocalDateTime arrivalDateTime;

    @Column(name="status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    StatusFlight status = StatusFlight.Scheduled;
}
