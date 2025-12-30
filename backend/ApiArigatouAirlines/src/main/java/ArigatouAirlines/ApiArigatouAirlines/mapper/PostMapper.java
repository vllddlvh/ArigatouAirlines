package ArigatouAirlines.ApiArigatouAirlines.mapper;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.PostRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.PostResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PostMapper {

    PostResponse toPostResponse(Post post);

    @Mapping(target = "user", ignore = true)
    Post toPost(PostRequest postRequest);

    @Mapping(target = "user", ignore = true)
    void updatePost(PostRequest postRequest, @MappingTarget Post post);
}
