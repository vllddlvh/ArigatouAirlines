package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.entity.Role;
import ArigatouAirlines.ApiArigatouAirlines.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

import static lombok.AccessLevel.*;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@FieldDefaults(level = PRIVATE)
public class UserResponse {
    int userId;
    String email;
    String username;
    String fullName;
    // String phone;
    LocalDate dateOfBirth;
    Gender gender;
    String avatar;
    Set<Role> roles;
}