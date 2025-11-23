package htw.webtech.todo_app;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@RestController
public class ContentPlanerController {

    @GetMapping("/")
    public String test() {
        return "Backend is running!";
    }

    @GetMapping("/api/content")
    public List<ContentPiece> getAllContent() {
        return Arrays.asList(
            new ContentPiece(1L, "Tech Video 1", "Tech", "Talking Head", "Ideation", "High", "Notes", LocalDateTime.now(), "Link", "Script", "Shotlist", "Hook", "Caption"),
            new ContentPiece(2L, "Business Video 1", "Business", "List Video", "Needs Scripting", "Medium", "Notes", LocalDateTime.now(), "Link", "Script", "Shotlist", "Hook", "Caption"),
            new ContentPiece(3L, "Lifestyle Video 1", "Lifestyle", "Talking Head", "Ready to Post", "High", "Notes", LocalDateTime.now(), "Link", "Script", "Shotlist", "Hook", "Caption")
        );
    }
}
