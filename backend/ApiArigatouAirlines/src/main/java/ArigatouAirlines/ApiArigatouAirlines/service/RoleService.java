package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.RoleRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.RoleResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Role;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.RoleMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.PermissionRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoleService {
    RoleRepository roleRepository;
    RoleMapper roleMapper;
    PermissionRepository permissionRepository;

    public RoleResponse create(RoleRequest request) {
        if (roleRepository.existsByRoleName(request.getRoleName()))
            throw new AppException(ErrorCode.ROLE_EXISTED);
        Role role = roleMapper.toRole(request);
        var permissions = permissionRepository.findAllByPermissionNameIn(request.getPermissions());
        role.setPermissions(new HashSet<>(permissions));
        role = roleRepository.save(role);
        return roleMapper.toRoleResponse(role);

    }

    public RoleResponse get(String name) {
        return roleMapper.toRoleResponse(roleRepository.findById(name)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_ROLE)));
    }

    public List<RoleResponse> getAll() {
        List<Role> roles = roleRepository.findAll();
        return roles.stream().map(roleMapper::toRoleResponse).toList();
    }

    public void delete(String name) {
        roleRepository.deleteById(name);
    }

    public void deleteAll() {
        roleRepository.deleteAll();
    }
}

