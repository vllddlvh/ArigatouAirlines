package ArigatouAirlines.ApiArigatouAirlines.entity;

import ArigatouAirlines.ApiArigatouAirlines.converter.DiscountTypeConverter;
import ArigatouAirlines.ApiArigatouAirlines.enums.DiscountType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity(name = "voucher")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "voucher_id")
    int voucherId;

    @Column(name = "voucher_code")
    String voucherCode;

    @Column(name = "discount_type")
    @Convert(converter = DiscountTypeConverter.class)
    DiscountType discountType;

    @Column(name = "discount_value", precision = 10, scale = 2)
    BigDecimal discountValue;

    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    BigDecimal maxDiscountAmount;

    @Column(name = "min_order_amount", precision = 10, scale = 2)
    BigDecimal minOrderAmount;

    @Column(name = "usage_limit")
    int usageLimit;

    @Column(name = "used_count")
    int usedCount;

    @Column(name = "valid_from")
    LocalDateTime validFrom;

    @Column(name = "valid_to")
    LocalDateTime validTo;

    @Column(name = "is_active")
    Boolean isActive;
}
