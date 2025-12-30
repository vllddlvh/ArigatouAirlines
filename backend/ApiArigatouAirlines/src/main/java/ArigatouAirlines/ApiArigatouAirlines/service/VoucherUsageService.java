package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.UserResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.VoucherUsageResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.User;
import ArigatouAirlines.ApiArigatouAirlines.entity.VoucherUsage;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.VoucherUsageMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.UserRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.VoucherRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.VoucherUsageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class VoucherUsageService {
    VoucherUsageRepository voucherUsageRepository;
    VoucherUsageMapper voucherUsageMapper;
    UserRepository userRepository;

    public List<VoucherUsageResponse> myVoucherUsage() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        List<VoucherUsage> voucherUsageList = voucherUsageRepository.getAllByUser(user);

        return voucherUsageList.stream().map(voucherUsageMapper :: toVoucherUsageResponse).toList();
    }
}
