package ArigatouAirlines.ApiArigatouAirlines.controller;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.UserCreationRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.request.UserUpdateRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ApiResponse;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.UserResponse;
import ArigatouAirlines.ApiArigatouAirlines.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class UserController {

    UserService userService;

    @PostMapping("/sign-up")
    public ApiResponse<UserResponse> create(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .body(userService.create(request))
                .build();
    }

    @GetMapping("/myInfo")
    public ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .body(userService.getMyInfo())
                .build();
    }

//    @GetMapping("/testMyInfo")
//    public String testMyInfo() {
//        return userService.testGetMyInfo();
//    }

    @GetMapping()
    @PostAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserResponse>> getAll() {
        return ApiResponse.<List<UserResponse>>builder()
                .body(userService.getAll())
                .build();
    }

    @GetMapping("/{userId}")
    @PostAuthorize("hasRole('ADMIN') || returnObject.body.username == authentication.name")
    public ApiResponse<UserResponse> get(@PathVariable("userId") int id) {
        return ApiResponse.<UserResponse>builder()
                .body(userService.getById(id))
                .build();
    }

    @PutMapping("/{userId}")
    @PostAuthorize("hasRole('ADMIN') || returnObject.body.username == authentication.name")
    public ApiResponse<UserResponse> update(@RequestBody @Valid UserUpdateRequest request, @PathVariable("userId") int id) {
        return ApiResponse.<UserResponse>builder()
                .body(userService.update(request, id))
                .build();
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable("userId") int id) {
        userService.delete(id);
        return new ApiResponse<>();
    }

    @DeleteMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteALl() {
        userService.deleteAll();
        return new ApiResponse<>();
    }
}
