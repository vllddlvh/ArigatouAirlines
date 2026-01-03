package ArigatouAirlines.ApiArigatouAirlines.entity;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusPayment;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "payment")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    int paymentId;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    Booking booking;

    @Column(name = "amount", precision = 10, scale = 2)
    BigDecimal amount;

    @Column(name = "payment_method")
    String paymentMethod;

    @Column(name = "transaction_id")
    String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    StatusPayment paymentStatus;

    @Column(name = "payment_date")
    LocalDateTime paymentDate;
}