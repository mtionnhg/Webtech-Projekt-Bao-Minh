<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchContentPieces, updateContentStatus, type ContentPiece } from '@/services/api'

const router = useRouter()
const contentPieces = ref<ContentPiece[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Drag State
const draggedPiece = ref<ContentPiece | null>(null)
const dragOverColumn = ref<string | null>(null)

// Status-Spalten Definition (Workflow-Reihenfolge)
const statusColumns = [
  { id: 'Ideation', title: 'Ideation', color: '#8b5cf6' },
  { id: 'Scripting', title: 'Scripting', color: '#3b82f6' },
  { id: 'Filming', title: 'Filming', color: '#f59e0b' },
  { id: 'Editing', title: 'Editing', color: '#ef4444' },
  { id: 'Ready 2 Upload', title: 'Ready 2 Upload', color: '#10b981' },
  { id: 'Uploaded', title: 'Uploaded', color: '#06b6d4' }
]

// Content Pieces nach Status gruppiert
const getContentByStatus = (status: string) => {
  return contentPieces.value.filter(piece => piece.status === status)
}

// Anzahl pro Status
const getCountByStatus = (status: string) => {
  return getContentByStatus(status).length
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

// Drag & Drop Handler
const onDragStart = (event: DragEvent, piece: ContentPiece) => {
  draggedPiece.value = piece
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', piece.id.toString())
  }
  // Visuelles Feedback
  const target = event.target as HTMLElement
  setTimeout(() => target.classList.add('dragging'), 0)
}

const onDragEnd = (event: DragEvent) => {
  const target = event.target as HTMLElement
  target.classList.remove('dragging')
  draggedPiece.value = null
  dragOverColumn.value = null
}

const onDragOver = (event: DragEvent, status: string) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragOverColumn.value = status
}

const onDragLeave = (event: DragEvent) => {
  // Nur zurücksetzen wenn wir die Spalte wirklich verlassen
  const relatedTarget = event.relatedTarget as HTMLElement
  if (!relatedTarget?.closest('.kanban-column')) {
    dragOverColumn.value = null
  }
}

const onDrop = async (event: DragEvent, newStatus: string) => {
  event.preventDefault()
  dragOverColumn.value = null

  if (!draggedPiece.value) return
  
  const piece = draggedPiece.value
  const oldStatus = piece.status
  
  // Wenn gleicher Status, nichts tun
  if (oldStatus === newStatus) {
    draggedPiece.value = null
    return
  }

  // Optimistic Update
  piece.status = newStatus

  try {
    await updateContentStatus(piece.id, newStatus)
  } catch (err) {
    // Rollback bei Fehler
    piece.status = oldStatus
    error.value = 'Fehler beim Aktualisieren des Status'
    console.error(err)
  }

  draggedPiece.value = null
}

// Zur Detail-Ansicht navigieren
const goToDetail = (piece: ContentPiece) => {
  router.push(`/content/${piece.id}`)
}

// Format Badge Farbe
const getFormatColor = (format: string) => {
  const colors: Record<string, string> = {
    'Reel': '#ec4899',
    'Story': '#8b5cf6',
    'Carousel': '#3b82f6',
    'Talking Head': '#f59e0b',
    'List': '#10b981',
    'Voice Over': '#06b6d4'
  }
  return colors[format] || '#6b7280'
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
})
</script>

<template>
  <main class="workflow-view">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Workflow Board</h1>
        <p class="page-subtitle">Ziehe Content Pieces zwischen den Status-Spalten</p>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
        <button @click="error = null" class="error-close">×</button>
      </div>

      <div v-if="isLoading" class="loading">
        Lade Content Pieces...
      </div>

      <!-- Kanban Board -->
      <div class="kanban-board" v-else>
        <div
          v-for="column in statusColumns"
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
            <span class="column-count">{{ getCountByStatus(column.id) }}</span>
          </div>

          <div class="column-content">
            <div
              v-if="getContentByStatus(column.id).length === 0"
              class="empty-state"
            >
              <p>Keine Pieces</p>
            </div>

            <div
              v-for="piece in getContentByStatus(column.id)"
              :key="piece.id"
              class="content-card"
              draggable="true"
              @dragstart="onDragStart($event, piece)"
              @dragend="onDragEnd"
              @click="goToDetail(piece)"
            >
              <h3 class="card-title">{{ piece.title }}</h3>
              
              <div class="card-badges">
                <span 
                  v-if="piece.format" 
                  class="badge format-badge"
                  :style="{ backgroundColor: getFormatColor(piece.format) }"
                >
                  {{ piece.format }}
                </span>
                <span 
                  v-if="piece.contentPillar" 
                  class="badge pillar-badge"
                  :style="{ backgroundColor: getPillarColor(piece.contentPillar) }"
                >
                  {{ piece.contentPillar }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.workflow-view {
  min-height: calc(100vh - 100px);
  padding: 2rem;
  background: #f5f7fa;
}

.container {
  max-width: 1600px;
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
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.kanban-column {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  min-height: 500px;
  min-width: 220px;
  transition: all 0.2s ease;
}

.kanban-column.drag-over {
  background: #f0f4ff;
  box-shadow: 0 4px 12px rgba(66, 82, 185, 0.2);
  transform: scale(1.02);
}

.column-header {
  padding: 1rem;
  border-bottom: 3px solid;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.column-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.column-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.column-count {
  background: #e5e7eb;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  min-width: 24px;
  text-align: center;
}

.column-content {
  padding: 0.75rem;
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 300px);
}

.empty-state {
  text-align: center;
  padding: 2rem 0.5rem;
  color: #9ca3af;
  font-size: 0.9rem;
  font-style: italic;
}

.content-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.875rem;
  margin-bottom: 0.5rem;
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
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
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

/* Responsive */
@media (max-width: 1400px) {
  .kanban-board {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .kanban-board {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .workflow-view {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .kanban-board {
    grid-template-columns: 1fr;
  }
}
</style>
