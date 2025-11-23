package htw.webtech.todo_app;

import java.time.LocalDateTime;

public class ContentPiece {
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

    // Konstruktor ohne Parameter
    public ContentPiece() {}

    // Konstruktor mit allen Parametern
    public ContentPiece(Long id, String title, String contentPillar, String format, 
                       String status, String performance, String notes, LocalDateTime uploadDate, 
                       String link, String script, String shotlist, String hook, String caption) {
        this.id = id;
        this.title = title;
        this.contentPillar = contentPillar;
        this.format = format;
        this.status = status;
        this.performance = performance;
        this.notes = notes;
        this.uploadDate = uploadDate;
        this.link = link;
        this.script = script;
        this.shotlist = shotlist;
        this.hook = hook;
        this.caption = caption;
    }

    // Getter und Setter Methoden
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContentPillar() {
        return contentPillar;
    }

    public void setContentPillar(String contentPillar) {
        this.contentPillar = contentPillar;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPerformance() {
        return performance;
    }

    public void setPerformance(String performance) {
        this.performance = performance;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getScript() {
        return script;
    }

    public void setScript(String script) {
        this.script = script;
    }

    public String getShotlist() {
        return shotlist;
    }

    public void setShotlist(String shotlist) {
        this.shotlist = shotlist;
    }

    public String getHook() {
        return hook;
    }

    public void setHook(String hook) {
        this.hook = hook;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    @Override
    public String toString() {
        return "ContentPiece{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", contentPillar='" + contentPillar + '\'' +
                ", format='" + format + '\'' +
                ", status='" + status + '\'' +
                ", performance='" + performance + '\'' +
                ", notes='" + notes + '\'' +
                ", uploadDate=" + uploadDate +
                ", link='" + link + '\'' +
                ", script='" + script + '\'' +
                ", shotlist='" + shotlist + '\'' +
                ", hook='" + hook + '\'' +
                ", caption='" + caption + '\'' +
                '}';
    }
}
