package ArigatouAirlines.ApiArigatouAirlines.repository;

import ArigatouAirlines.ApiArigatouAirlines.entity.Voucher;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Integer> {
    Optional<Voucher> findByVoucherCodeIgnoreCase(String voucherCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from voucher v where lower(v.voucherCode) = lower(?1)")
    Optional<Voucher> findByVoucherCodeForUpdate(String voucherCode);

    Optional<Voucher> findByVoucherCode(String voucherCode);
}
