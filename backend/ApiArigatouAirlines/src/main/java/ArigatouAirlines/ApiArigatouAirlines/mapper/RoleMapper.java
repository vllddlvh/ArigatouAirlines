package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.RoleRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.RoleResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Permission;
import ArigatouAirlines.ApiArigatouAirlines.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    @Mapping(target = "permissions", qualifiedByName = "mapPermissions")
    RoleResponse toRoleResponse(Role role);

    @Named("mapPermissions")
    default Set<String> mapPermissions(Set<Permission> permissions) {
        if (permissions == null) {
            return null;
        }
        return permissions.stream().map(Permission::getPermissionName).collect(Collectors.toSet());
    }
}