package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AircraftTypeResponse {
    int aircraftTypeId;
    String typeName;
    int totalSeats;
    int numCols;
    List<SeatMapResponse> listSeatMap;
}
