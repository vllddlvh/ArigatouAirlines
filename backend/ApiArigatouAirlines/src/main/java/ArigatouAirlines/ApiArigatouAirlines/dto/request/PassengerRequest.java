package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import ArigatouAirlines.ApiArigatouAirlines.enums.Gender;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PassengerRequest {
    String fullName;

    LocalDate dateOfBirth;

    Gender gender;

    String nationality;
}
