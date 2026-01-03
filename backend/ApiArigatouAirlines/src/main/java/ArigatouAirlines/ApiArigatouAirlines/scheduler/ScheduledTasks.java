package ArigatouAirlines.ApiArigatouAirlines.scheduler;

import ArigatouAirlines.ApiArigatouAirlines.entity.Flight;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSeat;
import ArigatouAirlines.ApiArigatouAirlines.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ScheduledTasks {

    InvalidatedTokenRepository invalidatedTokenRepository;
    PasswordOtpRepository passwordOtpRepository;
    BookingRepository bookingRepository;
    TicketRepository ticketRepository;
    FlightSeatRepository flightSeatRepository;
    FlightRepository flightRepository;

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

    @Scheduled(fixedDelay = 2, timeUnit = TimeUnit.MINUTES)
    public void checkPaymentBooking() {
        LocalDateTime now = LocalDateTime.now();
        flightSeatRepository.releaseSeatsForExpiredBookings(now);
        ticketRepository.cancelTicketsForExpiredBookings(now);
        bookingRepository.checkPaymentBooking(now);
        log.info("Scheduled task: CHECK_PAYMENT_BOOKING");
    }

    @Scheduled(fixedDelay = 2, timeUnit = TimeUnit.MINUTES)
    public void checkFlight() {
        LocalDateTime now = LocalDateTime.now();
        flightRepository.checkFlight(now);
        log.info("Scheduled task: Check Flight");
    }
}