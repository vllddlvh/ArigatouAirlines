package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import ArigatouAirlines.ApiArigatouAirlines.enums.Gender;

import java.time.LocalDate;

import ArigatouAirlines.ApiArigatouAirlines.validator.UniqueEmail;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    @NotNull(message = "EMAIL_IS_NULL")
    @Email(message = "INVALID_EMAIL")
    @UniqueEmail(message = "EMAIL_EXISTED")
    String email;

    @Size(min = 6, max = 20, message = "INVALID_USERNAME")
    @NotNull(message = "USERNAME_IS_NULL")
    String username;

    @Size(min = 8, message = "INVALID_PASSWORD")
    @NotNull(message = "PASSWORD_IS_NULL")
    String password;

    @NotNull(message = "FULLNAME_IS_NULL")
    String fullName;

    @NotNull(message = "PHONE_NULL")
    String phone;

    @NotNull(message = "DOB_IS_NULL")
    LocalDate dateOfBirth;

    @NotNull(message = "GENDER_NULL")
    Gender gender;

    String avatar = "default avatar";
}
