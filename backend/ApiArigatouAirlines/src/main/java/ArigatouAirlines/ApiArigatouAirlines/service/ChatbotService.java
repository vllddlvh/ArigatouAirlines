package ArigatouAirlines.ApiArigatouAirlines.service;

import ArigatouAirlines.ApiArigatouAirlines.dto.request.ChatbotRequest;
import ArigatouAirlines.ApiArigatouAirlines.dto.response.ChatbotResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatbotService {

    public ChatbotResponse processMessage(ChatbotRequest request) {
        String userMessage = request.getMessage();
        log.info("Processing chatbot message: {}", userMessage);
        
        String response = generateResponse(userMessage);
        
        return ChatbotResponse.builder()
                .response(response)
                .build();
    }
    
    private String generateResponse(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "Xin chào! Tôi có thể giúp gì cho bạn?";
        }
        
        String lowerMessage = message.toLowerCase().trim();
        
        if (lowerMessage.contains("chào") || lowerMessage.contains("hello") || lowerMessage.contains("hi")) {
            return "Xin chào! Tôi là trợ lý ảo của Arigatou Airlines. Tôi có thể giúp bạn về thông tin chuyến bay, đặt vé, check-in và các dịch vụ khác. Bạn cần hỗ trợ gì?";
        }
        
        if (lowerMessage.contains("check-in") || lowerMessage.contains("check in") || lowerMessage.contains("làm thủ tục")) {
            return "Để check-in, bạn cần:\n1. Mã đặt chỗ (booking code)\n2. Email đã đặt vé\n\nBạn có thể check-in trực tuyến từ 24 giờ đến 1 giờ trước giờ khởi hành. Bạn có muốn tôi hướng dẫn chi tiết không?";
        }
        
        if (lowerMessage.contains("đặt vé") || lowerMessage.contains("book") || lowerMessage.contains("mua vé")) {
            return "Để đặt vé máy bay, bạn cần:\n1. Chọn điểm đi và điểm đến\n2. Chọn ngày bay\n3. Chọn số lượng hành khách\n4. Điền thông tin hành khách\n5. Thanh toán\n\nBạn có thể đặt vé trực tiếp trên website của chúng tôi. Bạn cần hỗ trợ gì thêm không?";
        }
        
        if (lowerMessage.contains("hành lý") || lowerMessage.contains("baggage") || lowerMessage.contains("luggage")) {
            return "Quy định hành lý:\n- Hành lý xách tay: 7kg (1 kiện)\n- Hành lý ký gửi: 20kg (hạng phổ thông), 30kg (hạng thương gia)\n- Vật phẩm cấm: chất lỏng >100ml, vật sắc nhọn, chất dễ cháy nổ\n\nBạn cần biết thêm thông tin gì về hành lý?";
        }
        
        if (lowerMessage.contains("giá vé") || lowerMessage.contains("price") || lowerMessage.contains("cost")) {
            return "Giá vé phụ thuộc vào:\n- Tuyến bay\n- Thời gian đặt vé\n- Hạng ghế (phổ thông/thương gia)\n- Thời điểm bay\n\nVui lòng tìm kiếm chuyến bay cụ thể để xem giá chính xác. Bạn muốn tìm chuyến bay nào?";
        }
        
        if (lowerMessage.contains("hủy vé") || lowerMessage.contains("cancel") || lowerMessage.contains("hoàn tiền")) {
            return "Chính sách hủy vé:\n- Hủy trước 24h: hoàn 80% giá vé\n- Hủy trước 12h: hoàn 50% giá vé\n- Hủy trong 12h: không hoàn tiền\n\nĐể hủy vé, vui lòng liên hệ hotline hoặc gửi yêu cầu qua email với mã đặt chỗ. Bạn cần hỗ trợ gì thêm?";
        }
        
        if (lowerMessage.contains("liên hệ") || lowerMessage.contains("contact") || lowerMessage.contains("hotline")) {
            return "Thông tin liên hệ Arigatou Airlines:\n- Hotline: 1900-xxxx (24/7)\n- Email: support@arigatouairlines.com\n- Website: www.arigatouairlines.com\n\nBạn có câu hỏi nào khác không?";
        }
        
        if (lowerMessage.contains("cảm ơn") || lowerMessage.contains("thank")) {
            return "Rất vui được hỗ trợ bạn! Chúc bạn có chuyến bay an toàn và thoải mái. Nếu cần hỗ trợ thêm, đừng ngại liên hệ nhé!";
        }
        
        return "Tôi hiểu bạn đang hỏi về: \"" + message + "\". Tôi có thể giúp bạn về:\n" +
               "- Thông tin chuyến bay\n" +
               "- Đặt vé và thanh toán\n" +
               "- Check-in trực tuyến\n" +
               "- Hành lý\n" +
               "- Hủy vé và hoàn tiền\n" +
               "- Liên hệ hỗ trợ\n\n" +
               "Bạn muốn biết về vấn đề nào?";
    }
}
