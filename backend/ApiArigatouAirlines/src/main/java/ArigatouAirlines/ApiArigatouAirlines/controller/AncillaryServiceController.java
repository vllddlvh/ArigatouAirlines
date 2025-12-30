package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AncillaryServiceRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AncillaryServiceResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.AncillaryService;
import ArigatouAirlines.ApiArigatouAirlines.service.AncillaryServiceService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/ancillaryService")
public class AncillaryServiceController {
    AncillaryServiceService ancillaryServiceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<AncillaryServiceResponse> creationAncillaryService(@RequestBody AncillaryServiceRequest ancillaryServiceRequest) {
        return ApiResponse.<AncillaryServiceResponse>builder()
                .body(ancillaryServiceService.creationAncillaryService(ancillaryServiceRequest))
                .build();
    }

    @GetMapping
    ApiResponse<List<AncillaryServiceResponse>> getAllAncillaryService() {
        return ApiResponse.<List<AncillaryServiceResponse>>builder()
                .body(ancillaryServiceService.getAllAncillaryService())
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<AncillaryServiceResponse> getAncillaryService(@PathVariable int id) {
        return ApiResponse.<AncillaryServiceResponse>builder()
                .body(ancillaryServiceService.getAncillaryService(id))
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    ApiResponse<AncillaryServiceResponse> updateAncillaryService(@PathVariable int id, @RequestBody AncillaryServiceRequest ancillaryServiceRequest) {
        return ApiResponse.<AncillaryServiceResponse>builder()
                .body(ancillaryServiceService.updateAncillaryService(id, ancillaryServiceRequest))
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    ApiResponse<String> deleteAncillaryService(@PathVariable int id) {
        return ApiResponse.<String>builder()
                .body(ancillaryServiceService.deleteAncillaryService(id))
                .build();
    }
}
