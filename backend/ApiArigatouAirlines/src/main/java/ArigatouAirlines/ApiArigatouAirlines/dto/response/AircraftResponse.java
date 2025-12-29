package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusAircraft;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AircraftResponse {
    int aircraftId;
    String registrationNumber;
    StatusAircraft statusAircraft;
    AircraftTypeResponse aircraftType;
    AirlineResponse airline;
}
