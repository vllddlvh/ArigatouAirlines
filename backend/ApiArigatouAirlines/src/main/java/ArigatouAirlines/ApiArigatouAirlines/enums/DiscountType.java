package ArigatouAirlines.ApiArigatouAirlines.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DiscountType {

    PERCENTAGE("Percentage"),
    FIXED_AMOUNT("Fixed Amount");

    private final String dbValue;

    DiscountType(String dbValue) {
        this.dbValue = dbValue;
    }

    @JsonValue
    public String getDbValue() {
        return dbValue;
    }

    @JsonCreator
    public static DiscountType fromValue(String value) {
        for (DiscountType type : values()) {
            if (type.dbValue.equalsIgnoreCase(value)
                    || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown discount type: " + value);
    }
}
