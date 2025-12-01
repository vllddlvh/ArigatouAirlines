package ArigatouAirlines.ApiArigatouAirlines.entity;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Time;
import java.time.LocalTime;

@Entity(name = "flight_schedule")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlightSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    int scheduleId;

    @Column(name = "flight_number")
    @Size(max = 20)
    String flightNumber;

    @ManyToOne
            @JoinColumn(name = "airline_id")
    Airline airline;

    @ManyToOne
            @JoinColumn(name = "departure_airport_id")
    Airport departureAirport;

    @ManyToOne
    @JoinColumn(name = "arrival_airport_id")
    Airport arrivalAirport;

    @Column(name = "departure_time")
    LocalTime departureTime;

    @Column(name = "arrival_time")
    LocalTime arrivalTime;

    @Column(name = "duration_minutes")
    int durationMinutes;

    @Builder.Default
    @Column(name = "is_active", columnDefinition = "TINYINT(1) DEFAULT 1")
    boolean active = true;
}
