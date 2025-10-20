package ArigatouAirlines.ApiArigatouAirlines.configuration;

import ArigatouAirlines.ApiArigatouAirlines.entity.Role;
import ArigatouAirlines.ApiArigatouAirlines.entity.User;
import ArigatouAirlines.ApiArigatouAirlines.enums.Gender;
import ArigatouAirlines.ApiArigatouAirlines.enums.Roles;
import ArigatouAirlines.ApiArigatouAirlines.repository.RoleRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;

    @Bean
    public ApplicationRunner applicationRunner(UserRepository userRepository) {
        return args -> {

            if (!userRepository.existsByUsername("admin")) {

                Role adminRole = Role.builder()
                        .roleName("ADMIN")
                        .description("Admin role")
                        .build();
                Role userRole = Role.builder()
                        .roleName("USER")
                        .description("User role")
                        .build();
                roleRepository.save(adminRole);
                roleRepository.save(userRole);


                var roles = new HashSet<>(roleRepository.findAllById(List.of(Roles.ADMIN.name())));
                User user = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .gender(Gender.Male)
                        .roles(roles)
                        .phone("000000000")
                        .email("dllv@gmail.com")
                        .fullName("Dao Le Long Vu")
                        .dateOfBirth(LocalDate.parse("2005-09-06"))
                        .build();
                userRepository.save(user);
                log.info("admin account has been created with default password: admin!");
            }
        };
    }


}

