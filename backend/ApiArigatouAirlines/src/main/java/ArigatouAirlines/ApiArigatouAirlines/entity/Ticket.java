package ArigatouAirlines.ApiArigatouAirlines.entity;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusTicket;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity(name = "ticket")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    int ticketId;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    Booking booking;

    @ManyToOne
    @JoinColumn(name = "flight_id")
    Flight flight;

    @OneToOne
    @JoinColumn(name = "passenger_id")
    Passenger passenger;

    @OneToOne
    @JoinColumn(name = "price_id")
    FlightPrice flightPrice;

    @OneToOne
    @JoinColumn(name = "flight_seat_id")
    FlightSeat flightSeat;

    @Column(name = "ticket_number")
    String ticketNumber;

    @Enumerated(EnumType.STRING)
    StatusTicket status;

    @PrePersist
    void prePersist() {
        if (ticketNumber == null || ticketNumber.isBlank()) {
            ticketNumber = UUID.randomUUID().toString();
        }
        if (status == null) {
            status = StatusTicket.Issued;
        }
    }
}
