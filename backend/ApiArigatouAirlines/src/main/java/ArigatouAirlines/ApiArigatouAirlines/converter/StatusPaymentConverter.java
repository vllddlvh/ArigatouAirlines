package ArigatouAirlines.ApiArigatouAirlines.converter;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusPayment;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class StatusPaymentConverter implements AttributeConverter<StatusPayment, Integer> {

    @Override
    public Integer convertToDatabaseColumn(StatusPayment attribute) {
        if (attribute == null) return null;
        return attribute.ordinal();
    }

    @Override
    public StatusPayment convertToEntityAttribute(Integer dbData) {
        if (dbData == null) return null;

        int raw = dbData;
        int len = StatusPayment.values().length;

        int v = raw;
        if (v >= 48 && v < 48 + len) {
            v = v - 48;
        }

        if (v >= 0 && v < len) {
            return StatusPayment.values()[v];
        }

        if (v >= 1 && v <= len) {
            return StatusPayment.values()[v - 1];
        }

        return StatusPayment.Pending;
    }
}
