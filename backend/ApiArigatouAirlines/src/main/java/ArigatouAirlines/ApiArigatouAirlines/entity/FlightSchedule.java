package ArigatouAirlines.ApiArigatouAirlines.entity;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Time;

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

    @OneToOne
            @JoinColumn(name = "airline_id")
    Airline airline;

    @OneToOne
            @JoinColumn(name = "departure_airport_id")
    Airport departureAirport;

    @OneToOne
    @JoinColumn(name = "arrival_airport_id")
    Airport arrivalAirport;

    @Column(name = "departure_time")
    Time departureTime;

    @Column(name = "arrival_time")
    Time arrivalTime;

    @Column(name = "duration_minutes")
    int durationMinutes;

    @Column(name = "is_active")
    boolean isActive;
}
