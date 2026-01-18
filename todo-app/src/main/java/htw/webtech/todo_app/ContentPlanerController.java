package htw.webtech.todo_app;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
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

    // GET einzelnes Content Piece (für Content Detail View)
    @GetMapping("/api/content/{id}")
    public ResponseEntity<ContentPiece> getContentPieceById(@PathVariable Long id) {
        return contentPieceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // PATCH nur Status updaten (für Drag & Drop im Workflow Board)
    @PatchMapping("/api/content/{id}/status")
    public ResponseEntity<ContentPiece> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        return contentPieceRepository.findById(id)
                .map(piece -> {
                    String newStatus = body.get("status");
                    if (newStatus != null) {
                        piece.setStatus(newStatus);
                        contentPieceRepository.save(piece);
                    }
                    return ResponseEntity.ok(piece);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
