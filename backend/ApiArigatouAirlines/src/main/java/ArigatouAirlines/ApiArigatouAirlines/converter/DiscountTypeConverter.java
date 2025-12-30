package ArigatouAirlines.ApiArigatouAirlines.converter;

import ArigatouAirlines.ApiArigatouAirlines.enums.DiscountType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class DiscountTypeConverter implements AttributeConverter<DiscountType, String> {

    @Override
    public String convertToDatabaseColumn(DiscountType attribute) {
        if (attribute == null) return null;
        if (attribute == DiscountType.Percentage) return "Percentage";
        if (attribute == DiscountType.FixedAmount) return "Fixed Amount";
        if (attribute == DiscountType.Amount) return "Fixed Amount";
        throw new IllegalArgumentException("Unknown discount type: " + attribute);
    }

    @Override
    public DiscountType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        String v = dbData.trim();
        if (v.equalsIgnoreCase("Percentage")) return DiscountType.Percentage;
        if (v.equalsIgnoreCase("Fixed Amount") || v.equalsIgnoreCase("FixedAmount") || v.equalsIgnoreCase("Fixed")) {
            return DiscountType.FixedAmount;
        }
        if (v.equalsIgnoreCase("Amount")) return DiscountType.Amount;
        throw new IllegalArgumentException("Unknown discount type: " + dbData);
    }
}
