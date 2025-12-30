package ArigatouAirlines.ApiArigatouAirlines.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity(name = "flight_price")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlightPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "price_id")
    int priceId;

    @ManyToOne
            @JoinColumn(name = "flight_id")
    Flight flight;

    @ManyToOne
    @JoinColumn(name = "class_id")
    TicketClass ticketClass;

    @Column(name = "base_price", precision = 10, scale = 2)
    BigDecimal basePrice;

    @Column(precision = 10, scale = 2)
    BigDecimal tax;

    @Column(name = "total_seats")
    int totalSeats;

    @Column(name = "available_seats")
    int availableSeats;
}
