package ArigatouAirlines.ApiArigatouAirlines.dto.request;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusAircraft;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AircraftRequest {
    String registrationNumber;
    StatusAircraft statusAircraft;
    int aircraftTypeId;
    int airlineId;
}
