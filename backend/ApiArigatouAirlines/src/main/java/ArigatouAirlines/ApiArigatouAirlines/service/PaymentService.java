package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.configuration.ConfigPayment;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.PaymentResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.TransactionResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.*;
import ArigatouAirlines.ApiArigatouAirlines.enums.*;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.PaymentMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    VoucherRepository voucherRepository;
    UserRepository userRepository;
    VoucherUsageRepository voucherUsageRepository;


    @Transactional
    public PaymentResponse creationPayment(HttpServletRequest request, int bookingId, Integer voucherId, String voucherCode) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_ID_IS_NOT_EXISTED));

        if(booking.getStatusBooking().equals(StatusBooking.Cancelled)) {
            throw new AppException(ErrorCode.BOOKING_WAS_CANCELLED);
        }

        BigDecimal amountBooking = booking.getTotalAmount();

        Voucher voucher = new Voucher();
        if(voucherId != null) {
            voucher = voucherRepository.findById(voucherId)
                    .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_ID_IS_NOT_EXISTED));
            if(voucher.getUsageLimit() == 0) {
                throw new AppException(ErrorCode.VOUCHER_WAS_USED_USAGE_LIMIT);
            }
            BigDecimal discountAmount = calAmountVoucher(voucher, amountBooking);
            amountBooking = amountBooking.subtract(discountAmount);

            var context = SecurityContextHolder.getContext();
            String username = context.getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
            VoucherUsage voucherUsage = VoucherUsage.builder()
                    .voucher(voucher)
                    .booking(booking)
                    .user(user)
                    .discountAmount(discountAmount)
                    .usedAt(LocalDateTime.now())
                    .build();
            voucher.setUsageLimit(voucher.getUsageLimit() - 1);
            if(voucher.getUsageLimit() == 0) {
                voucher.setIsActive(false);
            }
            voucherUsageRepository.save(voucherUsage);
            voucherRepository.save(voucher);
        } else if (voucherCode != null) {
            voucher = voucherRepository.findByVoucherCodeIgnoreCase(voucherCode)
                    .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_CODE_IS_NOT_EXISTED));

            if(voucher.getUsageLimit() == 0) {
                throw new AppException(ErrorCode.VOUCHER_WAS_USED_USAGE_LIMIT);
            }
            BigDecimal discountAmount = calAmountVoucher(voucher, amountBooking);
            amountBooking = amountBooking.subtract(discountAmount);

            var context = SecurityContextHolder.getContext();
            String username = context.getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
            VoucherUsage voucherUsage = VoucherUsage.builder()
                    .voucher(voucher)
                    .booking(booking)
                    .user(user)
                    .discountAmount(discountAmount)
                    .usedAt(LocalDateTime.now())
                    .build();
            voucher.setUsageLimit(voucher.getUsageLimit() - 1);
            voucher.setUsedCount(voucher.getUsedCount() + 1);
            if(voucher.getUsageLimit() == 0) {
                voucher.setIsActive(false);
            }
            voucherUsageRepository.save(voucherUsage);
            voucherRepository.save(voucher);
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(amountBooking)
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
                .multiply(BigDecimal.valueOf(100))
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
        payment.setAmount(
                new BigDecimal(amount)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
        );


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

    public static BigDecimal calAmountVoucher(Voucher voucher, BigDecimal amountBooking) {
        DiscountType discountType = voucher.getDiscountType();
        BigDecimal amount = BigDecimal.ZERO;
        BigDecimal maxDiscountAmount = voucher.getMaxDiscountAmount();
        if(amountBooking.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new AppException(ErrorCode.AMOUNT_BOOKING_MORE_THAN_MIN_ORDER_AMOUNT);
        }
        if(discountType.equals(DiscountType.Percentage)) {
            amount = amountBooking.multiply(voucher.getDiscountValue().divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
            if(amount.compareTo(maxDiscountAmount) > 0) {
                amount = maxDiscountAmount;
            }
        } else {
            amount = voucher.getDiscountValue();
        }
        return amount;
    }
}