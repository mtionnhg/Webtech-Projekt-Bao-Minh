package htw.webtech.todo_app;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "content_pieces")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ContentPiece {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String contentPillar;
    private String format;
    private String status;
    private String performance;
    private String notes;
    private LocalDateTime uploadDate;
    private String link;
    private String script;
    private String shotlist;
    private String hook;
    private String caption;
}
