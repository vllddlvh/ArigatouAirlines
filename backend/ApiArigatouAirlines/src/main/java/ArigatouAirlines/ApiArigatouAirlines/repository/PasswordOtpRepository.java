package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.PasswordOTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PasswordOtpRepository extends JpaRepository<PasswordOTP, String> {

    @Transactional
    @Modifying
    @Query("DELETE FROM PasswordOTP p WHERE p.valid = FALSE")
    public void deleteAllInvalid();

    @Transactional
    @Modifying
    @Query("UPDATE PasswordOTP p SET p.valid = FALSE WHERE p.user.userId = :userId AND p.valid = TRUE")
    void invalidateOtp(@Param("userId") int userId);

    @Transactional
    @Query(value = "SELECT COUNT(*) FROM password_otp WHERE user_id = :userId AND created_at >= NOW() - INTERVAL 1.5 MINUTE", nativeQuery = true)
    int countOtp(@Param("userId") int userId);
}