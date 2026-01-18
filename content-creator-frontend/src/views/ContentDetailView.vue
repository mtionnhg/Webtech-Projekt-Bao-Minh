<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchContentPieceById, updateContentPiece, deleteContentPiece, type ContentPiece } from '@/services/api'

const route = useRoute()
const router = useRouter()

const contentPiece = ref<ContentPiece | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Dropdown Optionen
const formatOptions = ['Talking Head', 'List', 'Voice Over']
const pillarOptions = ['Top of Funnel', 'Middle of Funnel', 'Bottom of Funnel']
const statusOptions = ['Ideation', 'Scripting', 'Filming', 'Editing', 'Ready 2 Upload', 'Uploaded']
const performanceOptions = ['', 'Viral', 'Good', 'Mid', 'Bad']

// Script Templates
const scriptTemplates: Record<string, string> = {
  'Talking Head': `🎣 HOOK:
[Hook hier schreiben]

💎 VALUE:
[Hauptinhalt hier]

📢 CALL TO ACTION:
[CTA hier]`,

  'List': `🎣 HOOK:
[Hook hier schreiben]

📋 LISTE:
1. [Punkt 1]
2. [Punkt 2]
3. [Punkt 3]

📢 CALL TO ACTION:
[CTA hier]`,

  'Voice Over': `🎣 HOOK:
[Hook hier schreiben]

🎙️ VOICE OVER:
[Voice Over Text hier]

📢 CALL TO ACTION:
[CTA hier]`
}

// Content Piece laden
const loadContentPiece = async () => {
  const id = Number(route.params.id)
  if (isNaN(id)) {
    error.value = 'Ungültige Content ID'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    contentPiece.value = await fetchContentPieceById(id)
  } catch (err) {
    error.value = 'Content Piece nicht gefunden'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Speichern
const saveContentPiece = async () => {
  if (!contentPiece.value) return

  isSaving.value = true
  error.value = null
  successMessage.value = null

  try {
    await updateContentPiece(contentPiece.value.id, contentPiece.value)
    successMessage.value = 'Erfolgreich gespeichert!'
    setTimeout(() => successMessage.value = null, 3000)
  } catch (err) {
    error.value = 'Fehler beim Speichern'
    console.error(err)
  } finally {
    isSaving.value = false
  }
}

// Löschen
const deleteCurrentPiece = async () => {
  if (!contentPiece.value) return
  
  if (!confirm('Möchten Sie dieses Content Piece wirklich löschen?')) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await deleteContentPiece(contentPiece.value.id)
    router.push('/workflow')
  } catch (err) {
    error.value = 'Fehler beim Löschen'
    console.error(err)
    isLoading.value = false
  }
}

// Zurück navigieren
const goBack = () => {
  router.back()
}

// Script Template anwenden
const applyScriptTemplate = () => {
  if (!contentPiece.value) return
  
  const template = scriptTemplates[contentPiece.value.format]
  if (template && (!contentPiece.value.script || contentPiece.value.script.trim() === '')) {
    contentPiece.value.script = template
  }
}

// Watch für Format-Änderung (Template vorschlagen)
watch(() => contentPiece.value?.format, (newFormat) => {
  if (newFormat && scriptTemplates[newFormat] && contentPiece.value) {
    // Nur vorschlagen wenn Script leer ist
    if (!contentPiece.value.script || contentPiece.value.script.trim() === '') {
      applyScriptTemplate()
    }
  }
})

onMounted(() => {
  loadContentPiece()
})
</script>

<template>
  <main class="content-detail-view">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <button @click="goBack" class="back-button">
          ← Zurück
        </button>
        <div class="header-actions">
          <button 
            @click="saveContentPiece" 
            class="btn btn-primary"
            :disabled="isSaving || isLoading"
          >
            {{ isSaving ? 'Speichert...' : 'Speichern' }}
          </button>
          <button 
            @click="deleteCurrentPiece" 
            class="btn btn-danger"
            :disabled="isLoading"
          >
            Löschen
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading">
        Lade Content Piece...
      </div>

      <!-- Content Form -->
      <div v-else-if="contentPiece" class="content-form">
        <!-- Titel -->
        <div class="form-section">
          <label class="form-label">Titel</label>
          <input 
            v-model="contentPiece.title" 
            type="text" 
            class="form-input form-input-large"
            placeholder="Content Piece Titel"
          />
        </div>

        <!-- Metadata Grid -->
        <div class="metadata-grid">
          <div class="form-group">
            <label class="form-label">Format</label>
            <select v-model="contentPiece.format" class="form-select">
              <option v-for="option in formatOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Content Pillar</label>
            <select v-model="contentPiece.contentPillar" class="form-select">
              <option value="">-- Auswählen --</option>
              <option v-for="option in pillarOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Status</label>
            <select v-model="contentPiece.status" class="form-select">
              <option v-for="option in statusOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Performance</label>
            <select v-model="contentPiece.performance" class="form-select">
              <option v-for="option in performanceOptions" :key="option" :value="option">
                {{ option || '-- Keine --' }}
              </option>
            </select>
          </div>
        </div>

        <!-- Notizen -->
        <div class="form-section">
          <label class="form-label">Notizen</label>
          <textarea 
            v-model="contentPiece.notes" 
            class="form-textarea"
            rows="3"
            placeholder="Notizen zum Content Piece..."
          ></textarea>
        </div>

        <!-- Upload Info -->
        <div class="upload-grid">
          <div class="form-group">
            <label class="form-label">Upload Datum</label>
            <input 
              v-model="contentPiece.uploadDate" 
              type="date" 
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Link</label>
            <input 
              v-model="contentPiece.link" 
              type="url" 
              class="form-input"
              placeholder="https://..."
            />
          </div>
        </div>

        <!-- Script Editor Section -->
        <div class="script-section">
          <div class="script-header">
            <h2 class="section-title">Script Editor</h2>
            <button 
              v-if="scriptTemplates[contentPiece.format]"
              @click="applyScriptTemplate"
              class="btn btn-secondary btn-small"
            >
              Template laden
            </button>
          </div>

          <div class="script-grid">
            <div class="script-column">
              <label class="form-label">Gesprochener Text</label>
              <textarea 
                v-model="contentPiece.script" 
                class="form-textarea script-textarea"
                rows="15"
                placeholder="Script / Gesprochener Text hier..."
              ></textarea>
            </div>

            <div class="script-column">
              <label class="form-label">Shotlist</label>
              <textarea 
                v-model="contentPiece.shotlist" 
                class="form-textarea script-textarea"
                rows="15"
                placeholder="Shotlist / B-Roll Ideen hier..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Hook & Caption -->
        <div class="hook-caption-grid">
          <div class="form-group">
            <label class="form-label">Hook</label>
            <textarea 
              v-model="contentPiece.hook" 
              class="form-textarea"
              rows="2"
              placeholder="Der Hook für die ersten 3 Sekunden..."
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Caption</label>
            <textarea 
              v-model="contentPiece.caption" 
              class="form-textarea"
              rows="2"
              placeholder="Caption für den Post..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="not-found">
        <h2>Content Piece nicht gefunden</h2>
        <button @click="goBack" class="btn btn-primary">Zurück</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.content-detail-view {
  min-height: calc(100vh - 100px);
  padding: 2rem;
  background: #f5f7fa;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.back-button {
  background: none;
  border: none;
  color: #4252b9;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: rgba(66, 82, 185, 0.1);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4252b9 0%, #667eea 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 82, 185, 0.3);
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #fcc;
}

.success-message {
  background: #d1fae5;
  color: #065f46;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #a7f3d0;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1.2rem;
}

.content-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4252b9;
}

.form-input-large {
  font-size: 1.5rem;
  font-weight: 600;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.upload-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.script-section {
  margin: 2rem 0;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

.script-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.script-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.script-column {
  display: flex;
  flex-direction: column;
}

.script-textarea {
  flex: 1;
  min-height: 300px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  resize: vertical;
}

.hook-caption-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.not-found {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
}

.not-found h2 {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* Responsive */
@media (max-width: 900px) {
  .metadata-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .script-grid {
    grid-template-columns: 1fr;
  }
  
  .hook-caption-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .content-detail-view {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .metadata-grid {
    grid-template-columns: 1fr;
  }
  
  .upload-grid {
    grid-template-columns: 1fr;
  }
}
</style>
