package ArigatouAirlines.ApiArigatouAirlines.configuration;

import ArigatouAirlines.ApiArigatouAirlines.entity.Role;
import ArigatouAirlines.ApiArigatouAirlines.entity.TicketClass;
import ArigatouAirlines.ApiArigatouAirlines.entity.User;
import ArigatouAirlines.ApiArigatouAirlines.enums.Gender;
import ArigatouAirlines.ApiArigatouAirlines.repository.RoleRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.TicketClassRepository;
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
import java.util.Objects;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    TicketClassRepository ticketClassRepository;
    UserRepository userRepository;

    @Bean
    public ApplicationRunner applicationRunner() {
        return args -> {

            if (!ticketClassRepository.existsByClassName("ECONOMY")) {
                TicketClass economy = Objects.requireNonNull(TicketClass.builder()
                        .className("ECONOMY")
                        .baggageAllowanceKg(20)
                        .refundable(false)
                        .changeable(true)
                        .build());
                ticketClassRepository.save(economy);
            }
            if (!ticketClassRepository.existsByClassName("PREMIUM_ECONOMY")) {
                TicketClass premiumEconomy = Objects.requireNonNull(TicketClass.builder()
                        .className("PREMIUM_ECONOMY")
                        .baggageAllowanceKg(25)
                        .refundable(false)
                        .changeable(true)
                        .build());
                ticketClassRepository.save(premiumEconomy);
            }
            if (!ticketClassRepository.existsByClassName("BUSINESS")) {
                TicketClass business = Objects.requireNonNull(TicketClass.builder()
                        .className("BUSINESS")
                        .baggageAllowanceKg(30)
                        .refundable(true)
                        .changeable(true)
                        .build());
                ticketClassRepository.save(business);
            }

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


                var roles = new HashSet<Role>();
                roles.add(adminRole);
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

