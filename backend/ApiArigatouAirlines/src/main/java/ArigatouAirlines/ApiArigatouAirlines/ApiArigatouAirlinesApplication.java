package ArigatouAirlines.ApiArigatouAirlines;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class ApiArigatouAirlinesApplication {

	public static void main(String[] args) {

		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
		SpringApplication.run(ApiArigatouAirlinesApplication.class, args);
	}

}
