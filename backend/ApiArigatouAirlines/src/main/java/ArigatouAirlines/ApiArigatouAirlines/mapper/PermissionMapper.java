package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.PermissionRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.PermissionResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
