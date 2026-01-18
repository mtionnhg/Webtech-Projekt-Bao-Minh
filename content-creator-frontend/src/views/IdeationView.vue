<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchContentPieces, createContentPiece, deleteContentPiece, updateContentPiece, type ContentPiece } from '@/services/api'

const router = useRouter()
const contentPieces = ref<ContentPiece[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Formular State
const showCreateForm = ref(false)
const newContentTitle = ref('')
const selectedColumn = ref<'Talking Head' | 'List' | 'Voice Over'>('Talking Head')

// Drag State
const draggedPiece = ref<ContentPiece | null>(null)
const dragOverColumn = ref<string | null>(null)

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

// Spalten Definition - Nur die 3 Content-Formate
const columns = [
  { id: 'Talking Head', title: 'Talking Head', color: '#f59e0b' },
  { id: 'List', title: 'List', color: '#10b981' },
  { id: 'Voice Over', title: 'Voice Over', color: '#06b6d4' }
]

// Gefilterte Content Pieces pro Spalte (nur Status "Ideation")
const getContentByFormat = (format: string) => {
  return contentPieces.value.filter(piece => piece.format === format && piece.status === 'Ideation')
}

// Anzahl pro Format
const getCountByFormat = (format: string) => {
  return getContentByFormat(format).length
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

// Drag & Drop Handler
const onDragStart = (event: DragEvent, piece: ContentPiece) => {
  draggedPiece.value = piece
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', piece.id.toString())
  }
  const target = event.target as HTMLElement
  setTimeout(() => target.classList.add('dragging'), 0)
}

const onDragEnd = (event: DragEvent) => {
  const target = event.target as HTMLElement
  target.classList.remove('dragging')
  draggedPiece.value = null
  dragOverColumn.value = null
}

const onDragOver = (event: DragEvent, format: string) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragOverColumn.value = format
}

const onDragLeave = (event: DragEvent) => {
  const relatedTarget = event.relatedTarget as HTMLElement
  if (!relatedTarget?.closest('.kanban-column')) {
    dragOverColumn.value = null
  }
}

const onDrop = async (event: DragEvent, newFormat: string) => {
  event.preventDefault()
  dragOverColumn.value = null

  if (!draggedPiece.value) return
  
  const piece = draggedPiece.value
  const oldFormat = piece.format
  
  if (oldFormat === newFormat) {
    draggedPiece.value = null
    return
  }

  // Optimistic Update
  piece.format = newFormat

  try {
    await updateContentPiece(piece.id, piece)
  } catch (err) {
    // Rollback bei Fehler
    piece.format = oldFormat
    error.value = 'Fehler beim Aktualisieren des Formats'
    console.error(err)
  }

  draggedPiece.value = null
}

// Zur Detail-Ansicht navigieren
const goToDetail = (piece: ContentPiece) => {
  router.push(`/content/${piece.id}`)
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
    contentPieces.value = contentPieces.value.filter(piece => piece.id !== pieceId)
  } catch (err) {
    error.value = 'Fehler beim Löschen des Content Pieces'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Click außerhalb des Context Menus schließen
const handleClickOutside = (event: MouseEvent) => {
  if (contextMenu.value.visible) {
    const target = event.target as HTMLElement
    if (!target.closest('.context-menu')) {
      closeContextMenu()
    }
  }
}

// Formular öffnen mit ausgewählter Spalte
const openCreateForm = (columnFormat: 'Talking Head' | 'List' | 'Voice Over') => {
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

// Pillar Badge Farbe
const getPillarColor = (pillar: string) => {
  const colors: Record<string, string> = {
    'Top of Funnel': '#10b981',
    'Middle of Funnel': '#f59e0b',
    'Bottom of Funnel': '#ef4444'
  }
  return colors[pillar] || '#6b7280'
}

onMounted(() => {
  loadContentPieces()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <main class="ideation-view">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Ideation</h1>
        <p class="page-subtitle">Neue Content-Ideen nach Format sortieren (nur Status: Ideation)</p>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
        <button @click="error = null" class="error-close">×</button>
      </div>

      <div v-if="isLoading && contentPieces.length === 0" class="loading">
        Lade Content Pieces...
      </div>

      <!-- Kanban Board -->
      <div class="kanban-board" v-else>
        <div
          v-for="column in columns"
          :key="column.id"
          class="kanban-column"
          :class="{ 'drag-over': dragOverColumn === column.id }"
          @dragover="onDragOver($event, column.id)"
          @dragleave="onDragLeave"
          @drop="onDrop($event, column.id)"
        >
          <div class="column-header" :style="{ borderColor: column.color }">
            <div class="column-title-wrapper">
              <span class="column-dot" :style="{ backgroundColor: column.color }"></span>
              <h2 class="column-title">{{ column.title }}</h2>
            </div>
            <div class="column-header-right">
              <span class="column-count">{{ getCountByFormat(column.id) }}</span>
              <button
                @click="openCreateForm(column.id as 'Talking Head' | 'List' | 'Voice Over')"
                class="add-button"
                :aria-label="`Neues ${column.title} hinzufügen`"
              >
                +
              </button>
            </div>
          </div>

          <div class="column-content">
            <div
              v-if="getContentByFormat(column.id).length === 0"
              class="empty-state"
            >
              <p>Keine Content Pieces</p>
            </div>

            <div
              v-for="piece in getContentByFormat(column.id)"
              :key="piece.id"
              class="content-card"
              draggable="true"
              @dragstart="onDragStart($event, piece)"
              @dragend="onDragEnd"
              @click="goToDetail(piece)"
              @contextmenu="handleContextMenu($event, piece.id)"
            >
              <h3 class="card-title">{{ piece.title }}</h3>
              <div class="card-badges">
                <span 
                  v-if="piece.contentPillar" 
                  class="badge"
                  :style="{ backgroundColor: getPillarColor(piece.contentPillar) }"
                >
                  {{ piece.contentPillar }}
                </span>
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

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #fcc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #c33;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1.2rem;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.kanban-column {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  min-height: 500px;
  transition: all 0.2s ease;
}

.kanban-column.drag-over {
  background: #f0f4ff;
  box-shadow: 0 4px 12px rgba(66, 82, 185, 0.2);
  transform: scale(1.02);
}

.column-header {
  padding: 1.25rem;
  border-bottom: 3px solid;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.column-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.column-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.column-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.column-count {
  background: #e5e7eb;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
}

.add-button {
  background: #4252b9;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.add-button:hover {
  background: #3448a8;
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
  padding: 2rem 1rem;
  color: #9ca3af;
  font-style: italic;
}

.content-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.content-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #4252b9;
}

.content-card.dragging {
  opacity: 0.5;
  transform: rotate(3deg);
  cursor: grabbing;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.badge {
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: white;
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
  max-width: 450px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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
  font-size: 1.25rem;
  color: #1a1a1a;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.75rem;
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
}

.close-button:hover {
  background: #f3f4f6;
  color: #1a1a1a;
}

.create-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
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
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #4252b9;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3448a8;
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
}
</style>
