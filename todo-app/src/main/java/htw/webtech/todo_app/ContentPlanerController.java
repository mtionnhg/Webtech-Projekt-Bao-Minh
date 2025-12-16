package htw.webtech.todo_app;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @DeleteMapping("/api/content/{id}")
    public ResponseEntity<Void> deleteContentPiece(@PathVariable Long id) {
        if (!contentPieceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        contentPieceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/api/content/{id}")
    public ResponseEntity<ContentPiece> updateContentPiece(
            @PathVariable Long id,
            @RequestBody ContentPiece contentPiece
    ) {
        if (!contentPieceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        contentPiece.setId(id);
        ContentPiece updated = contentPieceRepository.save(contentPiece);
        return ResponseEntity.ok(updated);
    }
}
