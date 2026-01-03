package ArigatouAirlines.ApiArigatouAirlines.mapper;


import ArigatouAirlines.ApiArigatouAirlines.dto.response.chat.ChatSessionResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.ChatSession;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface  ChatSessionMapper {
    @Mapping(source = "id", target = "sessionId")
    @Mapping(source = "createdAt", target = "createAt")
    @Mapping(source = "lastMessageAt", target = "lastActivity")
    ChatSessionResponse toDto(ChatSession session);

}