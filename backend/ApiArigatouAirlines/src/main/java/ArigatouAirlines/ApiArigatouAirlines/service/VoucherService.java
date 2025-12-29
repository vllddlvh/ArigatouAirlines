package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.VoucherRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.VoucherResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Voucher;
import ArigatouAirlines.ApiArigatouAirlines.mapper.VoucherMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.VoucherRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class VoucherService {
    VoucherRepository voucherRepository;
    VoucherMapper voucherMapper;

    public VoucherResponse creationVoucher(VoucherRequest voucherRequest) {
        Voucher voucher = voucherMapper.toVoucher(voucherRequest);
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

        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại với id = " + voucherId));

        voucher.setDiscountType(voucherRequest.getDiscountType());
        voucher.setDiscountValue(voucherRequest.getDiscountValue());
        voucher.setMaxDiscountAmount(voucherRequest.getMaxDiscountAmount());
        voucher.setMinOrderAmount(voucherRequest.getMinOrderAmount());
        voucher.setUsageLimit(voucherRequest.getUsageLimit());


        Voucher saved = voucherRepository.save(voucher);

        return voucherMapper.toVoucherResponse(saved);
    }

    public String deleteVoucher(int voucherId) {
        voucherRepository.deleteById(voucherId);

        return "Delete Finish!";
    }
}
