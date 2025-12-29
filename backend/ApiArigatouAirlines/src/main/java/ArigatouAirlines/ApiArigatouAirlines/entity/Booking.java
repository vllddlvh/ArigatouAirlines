package ArigatouAirlines.ApiArigatouAirlines.entity;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusBooking;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusPayment;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

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

    @PrePersist
    void prePersist() {
        if (bookingCode == null || bookingCode.isBlank()) {
            bookingCode = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
