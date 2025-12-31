package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AncillaryServiceRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AncillaryServiceResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.AncillaryService;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AncillaryServiceMapper {
    AncillaryService toAncillaryService(AncillaryServiceRequest ancillaryServiceRequest);

    AncillaryServiceResponse toAncillaryResponse(AncillaryService ancillaryService);
}
