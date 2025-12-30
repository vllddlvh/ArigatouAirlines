package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.VoucherUsageResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.VoucherUsageService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/voucherUsage")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class VoucherUsageController {
    VoucherUsageService voucherUsageService;

    @GetMapping
    ApiResponse<List<VoucherUsageResponse>> getMyVoucherUsage() {
        return ApiResponse.<List<VoucherUsageResponse>>builder()
                .body(voucherUsageService.myVoucherUsage())
                .build();
    }
}
