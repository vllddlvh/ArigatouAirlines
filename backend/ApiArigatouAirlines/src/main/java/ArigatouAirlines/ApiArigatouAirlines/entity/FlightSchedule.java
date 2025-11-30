package ArigatouAirlines.ApiArigatouAirlines.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

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

    @Column(name = "aircraft_type")
    String aircraftType;

    @Column(name = "departure_city")
    String departureCity;

    @Column(name = "arrival_city")
    String arrivalCity;

    @Column(name = "departure_airport")
    String departureAirportCode;

    @Column(name = "arrival_airport")
    String arrivalAirportCode;

    @Column(name = "departure_time")
    LocalDateTime departureTime;

    @Column(name = "arrival_time")
    LocalDateTime arrivalTime;

    @Column(name = "base_price")
    Long basePrice;

    @Column(name = "duration_minutes")
    int durationMinutes;

    @Column(name = "status")
    String status;

    @Column(name = "is_active")
    boolean isActive;
}
