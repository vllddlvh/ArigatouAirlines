package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.UserCreationRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.request.UserUpdateRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.UserResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.User;
import ArigatouAirlines.ApiArigatouAirlines.enums.Roles;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.UserMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.PasswordOtpRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.RoleRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    EmailService emailService;
    PasswordOtpRepository passwordTokenRepository;

    public UserResponse getById(int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        if (!user.isActive()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTS);
        }

        return userMapper.toUserResponse(user);
    }

    public UserResponse getByEmail(String email) {
        return userMapper.toUserResponse(userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS)));
    }

    public List<UserResponse> getAll() {
        List<User> users = userRepository.findAllByIsActiveTrue();
        return users.stream().map(userMapper::toUserResponse).toList();
    }


    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        User user = userRepository.findByUsernameAndIsActiveTrue(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        return userMapper.toUserResponse(user);
    }

//    public String testGetMyInfo() {
//        var context = SecurityContextHolder.getContext();
//        String id = context.getAuthentication().getName();
//        return id;
//    }

    public UserResponse create(UserCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        var roles = roleRepository.findAllById(List.of(Roles.USER.name()));
        user.setRoles(new HashSet<>(roles));
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse update(UserUpdateRequest request, int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        if (!user.isActive()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTS);
        }
        if (request.getPassword() != null)
            request.setPassword(passwordEncoder.encode(request.getPassword()));
        userMapper.UpdateUser(request, user);
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            var roles = roleRepository.findAllById(request.getRoles());
            if (roles.isEmpty())
                throw new AppException(ErrorCode.INVALID_ROLE);
            user.setRoles(new HashSet<>(roles));
        }
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public void delete(int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        if (!user.isActive()) {
            return;
        }

        user.setActive(false);
        userRepository.save(user);
    }

    public void deleteAll() {
        List<User> users = userRepository.findAllByIsActiveTrue();
        if (users.isEmpty()) {
            return;
        }
        for (User user : users) {
            user.setActive(false);
        }
        userRepository.saveAll((Iterable<User>) users);
    }


    public User resetPassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }
}

