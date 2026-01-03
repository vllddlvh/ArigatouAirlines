package ArigatouAirlines.ApiArigatouAirlines.exception;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum ErrorCode {

    // ─────────────── 9xxx: System/Internal Errors ───────────────
    UNKNOWN_EXCEPTION(9000, "Unknown error!", HttpStatus.INTERNAL_SERVER_ERROR),
    RUNTIME_EXCEPTION(9001, "Runtime error!", HttpStatus.INTERNAL_SERVER_ERROR),

    // ─────────────── 1xxx: User-related Errors ───────────────
    USER_EXISTED(1001, "User already exists!", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTS(1002, "User does not exist!", HttpStatus.BAD_REQUEST),
    LASTNAME_NULL(1003, "Last name must not be null!", HttpStatus.BAD_REQUEST),
    GENDER_NULL(1004, "Gender must not be null!", HttpStatus.BAD_REQUEST),
    PHONE_NUMBER_NULL(1005, "Phone number must not be null!", HttpStatus.BAD_REQUEST),
    POINT_IS_NULL(1006, "User's point must not be null!", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1007, "Email already exists!", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(1008, "Invalid email format!", HttpStatus.BAD_REQUEST),
    PHONE_EXISTED(1009, "Phone already exists", HttpStatus.BAD_REQUEST),
    USER_CANNOT_UPDATE_ROLE(1010, "User cannot update role!", HttpStatus.BAD_REQUEST),
    INVALID_GENDER(1011, "Invalid Gender value!", HttpStatus.BAD_REQUEST),
    POSTID_IS_NOT_EXISTED(1012, "PostID is not existed", HttpStatus.BAD_REQUEST),


    // ─────────────── 2xxx: Authentication & Authorization ───────────────
    UNAUTHENTICATED(2001, "Unauthenticated!", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(2002, "You do not have permission!", HttpStatus.FORBIDDEN),
    WAIT_OTP(2003, "Please wait 90s to resend OTP!", HttpStatus.BAD_REQUEST),
    TOKEN_IS_NULL(2004, "Token must not be null!", HttpStatus.BAD_REQUEST),
    INVALID_OTP(2005, "OTP does not exist or expired!", HttpStatus.BAD_REQUEST),
    INVALID_TOKEN(2006,"JWT Token expired or disabled" , HttpStatus.BAD_REQUEST),

    // ─────────────── 3xxx: Role & Permission Errors ───────────────
    ROLE_EXISTED(3001, "Role already exists!", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTS(3002, "Role does not exist!", HttpStatus.BAD_REQUEST),
    INVALID_ROLE(3003, "Invalid role!", HttpStatus.BAD_REQUEST),
    INVALID_PERMISSION(3004, "Invalid permission!", HttpStatus.BAD_REQUEST),
    PERMISSION_EXISTED(3005, "Permission already exists!", HttpStatus.BAD_REQUEST),
    PERMISSION_NAME_NULL(3006, "Permission name must not be null!", HttpStatus.BAD_REQUEST),
    ROLE_NAME_NULL(3007, "Role name must not be null!", HttpStatus.BAD_REQUEST),

    // ─────────────── 4xxx: Input Field Validation Errors ───────────────
    USERNAME_IS_NULL(4001, "Username must not be null!", HttpStatus.BAD_REQUEST),
    INVALID_USERNAME(4002, "Username must be at least 6 characters!", HttpStatus.BAD_REQUEST),
    PASSWORD_IS_NULL(4003, "Password must not be null!", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(4004, "Password must be at least 8 characters!", HttpStatus.BAD_REQUEST),
    EMAIL_IS_NULL(4005, "Email must not be null!", HttpStatus.BAD_REQUEST),
    DOB_IS_NULL(4006, "Date of birth must not be null!", HttpStatus.BAD_REQUEST),
    CONFIRM_PASSWORD_FAIL(4007, "New password and confirm password do not match!", HttpStatus.BAD_REQUEST),
    INVALID_USERNAME_MAX(4008, "Username must be at less than 20 characters!", HttpStatus.BAD_REQUEST),
    FULLNAME_IS_NULL(4009, "Fullname must not be null!", HttpStatus.BAD_REQUEST),
    PHONE_NULL(4010, "Phone must not be null!", HttpStatus.BAD_REQUEST),
    DOB_IS_THE_PAST(4011, "Date of birth must be in\n" + "the past", HttpStatus.BAD_REQUEST),


    //─────────────── 5xxx: Airport & Airline Error & aircraft ───────────────
    AIRPORTCODE_EXISTED(5001, "Airport code already exists!", HttpStatus.BAD_REQUEST),
    AIRPORTID_NOT_EXISTD(5002, "Airport ID does not exist!", HttpStatus.BAD_REQUEST),
    AIRPORT_IN_USE(5008, "Airport is in use and cannot be deleted!", HttpStatus.CONFLICT),
    AIRLINECODE_EXISTED(5003, "Airline code already exists!", HttpStatus.BAD_REQUEST),
    AIRLINEID_NOT_EXISTED(5004, "Airline ID does not exist!", HttpStatus.BAD_REQUEST),
    AIRCRAFT_TYPE_ID_NOT_EXSITED(5005, "AircraftTypeId doesn't existed!", HttpStatus.BAD_REQUEST),
    AIRCRAFT_ID_NOT_EXSITED(5006, "AircraftId  doesn't existed!", HttpStatus.BAD_REQUEST),
    SEATLAYOUT_ID_NOT_EXSITED(5007, "SeatLayoutId doesn't existed!", HttpStatus.BAD_REQUEST),
    SEAT_ID_NOT_EXSITED(5008, "SeatId doesn't existed!", HttpStatus.BAD_REQUEST),



    //─────────────── 6xxx: Flight ───────────────
    DEPARTURE_AND_ARRIVAL_TIME_CANNOT_CONFLICT(6001, "Departure and arrival time can't conflict", HttpStatus.BAD_REQUEST),
    FLIGHT_SCHEDULE_ID_NOT_EXISTED(6002, "FlightScheduleId doesn't existed!", HttpStatus.BAD_REQUEST),
    FLIGHT_ID_NOT_EXISTED(6003, "FlightId doesn't existed!", HttpStatus.BAD_REQUEST),
    FLIGHT_SEAT_ID_NOT_EXISTED(6004, "FlightSeatId doesn't existed!", HttpStatus.BAD_REQUEST),

    //─────────────── 7xxx: Ticket ───────────────
    CLASS_NAME_IS_AVAILABLE(7001, "ClassName is available!", HttpStatus.BAD_REQUEST),
    TICKET_CLASS_ID_IS_NOT_AVAILABLE(7002, "TicketClassID is not available!", HttpStatus.BAD_REQUEST),
    FLIGHT_PRICE_ID_IS_NOT_AVAILABLE(7003, "FlightPriceID is not available!", HttpStatus.BAD_REQUEST),

    //─────────────── 8xxx: Booking ───────────────
    BOOKING_NOT_FOUND(8001, "Booking not found!", HttpStatus.NOT_FOUND),
    BOOKING_ALREADY_CANCELLED(8002, "Booking has already been cancelled!", HttpStatus.BAD_REQUEST),
    SEAT_NOT_AVAILABLE(8010, "Seat is not available!", HttpStatus.CONFLICT),
    SEAT_CLASS_MISMATCH(8011, "Selected seat does not match ticket class!", HttpStatus.BAD_REQUEST),
    NOT_ENOUGH_SEATS(8012, "Not enough seats available for the selected class!", HttpStatus.CONFLICT),

    VOUCHER_NOT_FOUND(8003, "Voucher not found!", HttpStatus.NOT_FOUND),
    VOUCHER_INACTIVE(8004, "Voucher is inactive!", HttpStatus.BAD_REQUEST),
    VOUCHER_EXPIRED(8005, "Voucher is expired!", HttpStatus.BAD_REQUEST),
    VOUCHER_MIN_ORDER_NOT_MET(8006, "Order amount does not meet voucher minimum requirement!", HttpStatus.BAD_REQUEST),
    VOUCHER_USAGE_LIMIT_REACHED(8007, "Voucher usage limit reached!", HttpStatus.BAD_REQUEST),
    VOUCHER_CODE_REQUIRED(8008, "Voucher code is required!", HttpStatus.BAD_REQUEST),
    VOUCHER_CODE_EXISTED(8009, "Voucher code already exists!", HttpStatus.CONFLICT),

    FLIGHT_AIRCRAFT_REQUIRED(8013, "Flight must have an aircraft to generate seat map!", HttpStatus.BAD_REQUEST),

    BOOKING_ID_IS_NOT_EXISTED(8014, "BookingID is not existed!", HttpStatus.BAD_REQUEST),
    PAYMENT_ID_IS_NOT_EXISTED(8015, "PaymentID is not existed!", HttpStatus.BAD_REQUEST),
    BOOKING_WAS_CANCELLED(8016, "Booking was cancelled!", HttpStatus.BAD_REQUEST),
    VOUCHER_ID_IS_NOT_EXISTED(8017, "VoucherID is not existed!", HttpStatus.BAD_REQUEST),
    VOUCHER_CODE_IS_NOT_EXISTED(8020, "VoucherCode is not existed!", HttpStatus.BAD_REQUEST),
    VOUCHER_WAS_USED_USAGE_LIMIT(8018, "This voucher has already been used up!", HttpStatus.BAD_REQUEST),
    AMOUNT_BOOKING_MORE_THAN_MIN_ORDER_AMOUNT(8019, "Amount booking more than min order amount voucher!", HttpStatus.BAD_REQUEST);


    int code;
    String message;
    HttpStatusCode httpStatusCode;
}
