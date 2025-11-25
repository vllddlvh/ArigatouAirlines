package ArigatouAirlines.ApiArigatouAirlines.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AircraftTypeResponseWithoutList {
    String typeName;
    int totalSeats;
    int numCols;
}
