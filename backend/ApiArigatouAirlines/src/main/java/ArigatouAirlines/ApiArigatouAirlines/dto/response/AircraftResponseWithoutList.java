package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusAircraft;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AircraftResponseWithoutList {
    int aircraftId;
    String registrationNumber;
    StatusAircraft statusAircraft;
    AircraftTypeResponseWithoutList aircraftType;
    AirlineResponse airline;
}