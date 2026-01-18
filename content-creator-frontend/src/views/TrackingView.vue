<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchContentPieces, type ContentPiece } from '@/services/api'

const router = useRouter()
const allContentPieces = ref<ContentPiece[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Filter State
const performanceFilter = ref<string>('all')
const sortOrder = ref<'newest' | 'oldest'>('newest')

// Nur hochgeladene Content Pieces
const uploadedPieces = computed(() => {
  return allContentPieces.value.filter(piece => piece.status === 'Uploaded')
})

// Gefilterte und sortierte Pieces
const filteredPieces = computed(() => {
  let pieces = [...uploadedPieces.value]
  
  // Performance Filter
  if (performanceFilter.value !== 'all') {
    pieces = pieces.filter(piece => piece.performance === performanceFilter.value)
  }
  
  // Sortierung nach Upload Datum
  pieces.sort((a, b) => {
    const dateA = a.uploadDate ? new Date(a.uploadDate).getTime() : 0
    const dateB = b.uploadDate ? new Date(b.uploadDate).getTime() : 0
    return sortOrder.value === 'newest' ? dateB - dateA : dateA - dateB
  })
  
  return pieces
})

// Statistiken
const stats = computed(() => {
  const pieces = uploadedPieces.value
  return {
    total: pieces.length,
    viral: pieces.filter(p => p.performance === 'Viral').length,
    good: pieces.filter(p => p.performance === 'Good').length,
    mid: pieces.filter(p => p.performance === 'Mid').length,
    bad: pieces.filter(p => p.performance === 'Bad').length,
    unrated: pieces.filter(p => !p.performance).length,
  }
})

// Content Pieces laden
const loadContentPieces = async () => {
  isLoading.value = true
  error.value = null
  try {
    allContentPieces.value = await fetchContentPieces()
  } catch (err) {
    error.value = 'Fehler beim Laden der Content Pieces'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Zur Detail-Ansicht navigieren
const goToDetail = (piece: ContentPiece) => {
  router.push(`/content/${piece.id}`)
}

// Performance Badge Klasse
const getPerformanceClass = (performance: string) => {
  const classes: Record<string, string> = {
    'Viral': 'performance-viral',
    'Good': 'performance-good',
    'Mid': 'performance-mid',
    'Bad': 'performance-bad'
  }
  return classes[performance] || 'performance-none'
}

// Datum formatieren
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Link kürzen
const shortenLink = (link?: string) => {
  if (!link) return '-'
  try {
    const url = new URL(link)
    return url.hostname.replace('www.', '')
  } catch {
    return link.substring(0, 30) + '...'
  }
}

onMounted(() => {
  loadContentPieces()
})
</script>

<template>
  <main class="tracking-view">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Performance Tracking</h1>
        <p class="page-subtitle">Übersicht aller veröffentlichten Content Pieces</p>
      </div>

      <!-- Statistiken -->
      <div class="stats-grid">
        <div class="stat-card stat-total">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">Gesamt</span>
        </div>
        <div class="stat-card stat-viral">
          <span class="stat-value">{{ stats.viral }}</span>
          <span class="stat-label">Viral</span>
        </div>
        <div class="stat-card stat-good">
          <span class="stat-value">{{ stats.good }}</span>
          <span class="stat-label">Good</span>
        </div>
        <div class="stat-card stat-mid">
          <span class="stat-value">{{ stats.mid }}</span>
          <span class="stat-label">Mid</span>
        </div>
        <div class="stat-card stat-bad">
          <span class="stat-value">{{ stats.bad }}</span>
          <span class="stat-label">Bad</span>
        </div>
        <div class="stat-card stat-unrated">
          <span class="stat-value">{{ stats.unrated }}</span>
          <span class="stat-label">Unbewertet</span>
        </div>
      </div>

      <!-- Filter & Sortierung -->
      <div class="filter-bar">
        <div class="filter-group">
          <label class="filter-label">Performance:</label>
          <select v-model="performanceFilter" class="filter-select">
            <option value="all">Alle</option>
            <option value="Viral">Viral</option>
            <option value="Good">Good</option>
            <option value="Mid">Mid</option>
            <option value="Bad">Bad</option>
            <option value="">Unbewertet</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Sortierung:</label>
          <select v-model="sortOrder" class="filter-select">
            <option value="newest">Neueste zuerst</option>
            <option value="oldest">Älteste zuerst</option>
          </select>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading">
        Lade Content Pieces...
      </div>

      <!-- Empty State -->
      <div v-else-if="uploadedPieces.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <h2>Noch keine veröffentlichten Inhalte</h2>
        <p>Sobald du Content Pieces auf "Uploaded" setzt, erscheinen sie hier.</p>
      </div>

      <!-- Filtered Empty State -->
      <div v-else-if="filteredPieces.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h2>Keine Ergebnisse</h2>
        <p>Keine Content Pieces mit diesem Filter gefunden.</p>
        <button @click="performanceFilter = 'all'" class="btn btn-secondary">
          Filter zurücksetzen
        </button>
      </div>

      <!-- Content Table -->
      <div v-else class="table-container">
        <table class="content-table">
          <thead>
            <tr>
              <th>Titel</th>
              <th>Format</th>
              <th>Pillar</th>
              <th>Upload Datum</th>
              <th>Performance</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="piece in filteredPieces" 
              :key="piece.id"
              @click="goToDetail(piece)"
              class="table-row"
            >
              <td class="cell-title">{{ piece.title }}</td>
              <td>
                <span class="badge badge-format">{{ piece.format }}</span>
              </td>
              <td>
                <span v-if="piece.contentPillar" class="badge badge-pillar">
                  {{ piece.contentPillar }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ formatDate(piece.uploadDate) }}</td>
              <td>
                <span 
                  class="badge"
                  :class="getPerformanceClass(piece.performance)"
                >
                  {{ piece.performance || 'Unbewertet' }}
                </span>
              </td>
              <td>
                <a 
                  v-if="piece.link" 
                  :href="piece.link" 
                  target="_blank" 
                  @click.stop
                  class="link"
                >
                  {{ shortenLink(piece.link) }} ↗
                </a>
                <span v-else class="text-muted">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<style scoped>
.tracking-view {
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid;
}

.stat-total { border-color: #6b7280; }
.stat-viral { border-color: #10b981; }
.stat-good { border-color: #3b82f6; }
.stat-mid { border-color: #f59e0b; }
.stat-bad { border-color: #ef4444; }
.stat-unrated { border-color: #9ca3af; }

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  font-weight: 500;
  color: #374151;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  background: white;
}

.filter-select:focus {
  outline: none;
  border-color: #4252b9;
}

/* Messages */
.error-message {
  background: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #fcc;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1.2rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
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

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

/* Table */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.content-table {
  width: 100%;
  border-collapse: collapse;
}

.content-table th {
  background: #f9fafb;
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  border-bottom: 2px solid #e5e7eb;
}

.content-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.table-row {
  cursor: pointer;
  transition: background 0.2s ease;
}

.table-row:hover {
  background: #f9fafb;
}

.cell-title {
  font-weight: 600;
  color: #1a1a1a;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-format {
  background: #e0e7ff;
  color: #4338ca;
}

.badge-pillar {
  background: #fef3c7;
  color: #92400e;
}

.performance-viral {
  background: #d1fae5;
  color: #065f46;
}

.performance-good {
  background: #dbeafe;
  color: #1e40af;
}

.performance-mid {
  background: #fef3c7;
  color: #92400e;
}

.performance-bad {
  background: #fee2e2;
  color: #991b1b;
}

.performance-none {
  background: #f3f4f6;
  color: #6b7280;
}

.text-muted {
  color: #9ca3af;
}

.link {
  color: #4252b9;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-bar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .content-table {
    min-width: 800px;
  }
}

@media (max-width: 600px) {
  .tracking-view {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
