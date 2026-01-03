package ArigatouAirlines.ApiArigatouAirlines.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;

import java.security.Principal;

/**
 * Alternative configuration nếu cách trên không work
 */
@Configuration
public class WebSocketAuthenticationConfig {

    public static class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

        @Override
        public Message<?> preSend(Message<?> message, MessageChannel channel) {
            StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

            if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                String userId = accessor.getFirstNativeHeader("userId");

                if (userId == null) {
                    userId = accessor.getFirstNativeHeader("login");
                }

                if (userId != null) {
                    String finalUserId = userId;
                    Principal principal = () -> finalUserId;
                    accessor.setUser(principal);
                } else {
                    System.out.println("No userId found in headers");
                    System.out.println("Available headers: " + accessor.toNativeHeaderMap());
                }
            }

            return message;
        }
    }
}
