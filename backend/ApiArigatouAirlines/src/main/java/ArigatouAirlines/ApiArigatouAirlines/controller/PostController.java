package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.PostRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.PostResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.PostService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/post")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PostController {
    PostService postService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<PostResponse> creationPost(@RequestBody PostRequest postRequest) {
        return ApiResponse.<PostResponse>builder()
                .body(postService.creationPost(postRequest))
                .build();
    }

    @GetMapping
    ApiResponse<List<PostResponse>> getAllPost() {
        return ApiResponse.<List<PostResponse>>builder()
                .body(postService.getAllPost())
                .build();
    }

    @GetMapping("/{postId}")
    ApiResponse<PostResponse> getPost(@PathVariable int postId) {
        return ApiResponse.<PostResponse>builder()
                .body(postService.getPost(postId))
                .build();
    }

    @PutMapping("/{postId}")
    ApiResponse<PostResponse> updatePost(@PathVariable int postId, @RequestBody PostRequest postRequest) {
        return ApiResponse.<PostResponse>builder()
                .body(postService.updatePost(postId, postRequest))
                .build();
    }

    @DeleteMapping("/{postId}")
    ApiResponse<String> deletePost(@PathVariable int postId) {
        return ApiResponse.<String>builder()
                .body(postService.deletePost(postId))
                .build();
    }
}
