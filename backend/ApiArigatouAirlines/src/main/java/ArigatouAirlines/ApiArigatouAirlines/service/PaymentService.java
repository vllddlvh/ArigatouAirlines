package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.configuration.ConfigPayment;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.PaymentResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.TransactionResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Booking;
import ArigatouAirlines.ApiArigatouAirlines.entity.FlightSeat;
import ArigatouAirlines.ApiArigatouAirlines.entity.Payment;
import ArigatouAirlines.ApiArigatouAirlines.entity.Ticket;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusBooking;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusFlightSeat;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusPayment;
import ArigatouAirlines.ApiArigatouAirlines.enums.StatusPaymentBooking;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.PaymentMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.BookingRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.FlightSeatRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.PaymentRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.TicketRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PaymentService {
    PaymentRepository paymentRepository;
    BookingRepository bookingRepository;
    PaymentMapper paymentMapper;
    TicketRepository ticketRepository;
    FlightSeatRepository flightSeatRepository;

    @Transactional
    public PaymentResponse creationPayment(HttpServletRequest request, int bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_ID_IS_NOT_EXISTED));

        if(booking.getStatusBooking().equals(StatusBooking.Cancelled)) {
            throw new AppException(ErrorCode.BOOKING_WAS_CANCELLED);
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalAmount())
                .paymentMethod("NCB")
                .paymentStatus(StatusPayment.Pending)
                .paymentDate(LocalDateTime.now())
                .transactionId(UUID.randomUUID().toString().substring(0, 20))
                .build();

        String vnp_IpAddr = ConfigPayment.getIpAddress(request);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", ConfigPayment.vnp_Version);
        vnp_Params.put("vnp_Command", ConfigPayment.vnp_Command);
        vnp_Params.put("vnp_TmnCode", ConfigPayment.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", payment.getAmount()
                .multiply(BigDecimal.valueOf(1000))
                .toBigInteger()
                .toString());
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", payment.getPaymentMethod());
        vnp_Params.put("vnp_Locale", "vn");

        vnp_Params.put("vnp_TxnRef", payment.getTransactionId());
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + payment.getTransactionId());
        vnp_Params.put("vnp_OrderType", "other"); // hoặc "billpayment", "topup", ...

        vnp_Params.put("vnp_ReturnUrl", ConfigPayment.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        paymentRepository.save(payment);

        // Builing hash data and query string
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (Iterator<String> it = fieldNames.iterator(); it.hasNext(); ) {
            String fieldName = it.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append("=").append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                        .append("=")
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (it.hasNext()) {
                    hashData.append("&");
                    query.append("&");
                }
            }
        }

        String vnp_SecureHash = ConfigPayment.hmacSHA512(ConfigPayment.secretKey, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);
        String paymentUrl = ConfigPayment.vnp_PayUrl + "?" + query;

        PaymentResponse paymentResponse = new PaymentResponse();
        paymentResponse.setStatus("OK");
        paymentResponse.setMessage("Successfully");
        paymentResponse.setURL(paymentUrl);

        return paymentResponse;
    }

    @Transactional
    public TransactionResponse transaction(String paymentId, String amount, String transactionId, String responseCode) {
        Payment payment = paymentRepository.findPaymentByTransactionId(paymentId);
        payment.setTransactionId(transactionId);
        payment.setAmount(new BigDecimal(amount));

        Booking booking = bookingRepository.findById(payment.getBooking().getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_ID_IS_NOT_EXISTED));

        List<Ticket> ticketList = ticketRepository.findAllByBooking_BookingId(booking.getBookingId());
        if(responseCode.equals("00")) {
            payment.setPaymentStatus(StatusPayment.Success);
            payment.setPaymentDate(LocalDateTime.now());
            booking.setStatusBooking(StatusBooking.Confirmed);
            booking.setStatusPayment(StatusPaymentBooking.Paid);
            for(int i = 0; i < ticketList.size(); i++) {
                FlightSeat flightSeat = ticketList.get(i).getFlightSeat();
                flightSeat.setStatus(StatusFlightSeat.Booked);
                flightSeatRepository.save(flightSeat);
            }
        } else {
            payment.setPaymentStatus(StatusPayment.Failed);
            payment.setPaymentDate(LocalDateTime.now());
            booking.setStatusBooking(StatusBooking.Pending);
            booking.setStatusPayment(StatusPaymentBooking.Failed);
            for(int i = 0; i < ticketList.size(); i++) {
                FlightSeat flightSeat = ticketList.get(i).getFlightSeat();
                flightSeat.setStatus(StatusFlightSeat.Available);
                flightSeatRepository.save(flightSeat);
            }
        }
        paymentRepository.save(payment);
        bookingRepository.save(booking);

        return paymentMapper.toTransactionResponse(payment);
    }
}
