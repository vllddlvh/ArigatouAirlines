package ArigatouAirlines.ApiArigatouAirlines.validator;

import ArigatouAirlines.ApiArigatouAirlines.enums.DiscountType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class DiscountTypeConverter
        implements AttributeConverter<DiscountType, String> {

    @Override
    public String convertToDatabaseColumn(DiscountType attribute) {
        if (attribute == null) return null;
        return attribute.getDbValue();
    }

    @Override
    public DiscountType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return DiscountType.fromValue(dbData);
    }
}

