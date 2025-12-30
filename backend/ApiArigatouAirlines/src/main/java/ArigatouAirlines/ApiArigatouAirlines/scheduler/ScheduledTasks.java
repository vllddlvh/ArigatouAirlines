package ArigatouAirlines.ApiArigatouAirlines.scheduler;

import ArigatouAirlines.ApiArigatouAirlines.repository.InvalidatedTokenRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.PasswordOtpRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ScheduledTasks {

    InvalidatedTokenRepository invalidatedTokenRepository;
    PasswordOtpRepository passwordOtpRepository;

    @Scheduled(fixedDelay = 5, timeUnit = TimeUnit.MINUTES)
    public void invalidatedTokenCleaning() {
        invalidatedTokenRepository.deleteAllByExpiryTime(new Date());
        log.info("Scheduled task: CLEANING_INVALIDATED_TOKEN");
    }


    @Scheduled(fixedDelay = 5, timeUnit = TimeUnit.MINUTES)
    public void passwordOtpCleaning() {
        passwordOtpRepository.deleteAllInvalid();
        log.info("Scheduled task: CLEANING_INVALID_PASSWORD_OTP");
    }
}
