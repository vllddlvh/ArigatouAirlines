package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.PostRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.PostResponse;
import ArigatouAirlines.ApiArigatouAirlines.entity.Post;
import ArigatouAirlines.ApiArigatouAirlines.entity.User;
import ArigatouAirlines.ApiArigatouAirlines.exception.AppException;
import ArigatouAirlines.ApiArigatouAirlines.exception.ErrorCode;
import ArigatouAirlines.ApiArigatouAirlines.mapper.PostMapper;
import ArigatouAirlines.ApiArigatouAirlines.repository.PostRepository;
import ArigatouAirlines.ApiArigatouAirlines.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostService {
    PostRepository postRepository;
    PostMapper postMapper;
    UserRepository userRepository;

    public PostResponse creationPost(PostRequest postRequest) {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        Post post = postMapper.toPost(postRequest);
        post.setUser(user);
        postRepository.save(post);

        return postMapper.toPostResponse(post);
    }

    public List<PostResponse> getAllPost() {
        return postRepository.findAll().stream().map(postMapper :: toPostResponse).toList();
    }

    public PostResponse getPost(int postId) {
        return postMapper.toPostResponse(postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POSTID_IS_NOT_EXISTED)));
    }

    public PostResponse updatePost(int postId, PostRequest postRequest) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        postMapper.updatePost(postRequest, post);

        return postMapper.toPostResponse(post);
    }

    public String deletePost(int postId) {
        if(postRepository.existsById(postId)) {
            postRepository.deleteById(postId);
            return "Delete finish!";
        }
        return "Delete fail!";
    }
}
