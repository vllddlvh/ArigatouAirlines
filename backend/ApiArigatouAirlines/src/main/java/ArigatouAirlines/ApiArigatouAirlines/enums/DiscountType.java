package ArigatouAirlines.ApiArigatouAirlines.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DiscountType {
    Percentage("Percentage"),
    FixedAmount("Fixed Amount"),
    Amount("Amount");

    private final String value;

    DiscountType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static DiscountType fromValue(String raw) {
        if (raw == null) return null;
        String v = raw.trim();
        if (v.equalsIgnoreCase("Percentage")) return Percentage;
        if (v.equalsIgnoreCase("Fixed Amount") || v.equalsIgnoreCase("FixedAmount") || v.equalsIgnoreCase("Fixed")) return FixedAmount;
        if (v.equalsIgnoreCase("Amount")) return Amount;
        throw new IllegalArgumentException("Unknown discount type: " + raw);
    }
}
