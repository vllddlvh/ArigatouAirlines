package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.VoucherValidateRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.request.VoucherRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.VoucherValidateResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.VoucherResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.VoucherService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vouchers")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class VoucherController {
    VoucherService voucherService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<VoucherResponse> creationVoucher(@RequestBody VoucherRequest voucherRequest) {
        return ApiResponse.<VoucherResponse>builder()
                .body(voucherService.creationVoucher(voucherRequest))
                .build();
    }

    @GetMapping
    ApiResponse<List<VoucherResponse>> getAllVouchers() {
        return ApiResponse.<List<VoucherResponse>>builder()
                .body(voucherService.getAllVoucher())
                .build();
    }

    @PostMapping("/validate")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    ApiResponse<VoucherValidateResponse> validateVoucher(@RequestBody VoucherValidateRequest request) {
        return ApiResponse.<VoucherValidateResponse>builder()
                .body(voucherService.validateVoucher(request))
                .build();
    }

    @GetMapping("/{id}")
            @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<VoucherResponse> getVoucher(@PathVariable int id) {
        return ApiResponse.<VoucherResponse>builder()
                .body(voucherService.getVoucher(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<VoucherResponse> updateVoucher(@PathVariable int id, @RequestBody VoucherRequest voucherRequest) {
        return ApiResponse.<VoucherResponse>builder()
                .body(voucherService.updateVoucher(id, voucherRequest))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<String> deleteVoucher(@PathVariable int id) {
        return ApiResponse.<String>builder()
                .body(voucherService.deleteVoucher(id))
                .build();
    }
}
