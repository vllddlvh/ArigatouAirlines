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

import java.time.LocalDate;
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
        return userMapper.toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS)));
    }

    public UserResponse getByEmail(String email) {
        return userMapper.toUserResponse(userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS)));
    }

    public List<UserResponse> getAll() {
        List<User> users = userRepository.findAll();
        return users.stream().map(userMapper::toUserResponse).toList();
    }


    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
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
        // if(userRepository.existsByPhone(request.getPhone())) {
        //     throw new AppException(ErrorCode.PHONE_EXISTED);
        // }
        if(request.getEmail().compareTo("") == 0) {
            throw new AppException(ErrorCode.INVALID_EMAIL);
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

        // Validate Email
        if (request.getEmail() != null) {
            String email = request.getEmail().trim();
            request.setEmail(email);
            if (email.isEmpty()) {
                throw new AppException(ErrorCode.INVALID_EMAIL);
            }
            String currentEmail = user.getEmail() == null ? null : user.getEmail().trim();
            boolean sameEmail = currentEmail != null && currentEmail.equalsIgnoreCase(email);

            if (userRepository.existsByEmail(email) && !sameEmail) {
                throw new AppException(ErrorCode.EMAIL_EXISTED);
            }
        }

        // Validate Phone
        // if (request.getPhone() != null) {
        //     if (userRepository.existsByPhone(request.getPhone()) &&
        //             !user.getPhone().equals(request.getPhone())) {
        //         throw new AppException(ErrorCode.PHONE_EXISTED);
        //     }
        // }

        // Validate Date of Birth
        if (request.getDateOfBirth() != null) {
            if (request.getDateOfBirth().isAfter(LocalDate.now())) {
                throw new AppException(ErrorCode.DOB_IS_THE_PAST);
            }
        }

        // Validate Password
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            request.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Validate Roles - User không được tự update role
        var context = SecurityContextHolder.getContext();
        boolean isAdmin = context.getAuthentication().getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        System.out.println(isAdmin);
        System.out.println(request.getRoles());
        if (request.getRoles() != null && !isAdmin) {
            throw new AppException(ErrorCode.USER_CANNOT_UPDATE_ROLE);
        }

        userMapper.UpdateUser(request, user);
        return userMapper.toUserResponse(userRepository.save(user));
    }


    public void delete(int id) {
        if (!userRepository.existsById(id))
            throw new AppException(ErrorCode.USER_NOT_EXISTS);
        userRepository.deleteById(id);
    }

    public void deleteAll() {
        userRepository.deleteAll();
    }


    public User resetPassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }
}