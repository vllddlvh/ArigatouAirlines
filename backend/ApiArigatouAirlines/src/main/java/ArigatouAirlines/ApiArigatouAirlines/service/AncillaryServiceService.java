package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.AncillaryServiceRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.AncillaryServiceResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.AncillaryService;
import ArigatouAirlines.ApiArigatouAirlines.mapper.AncillaryServiceMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.AncillaryServiceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AncillaryServiceService {
    AncillaryServiceMapper ancillaryServiceMapper;

    AncillaryServiceRepository ancillaryServiceRepository;

    public AncillaryServiceResponse creationAncillaryService(AncillaryServiceRequest ancillaryServiceRequest) {
        AncillaryService ancillaryService = ancillaryServiceMapper.toAncillaryService(ancillaryServiceRequest);
        ancillaryServiceRepository.save(ancillaryService);

        return ancillaryServiceMapper.toAncillaryResponse(ancillaryService);
    }

    public List<AncillaryServiceResponse> getAllAncillaryService() {
        return ancillaryServiceRepository.findAll().stream().map(ancillaryServiceMapper::toAncillaryResponse).toList();
    }

    public AncillaryServiceResponse getAncillaryService(int ancillaryServiceId) {
        return ancillaryServiceMapper.toAncillaryResponse(
                ancillaryServiceRepository.findById(ancillaryServiceId).orElseThrow());
    }

    public AncillaryServiceResponse updateAncillaryService(int id, AncillaryServiceRequest ancillaryServiceRequest) {
        AncillaryService ancillaryService = ancillaryServiceRepository.findById(id).orElseThrow();
        ancillaryService = ancillaryServiceMapper.toAncillaryService(ancillaryServiceRequest);
        ancillaryServiceRepository.save(ancillaryService);

        return ancillaryServiceMapper.toAncillaryResponse(ancillaryService);
    }

    public String deleteAncillaryService(int id) {
        ancillaryServiceRepository.deleteById(id);
        return "Delete Finish!";
    }
}
