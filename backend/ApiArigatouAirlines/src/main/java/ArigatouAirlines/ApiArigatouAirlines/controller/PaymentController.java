package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.configuration.ConfigPayment;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.PaymentResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.TransactionResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.TransactionStatus;
import ArigatouAirlines.ApiArigatouAirlines.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;

    @GetMapping("/create_payment/{bookingId}")
    public ApiResponse<PaymentResponse> createPayment(HttpServletRequest request,@PathVariable int bookingId) {
        return ApiResponse.<PaymentResponse>builder()
                .body(paymentService.creationPayment(request, bookingId))
                .build();
    }

    @GetMapping("/payment_info")
    public ApiResponse<TransactionResponse> transaction(@RequestParam(value = "vnp_TxnRef") String paymentId,
                                                        @RequestParam(value = "vnp_Amount") String amount,
                                                        @RequestParam(value = "vnp_TransactionNo") String transactionId,
                                                        @RequestParam(value = "vnp_ResponseCode") String responseCode) {
        return ApiResponse.<TransactionResponse>builder()
                .body(paymentService.transaction(paymentId, amount, transactionId, responseCode))
                .build();
    }
}
