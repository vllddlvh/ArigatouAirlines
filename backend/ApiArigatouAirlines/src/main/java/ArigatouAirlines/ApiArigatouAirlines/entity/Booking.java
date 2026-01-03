package ArigatouAirlines.ApiArigatouAirlines.entity;

import ArigatouAirlines.ApiArigatouAirlines.converter.StatusBookingConverter;
import ArigatouAirlines.ApiArigatouAirlines.converter.StatusPaymentConverter;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusBooking;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusPayment;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusPaymentBooking;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "booking")
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    User user;

    @Column(name = "booking_code")
    String bookingCode;

    @Column(name = "booking_status")
    @Enumerated(EnumType.STRING)
    StatusBooking statusBooking;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    StatusPaymentBooking statusPayment;

    @Column(name = "total_amount", precision = 10, scale = 2)
    BigDecimal totalAmount;

    @Column(name = "payment_deadline")
    LocalDateTime paymentDeadline;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (bookingCode == null || bookingCode.isBlank()) {
            bookingCode = UUID.randomUUID().toString().substring(0, 20);
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
