package ArigatouAirlines.ApiArigatouAirlines.entity;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusBooking;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusPayment;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity(name = "booking")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    int bookingId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @Column(name = "booking_code")
            @GeneratedValue(strategy = GenerationType.UUID)
    String bookingCode;

    @Column(name = "booking_status")
    StatusBooking statusBooking;

    @Column(name = "payment_status")
    StatusPayment statusPayment;

    @Column(name = "total_amount", precision = 10, scale = 2)
    BigDecimal totalAmount;

    @Column(name = "payment_deadline")
    LocalDateTime paymentDeadline;

    @Column(name = "created_at")
    Instant createdAt;
}
