package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.TicketClassRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.TicketClassResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.TicketClass;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.TicketClassMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.TicketClassRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketClassService {
    TicketClassRepository ticketClassRepository;

    TicketClassMapper ticketClassMapper;

    public TicketClassResponse creationTicketClass(TicketClassRequest ticketClassRequest) {
        if(ticketClassRepository.existsByClassName(ticketClassRequest.getClassName())) {
            throw new AppException(ErrorCode.CLASS_NAME_IS_AVAILABLE);
        }
        TicketClass ticketClass = ticketClassMapper.toTicketClass(ticketClassRequest);
        ticketClassRepository.save(ticketClass);
        return  ticketClassMapper.toTicketClassResponse(ticketClass);
    }

    public List<TicketClassResponse> getAllTicketClasses() {
        return ticketClassRepository.findAll().stream().map(ticketClassMapper::toTicketClassResponse).toList();
    }

    public TicketClassResponse getTicketClass(int ticketClassId) {
        return ticketClassMapper.toTicketClassResponse(
                ticketClassRepository.findById(ticketClassId)
                        .orElseThrow()
        );
    }

    public TicketClassResponse updateTicketClass(int ticketClassId, TicketClassRequest ticketClassRequest) {
        TicketClass ticketClass = ticketClassRepository.findById(ticketClassId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_CLASS_ID_IS_NOT_AVAILABLE));

        if(ticketClassRepository.existsByClassName(ticketClassRequest.getClassName())) {
            throw new AppException(ErrorCode.CLASS_NAME_IS_AVAILABLE);
        }

        ticketClassMapper.updateTicketClass(ticketClassRequest, ticketClass);
        ticketClassRepository.save(ticketClass);

        return ticketClassMapper.toTicketClassResponse(ticketClass);
    }

    public String deleteTicketClass(int ticketClassId) {
        if(!ticketClassRepository.existsById(ticketClassId)) {
            throw new AppException(ErrorCode.TICKET_CLASS_ID_IS_NOT_AVAILABLE);
        }
        ticketClassRepository.deleteById(ticketClassId);

        return "Delete finish!";
    }
}
