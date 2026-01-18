package htw.webtech.todo_app;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ContentPlanerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ContentPieceRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void getAllContent_returnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/content"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void createContentPiece_returnsCreatedPiece() throws Exception {
        String json = """
            {
                "title": "Test Video",
                "format": "Talking Head",
                "status": "Ideation",
                "contentPillar": "Top of Funnel"
            }
            """;

        mockMvc.perform(post("/api/content")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Video"))
                .andExpect(jsonPath("$.format").value("Talking Head"))
                .andExpect(jsonPath("$.status").value("Ideation"));
    }

    @Test
    void getContentPieceById_returnsContentPiece() throws Exception {
        // Erst erstellen
        ContentPiece piece = new ContentPiece();
        piece.setTitle("Test Video");
        piece.setStatus("Ideation");
        piece = repository.save(piece);

        // Dann abrufen
        mockMvc.perform(get("/api/content/" + piece.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Video"));
    }

    @Test
    void getContentPieceById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/content/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteContentPiece_returnsNoContent() throws Exception {
        // Erst erstellen
        ContentPiece piece = new ContentPiece();
        piece.setTitle("To Delete");
        piece = repository.save(piece);

        // Dann löschen
        mockMvc.perform(delete("/api/content/" + piece.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteContentPiece_notFound_returns404() throws Exception {
        mockMvc.perform(delete("/api/content/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateContentPiece_returnsUpdatedPiece() throws Exception {
        // Erst erstellen
        ContentPiece piece = new ContentPiece();
        piece.setTitle("Original Title");
        piece.setStatus("Ideation");
        piece = repository.save(piece);

        String updateJson = """
            {
                "title": "Updated Title",
                "status": "Scripting"
            }
            """;

        mockMvc.perform(put("/api/content/" + piece.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.status").value("Scripting"));
    }

    @Test
    void updateStatus_updatesOnlyStatus() throws Exception {
        // Erst erstellen
        ContentPiece piece = new ContentPiece();
        piece.setTitle("Test");
        piece.setStatus("Ideation");
        piece = repository.save(piece);

        // Nur Status updaten
        mockMvc.perform(patch("/api/content/" + piece.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"Scripting\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Scripting"))
                .andExpect(jsonPath("$.title").value("Test")); // Titel bleibt gleich
    }

    @Test
    void updateStatus_notFound_returns404() throws Exception {
        mockMvc.perform(patch("/api/content/99999/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"Scripting\"}"))
                .andExpect(status().isNotFound());
    }
}
