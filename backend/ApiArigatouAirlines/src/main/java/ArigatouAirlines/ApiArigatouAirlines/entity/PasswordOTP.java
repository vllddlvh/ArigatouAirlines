package ArigatouAirlines.ApiArigatouAirlines.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Entity
@Table(name = "password_otp")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PasswordOTP {
    @Id
    @JsonProperty("OTP")
    @Column(name = "otp")
    String OTP;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @NotNull
    @Column(name = "is_valid")
    boolean valid;

    @Column(name = "valid")
    Boolean validDb;

    @NotNull
    @Column(name = "expiry_time")
    Date expiryTime;

    @Column(name = "expiry_at")
    Date expiryAt;

    @PrePersist
    void prePersist() {
        if (validDb == null) {
            validDb = valid;
        }
        if (expiryAt == null && expiryTime != null) {
            expiryAt = expiryTime;
        }
        if (expiryTime == null && expiryAt != null) {
            expiryTime = expiryAt;
        }
    }
}