package ArigatouAirlines.ApiArigatouAirlines.converter;

import ArigatouAirlines.ApiArigatouAirlines.enums.StatusBooking;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class StatusBookingConverter implements AttributeConverter<StatusBooking, Integer> {

    @Override
    public Integer convertToDatabaseColumn(StatusBooking attribute) {
        if (attribute == null) return null;
        return attribute.ordinal();
    }

    @Override
    public StatusBooking convertToEntityAttribute(Integer dbData) {
        if (dbData == null) return null;

        int raw = dbData;
        int len = StatusBooking.values().length;

        int v = raw;
        if (v >= 48 && v < 48 + len) {
            v = v - 48;
        }

        if (v >= 0 && v < len) {
            return StatusBooking.values()[v];
        }

        if (v >= 1 && v <= len) {
            return StatusBooking.values()[v - 1];
        }

        return StatusBooking.Pending;
    }
}
