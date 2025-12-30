package ArigatouAirlines.ApiArigatouAirlines.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum StatusFlight {
    Scheduled("Scheduled"),
    On_Time("On Time"),
    Delayed("Scheduled"),
    Departed("Departed"),
    Arrived("Arrived");

    private final String dbValue;

    StatusFlight(String dbValue) {
        this.dbValue = dbValue;
    }

    @JsonValue
    public String getDbValue() {
        return dbValue;
    }

    @JsonCreator
    public static StatusFlight fromValue(String value) {
        for (StatusFlight type : values()) {
            if (type.dbValue.equalsIgnoreCase(value)
                    || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown discount type: " + value);
    }
}
