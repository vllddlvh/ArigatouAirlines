package ArigatouAirlines.ApiArigatouAirlines.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:3000")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null) {
                    System.out.println("Command: " + accessor.getCommand());

                    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                        String userId = accessor.getFirstNativeHeader("userId");
                        System.out.println("UserId from header: " + userId);

                        if (userId != null && !userId.trim().isEmpty()) {
                            Principal userPrincipal = new Principal() {
                                @Override
                                public String getName() {
                                    return userId;
                                }

                                @Override
                                public String toString() {
                                    return "UserPrincipal{name='" + userId + "'}";
                                }
                            };

                            accessor.setUser(userPrincipal);
                            System.out.println("Principal set: " + userPrincipal);
                        } else {
                            System.out.println("UserId header is null or empty");
                        }
                    }

                    // Quan trọng: Đối với các message khác CONNECT,
                    // Principal đã được set trong session và sẽ được preserve
                    if (accessor.getUser() != null) {
                        System.out.println("Current principal: " + accessor.getUser().getName());
                    }
                }

                return message;
            }
        });
    }
}
