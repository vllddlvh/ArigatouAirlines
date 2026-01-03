package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.entity.PasswordOTP;
import ArigatouAirlines.ApiArigatouAirlines.entity.User;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmailService {
    JavaMailSender mailSender;
    private final String SYSTEM_EMAIL_ADDRESS = "thanghuong272005@gmail.com";


    public void sendResetPasswordOtp(User user, PasswordOTP passwordOTP) throws MailException {
        String OTP = passwordOTP.getOTP();
        String resetLink = OTP;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setFrom(SYSTEM_EMAIL_ADDRESS);
        message.setSubject("Password Reset Token");
        message.setSentDate(new Date());
        message.setText("Hello " + user.getFullName() + "!\n"
                + "OTP to reset your password: " + resetLink + "\n"
                + "Keep it secret! Don't share to anyone!");

        mailSender.send(message);
    }
}
