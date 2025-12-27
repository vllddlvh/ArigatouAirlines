package ArigatouAirlines.ApiArigatouAirlines.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity(name = "ticket_class")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketClass {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_id")
    int classId;

    @Column(name = "class_name")
    String className;

    @Column(name = "baggage_allowance_kg")
    int baggageAllowanceKg;

    boolean refundable;

    boolean changeable;
}
