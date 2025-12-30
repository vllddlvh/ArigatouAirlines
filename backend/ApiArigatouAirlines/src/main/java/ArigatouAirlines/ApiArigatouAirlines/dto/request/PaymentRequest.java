package ArigatouAirlines.ApiArigatouAirlines.dto.request;

 import lombok.*;
 import lombok.experimental.FieldDefaults;

 @NoArgsConstructor
 @AllArgsConstructor
 @Data
 @Builder
 @FieldDefaults(level = AccessLevel.PRIVATE)
 public class PaymentRequest {
     String voucherCode;
 }
