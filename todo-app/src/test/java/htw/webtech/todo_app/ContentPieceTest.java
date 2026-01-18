package htw.webtech.todo_app;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ContentPieceTest {

    @Test
    void contentPiece_gettersAndSetters() {
        ContentPiece piece = new ContentPiece();
        
        piece.setTitle("Test Video");
        piece.setFormat("Talking Head");
        piece.setStatus("Ideation");
        piece.setContentPillar("Top of Funnel");
        piece.setPerformance("Viral");
        piece.setNotes("Some notes");
        piece.setScript("Hook here");
        piece.setShotlist("Shot 1, Shot 2");

        assertEquals("Test Video", piece.getTitle());
        assertEquals("Talking Head", piece.getFormat());
        assertEquals("Ideation", piece.getStatus());
        assertEquals("Top of Funnel", piece.getContentPillar());
        assertEquals("Viral", piece.getPerformance());
        assertEquals("Some notes", piece.getNotes());
        assertEquals("Hook here", piece.getScript());
        assertEquals("Shot 1, Shot 2", piece.getShotlist());
    }

    @Test
    void contentPiece_uploadDateCanBeSet() {
        ContentPiece piece = new ContentPiece();
        LocalDateTime now = LocalDateTime.now();
        
        piece.setUploadDate(now);
        
        assertEquals(now, piece.getUploadDate());
    }

    @Test
    void contentPiece_linkCanBeSet() {
        ContentPiece piece = new ContentPiece();
        
        piece.setLink("https://youtube.com/watch?v=123");
        
        assertEquals("https://youtube.com/watch?v=123", piece.getLink());
    }

    @Test
    void contentPiece_idCanBeSet() {
        ContentPiece piece = new ContentPiece();
        
        piece.setId(42L);
        
        assertEquals(42L, piece.getId());
    }
}
