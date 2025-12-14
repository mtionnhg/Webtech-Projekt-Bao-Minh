package htw.webtech.todo_app;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class ContentPlanerController {

    @Autowired
    private ContentPieceRepository contentPieceRepository;

    @GetMapping("/")
    public String test() {
        return "Backend is running!";
    }

    @GetMapping("/api/content")
    public List<ContentPiece> getAllContent() {
        return contentPieceRepository.findAll();
    }

    @PostMapping("/api/content")
    public ContentPiece createContentPiece(@RequestBody ContentPiece contentPiece) {
        return contentPieceRepository.save(contentPiece);
    }
}
