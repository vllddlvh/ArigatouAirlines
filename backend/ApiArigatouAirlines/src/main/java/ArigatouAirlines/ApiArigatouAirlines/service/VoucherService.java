package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.VoucherValidateRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.request.VoucherRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.VoucherValidateResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.VoucherResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Voucher;
import ArigatouAirlines.ApiArigatouAirlines.enums.DiscountType;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.VoucherMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.VoucherRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class VoucherService {
    VoucherRepository voucherRepository;
    VoucherMapper voucherMapper;

    public VoucherResponse creationVoucher(VoucherRequest voucherRequest) {
        String code = String.valueOf(voucherRequest == null || voucherRequest.getVoucherCode() == null
                ? ""
                : voucherRequest.getVoucherCode()).trim();
        if (code.isBlank()) {
            throw new AppException(ErrorCode.VOUCHER_CODE_REQUIRED);
        }
        if (voucherRepository.findByVoucherCodeIgnoreCase(code).isPresent()) {
            throw new AppException(ErrorCode.VOUCHER_CODE_EXISTED);
        }

        Voucher voucher = voucherMapper.toVoucher(voucherRequest);
        voucher.setVoucherCode(code);
        if (voucher.getDiscountValue() == null) {
            voucher.setDiscountValue(BigDecimal.ZERO);
        }
        if (voucher.getMaxDiscountAmount() != null && voucher.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) < 0) {
            voucher.setMaxDiscountAmount(BigDecimal.ZERO);
        }
        if (voucher.getMinOrderAmount() == null) {
            voucher.setMinOrderAmount(BigDecimal.ZERO);
        }
        if (voucher.getUsageLimit() <= 0) {
            voucher.setUsageLimit(1);
        }
        if (voucher.getIsActive() == null) {
            voucher.setIsActive(true);
        }
        if (voucher.getValidFrom() == null) {
            voucher.setValidFrom(LocalDateTime.now());
        }
        if (voucher.getValidTo() == null) {
            voucher.setValidTo(voucher.getValidFrom().plusYears(10));
        }
        if (!voucher.getValidTo().isAfter(voucher.getValidFrom())) {
            voucher.setValidTo(voucher.getValidFrom().plusYears(10));
        }
        // Default for new voucher
        voucher.setUsedCount(0);
        voucherRepository.save(voucher);

        return voucherMapper.toVoucherResponse(voucher);
    }

    public List<VoucherResponse> getAllVoucher() {
        return voucherRepository.findAll().stream().map(voucherMapper :: toVoucherResponse).toList();
    }

    public VoucherResponse getVoucher(int voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId).orElseThrow();

        return voucherMapper.toVoucherResponse(voucher);
    }

    public VoucherResponse updateVoucher(int voucherId, VoucherRequest voucherRequest) {
        Voucher voucher = voucherRepository.findById(voucherId).orElseThrow();
        Voucher updated = voucherMapper.toVoucher(voucherRequest);
        updated.setVoucherId(voucherId);
        updated.setUsedCount(voucher.getUsedCount());

        if (updated.getDiscountValue() == null) {
            updated.setDiscountValue(voucher.getDiscountValue());
        }
        if (updated.getMinOrderAmount() == null) {
            updated.setMinOrderAmount(voucher.getMinOrderAmount());
        }
        if (updated.getUsageLimit() <= 0) {
            updated.setUsageLimit(voucher.getUsageLimit());
        }
        if (updated.getIsActive() == null) {
            updated.setIsActive(voucher.getIsActive());
        }
        if (updated.getValidFrom() == null) {
            updated.setValidFrom(voucher.getValidFrom());
        }
        if (updated.getValidTo() == null) {
            updated.setValidTo(voucher.getValidTo());
        }
        if (updated.getValidFrom() == null) {
            updated.setValidFrom(LocalDateTime.now());
        }
        if (updated.getValidTo() == null || !updated.getValidTo().isAfter(updated.getValidFrom())) {
            updated.setValidTo(updated.getValidFrom().plusYears(10));
        }
        voucherRepository.save(updated);

        return voucherMapper.toVoucherResponse(updated);
    }

    public String deleteVoucher(int voucherId) {
        voucherRepository.deleteById(voucherId);

        return "Delete Finish!";
    }

    public VoucherValidateResponse validateVoucher(VoucherValidateRequest request) {
        String code = String.valueOf(request.getVoucherCode() == null ? "" : request.getVoucherCode()).trim();
        if (code.isBlank()) {
            throw new AppException(ErrorCode.VOUCHER_CODE_REQUIRED);
        }

        BigDecimal orderAmount = request.getOrderAmount() == null ? BigDecimal.ZERO : request.getOrderAmount();
        Voucher voucher = voucherRepository.findByVoucherCodeIgnoreCase(code)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        BigDecimal discount = computeDiscountAmount(validateVoucherRules(voucher, orderAmount), orderAmount);
        BigDecimal finalAmount = orderAmount.subtract(discount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        return VoucherValidateResponse.builder()
                .voucherCode(voucher.getVoucherCode())
                .orderAmount(orderAmount)
                .discountAmount(discount)
                .finalAmount(finalAmount)
                .build();
    }

    public Voucher validateVoucherForApply(String voucherCode, BigDecimal orderAmount) {
        String code = String.valueOf(voucherCode == null ? "" : voucherCode).trim();
        if (code.isBlank()) {
            throw new AppException(ErrorCode.VOUCHER_CODE_REQUIRED);
        }

        BigDecimal amount = orderAmount == null ? BigDecimal.ZERO : orderAmount;
        Voucher voucher = voucherRepository.findByVoucherCodeForUpdate(code)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        return validateVoucherRules(voucher, amount);
    }

    public BigDecimal computeDiscountAmount(Voucher voucher, BigDecimal orderAmount) {
        BigDecimal amount = orderAmount == null ? BigDecimal.ZERO : orderAmount;
        if (voucher == null) return BigDecimal.ZERO;

        System.out.println("  [computeDiscountAmount] orderAmount: " + amount);
        System.out.println("  [computeDiscountAmount] discountType: " + voucher.getDiscountType());
        System.out.println("  [computeDiscountAmount] discountValue: " + voucher.getDiscountValue());
        System.out.println("  [computeDiscountAmount] maxDiscountAmount: " + voucher.getMaxDiscountAmount());

        BigDecimal discount;
        DiscountType type = voucher.getDiscountType();
        if (type == DiscountType.Percentage) {
            BigDecimal percent = voucher.getDiscountValue() == null ? BigDecimal.ZERO : voucher.getDiscountValue();
            discount = amount
                    .multiply(percent)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            System.out.println("  [computeDiscountAmount] Percentage calc: " + amount + " * " + percent + " / 100 = " + discount);
        } else {
            discount = voucher.getDiscountValue() == null ? BigDecimal.ZERO : voucher.getDiscountValue();
            System.out.println("  [computeDiscountAmount] Fixed amount: " + discount);
        }

        if (discount.compareTo(amount) > 0) {
            System.out.println("  [computeDiscountAmount] Capped by orderAmount: " + amount);
            discount = amount;
        }

        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            discount = BigDecimal.ZERO;
        }

        System.out.println("  [computeDiscountAmount] FINAL discount: " + discount);
        return discount;
    }

    private Voucher validateVoucherRules(Voucher voucher, BigDecimal orderAmount) {
        if (voucher == null) {
            throw new AppException(ErrorCode.VOUCHER_NOT_FOUND);
        }

        if (voucher.getIsActive() == null || !voucher.getIsActive()) {
            throw new AppException(ErrorCode.VOUCHER_INACTIVE);
        }

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getValidFrom() != null && now.isBefore(voucher.getValidFrom())) {
            throw new AppException(ErrorCode.VOUCHER_EXPIRED);
        }
        if (voucher.getValidTo() != null && now.isAfter(voucher.getValidTo())) {
            throw new AppException(ErrorCode.VOUCHER_EXPIRED);
        }

        BigDecimal min = voucher.getMinOrderAmount() == null ? BigDecimal.ZERO : voucher.getMinOrderAmount();
        if (orderAmount.compareTo(min) < 0) {
            throw new AppException(ErrorCode.VOUCHER_MIN_ORDER_NOT_MET);
        }

        if (voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new AppException(ErrorCode.VOUCHER_USAGE_LIMIT_REACHED);
        }

        return voucher;
    }
}
