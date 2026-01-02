package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.response.chat.ChatMessageResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.ChatMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;



@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ChatMessageMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "session.id", target = "sessionId")
    @Mapping(source = "sender.userId", target = "senderId")
    @Mapping(source = "sender.username", target = "senderName")
    @Mapping(source = "content", target = "content")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "createdAt", target = "timestamp")
    ChatMessageResponse toDto(ChatMessage entity);
}
