package ArigatouAirlines.ApiArigatouAirlines.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity(name = "post")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    int postId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    String title;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    String content;

    @Column(name = "createdAt")
    LocalDateTime createdAt;
}
