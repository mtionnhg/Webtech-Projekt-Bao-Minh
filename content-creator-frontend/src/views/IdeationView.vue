<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { fetchContentPieces, createContentPiece, deleteContentPiece, updateContentPiece, type ContentPiece } from '@/services/api'

const contentPieces = ref<ContentPiece[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Formular State
const showCreateForm = ref(false)
const newContentTitle = ref('')
const selectedColumn = ref<'Reel' | 'Story' | 'Carousel'>('Reel')

// Context Menu State
const contextMenu = ref<{
  visible: boolean
  x: number
  y: number
  pieceId: number | null
}>({
  visible: false,
  x: 0,
  y: 0,
  pieceId: null
})

// Format Edit Popup State
const formatEditPopup = ref<{
  visible: boolean
  pieceId: number | null
  currentFormat: 'Reel' | 'Story' | 'Carousel' | null
}>({
  visible: false,
  pieceId: null,
  currentFormat: null
})

// Spalten Definition
const columns = [
  { id: 'Reel', title: 'Reel', format: 'Reel' },
  { id: 'Story', title: 'Story', format: 'Story' },
  { id: 'Carousel', title: 'Carousel', format: 'Carousel' }
]

// Gefilterte Content Pieces pro Spalte
const getContentByFormat = (format: string) => {
  return contentPieces.value.filter(piece => piece.format === format)
}

// Content Pieces laden
const loadContentPieces = async () => {
  isLoading.value = true
  error.value = null
  try {
    contentPieces.value = await fetchContentPieces()
  } catch (err) {
    error.value = 'Fehler beim Laden der Content Pieces'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Neues Content Piece erstellen
const createNewContentPiece = async () => {
  if (!newContentTitle.value.trim()) {
    error.value = 'Bitte geben Sie einen Namen ein'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const newPiece: Omit<ContentPiece, 'id'> = {
      title: newContentTitle.value.trim(),
      format: selectedColumn.value,
      contentPillar: '',
      status: 'Ideation',
      performance: '',
      notes: '',
      link: '',
      script: '',
      shotlist: '',
      hook: '',
      caption: ''
    }

    const created = await createContentPiece(newPiece)
    contentPieces.value.push(created)
    
    // Formular zurücksetzen
    newContentTitle.value = ''
    showCreateForm.value = false
    error.value = null
  } catch (err) {
    error.value = 'Fehler beim Erstellen des Content Pieces'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Context Menu Handler
const handleContextMenu = (event: MouseEvent, pieceId: number) => {
  event.preventDefault()
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    pieceId
  }
}

const closeContextMenu = () => {
  contextMenu.value.visible = false
  contextMenu.value.pieceId = null
}

// Content Piece löschen
const deletePiece = async () => {
  if (!contextMenu.value.pieceId) return

  const pieceId = contextMenu.value.pieceId
  closeContextMenu()

  if (!confirm('Möchten Sie dieses Content Piece wirklich löschen?')) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await deleteContentPiece(pieceId)
    // Aus lokalem Array entfernen
    contentPieces.value = contentPieces.value.filter(piece => piece.id !== pieceId)
  } catch (err) {
    error.value = 'Fehler beim Löschen des Content Pieces'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Format Edit Popup öffnen
const openFormatEditPopup = (piece: ContentPiece) => {
  formatEditPopup.value = {
    visible: true,
    pieceId: piece.id,
    currentFormat: piece.format as 'Reel' | 'Story' | 'Carousel'
  }
}

// Format Edit Popup schließen
const closeFormatEditPopup = () => {
  formatEditPopup.value = {
    visible: false,
    pieceId: null,
    currentFormat: null
  }
}

// Format ändern
const updateFormat = async (newFormat: 'Reel' | 'Story' | 'Carousel') => {
  if (!formatEditPopup.value.pieceId) return

  const pieceId = formatEditPopup.value.pieceId
  const currentPiece = contentPieces.value.find(piece => piece.id === pieceId)
  
  if (!currentPiece) {
    error.value = 'Content Piece nicht gefunden'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const updated = await updateContentPiece(pieceId, {
      ...currentPiece,
      format: newFormat
    })
    
    const index = contentPieces.value.findIndex(piece => piece.id === pieceId)
    if (index !== -1) {
      contentPieces.value[index] = updated
    }
    closeFormatEditPopup()
  } catch (err) {
    error.value = `Fehler beim Ändern des Formats: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`
  } finally {
    isLoading.value = false
  }
}

// Click außerhalb des Context Menus schließen
const handleClickOutside = (event: MouseEvent) => {
  if (contextMenu.value.visible) {
    const target = event.target as HTMLElement
    if (!target.closest('.context-menu') && !target.closest('.content-card')) {
      closeContextMenu()
    }
  }
}

// Card Click Handler (öffnet Format Edit Popup)
const handleCardClick = (event: MouseEvent, piece: ContentPiece) => {
  // Nur bei Linksklick öffnen, Rechtsklick für Context Menu
  if (event.button === 0 || event.type === 'click') {
    event.stopPropagation()
    openFormatEditPopup(piece)
  }
}

// Formular öffnen mit ausgewählter Spalte
const openCreateForm = (columnFormat: 'Reel' | 'Story' | 'Carousel') => {
  selectedColumn.value = columnFormat
  showCreateForm.value = true
  newContentTitle.value = ''
}

// Formular schließen
const closeCreateForm = () => {
  showCreateForm.value = false
  newContentTitle.value = ''
  error.value = null
}

onMounted(() => {
  loadContentPieces()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('contextmenu', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('contextmenu', handleClickOutside)
})
</script>

<template>
  <main class="ideation-view">
    <div class="container">
      <h1 class="page-title">Ideation</h1>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Kanban Board -->
      <div class="kanban-board">
        <div
          v-for="column in columns"
          :key="column.id"
          class="kanban-column"
        >
          <div class="column-header">
            <h2 class="column-title">{{ column.title }}</h2>
            <button
              @click="openCreateForm(column.format as 'Reel' | 'Story' | 'Carousel')"
              class="add-button"
              :aria-label="`Neues ${column.title} hinzufügen`"
            >
              +
            </button>
          </div>

          <div class="column-content">
            <div
              v-if="getContentByFormat(column.format).length === 0"
              class="empty-state"
            >
              <p>Keine Content Pieces</p>
            </div>

            <div
              v-for="piece in getContentByFormat(column.format)"
              :key="piece.id"
              class="content-card"
              @click="handleCardClick($event, piece)"
              @contextmenu="handleContextMenu($event, piece.id)"
            >
              <h3 class="card-title">{{ piece.title }}</h3>
              <div v-if="piece.contentPillar" class="card-pillar">
                {{ piece.contentPillar }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Context Menu -->
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
        @click.stop
      >
        <button class="context-menu-item delete" @click="deletePiece">
          <span>🗑️</span>
          <span>Löschen</span>
        </button>
      </div>

      <!-- Format Edit Popup Modal -->
      <div v-if="formatEditPopup.visible" class="modal-overlay" @click="closeFormatEditPopup">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Format ändern</h2>
            <button @click="closeFormatEditPopup" class="close-button">×</button>
          </div>

          <div class="format-edit-content">
            <p class="format-edit-description">Wählen Sie ein neues Format für dieses Content Piece:</p>
            
            <div class="format-options">
              <button
                v-for="format in columns"
                :key="format.id"
                @click="updateFormat(format.format as 'Reel' | 'Story' | 'Carousel')"
                class="format-option"
                :class="{ 
                  'format-option-active': formatEditPopup.currentFormat === format.format,
                  'format-option-disabled': isLoading
                }"
                :disabled="isLoading || formatEditPopup.currentFormat === format.format"
              >
                <span class="format-option-label">{{ format.title }}</span>
                <span v-if="formatEditPopup.currentFormat === format.format" class="format-option-current">
                  (Aktuell)
                </span>
              </button>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeFormatEditPopup" class="btn btn-secondary" :disabled="isLoading">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Form Modal -->
      <div v-if="showCreateForm" class="modal-overlay" @click="closeCreateForm">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Neues {{ selectedColumn }} erstellen</h2>
            <button @click="closeCreateForm" class="close-button">×</button>
          </div>

          <form @submit.prevent="createNewContentPiece" class="create-form">
            <div class="form-group">
              <label for="title">Name *</label>
              <input
                id="title"
                v-model="newContentTitle"
                type="text"
                placeholder="Content Piece Name"
                required
                autofocus
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Format</label>
              <div class="format-display">{{ selectedColumn }}</div>
              <p class="format-hint">Das Format wird automatisch basierend auf der Spalte zugeordnet.</p>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeCreateForm" class="btn btn-secondary">
                Abbrechen
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isLoading || !newContentTitle.trim()">
                {{ isLoading ? 'Erstelle...' : 'Erstellen' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.ideation-view {
  min-height: calc(100vh - 100px);
  padding: 2rem;
  background: #f5f7fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #fcc;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

.kanban-column {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 500px;
}

.column-header {
  padding: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #4252b9 0%, #667eea 100%);
  border-radius: 12px 12px 0 0;
}

.column-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.add-button {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-weight: 300;
  line-height: 1;
}

.add-button:hover {
  background: white;
  color: #4252b9;
  transform: scale(1.1);
}

.column-content {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 300px);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
  font-style: italic;
}

.content-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.content-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #4252b9;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.card-pillar {
  font-size: 0.875rem;
  color: #6b7280;
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

/* Context Menu Styles */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  z-index: 2000;
  min-width: 150px;
  transform: translate(-10px, -10px);
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #374151;
  transition: background-color 0.2s ease;
}

.context-menu-item:hover {
  background: #f3f4f6;
}

.context-menu-item.delete {
  color: #dc2626;
}

.context-menu-item.delete:hover {
  background: #fee2e2;
  color: #991b1b;
}

.context-menu-item span:first-child {
  font-size: 1.1rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1a1a1a;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #1a1a1a;
}

.create-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #4252b9;
}

.format-display {
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 8px;
  font-weight: 600;
  color: #4252b9;
  margin-bottom: 0.5rem;
}

.format-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
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
  background: #4252b9;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3448a8;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Format Edit Popup Styles */
.format-edit-content {
  padding: 1.5rem;
}

.format-edit-description {
  margin-bottom: 1.5rem;
  color: #374151;
  font-size: 1rem;
}

.format-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.format-option {
  padding: 1rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
}

.format-option:hover:not(.format-option-disabled):not(.format-option-active) {
  border-color: #4252b9;
  background: #f0f4ff;
  transform: translateX(4px);
}

.format-option-active {
  border-color: #4252b9;
  background: linear-gradient(135deg, #4252b9 0%, #667eea 100%);
  color: white;
  cursor: default;
}

.format-option-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.format-option-label {
  font-weight: 600;
}

.format-option-current {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 400;
}

/* Responsive */
@media (max-width: 1024px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .ideation-view {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .modal-content {
    max-width: 100%;
  }
}
</style>
