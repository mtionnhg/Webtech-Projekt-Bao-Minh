<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchContentPieces, createContentPiece, type ContentPiece } from '../services/api'

const contentPieces = ref<ContentPiece[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showForm = ref(false)
const submitting = ref(false)

// Formular-Daten
const formData = ref({
  title: '',
  contentPillar: '',
  format: '',
  status: '',
  performance: '',
  notes: ''
})

const loadContentPieces = async () => {
  loading.value = true
  error.value = null
  try {
    console.log('Loading content pieces...')
    contentPieces.value = await fetchContentPieces()
    console.log('Content pieces loaded:', contentPieces.value)
  } catch (err) {
    console.error('Error loading content pieces:', err)
    error.value = `Failed to load content pieces: ${err instanceof Error ? err.message : 'Unknown error'}. Please check the browser console for details.`
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  submitting.value = true
  error.value = null
  try {
    const newPiece = await createContentPiece(formData.value)
    console.log('Content piece created:', newPiece)
    // Formular zurücksetzen
    formData.value = {
      title: '',
      contentPillar: '',
      format: '',
      status: '',
      performance: '',
      notes: ''
    }
    showForm.value = false
    // Liste neu laden
    await loadContentPieces()
  } catch (err) {
    console.error('Error creating content piece:', err)
    error.value = `Failed to create content piece: ${err instanceof Error ? err.message : 'Unknown error'}. Please check the browser console for details.`
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadContentPieces()
})
</script>

<template>
  <div class="content-piece-list">
    <div class="header">
      <h2>Content Pieces</h2>
      <button @click="showForm = !showForm" class="btn-add">
        {{ showForm ? 'Abbrechen' : '+ Neues Content Piece' }}
      </button>
    </div>

    <!-- Formular zum Erstellen -->
    <div v-if="showForm" class="form-container">
      <h3>Neues Content Piece erstellen</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">Titel *</label>
          <input id="title" v-model="formData.title" required />
        </div>
        <div class="form-group">
          <label for="contentPillar">Content Pillar *</label>
          <input id="contentPillar" v-model="formData.contentPillar" required />
        </div>
        <div class="form-group">
          <label for="format">Format *</label>
          <input id="format" v-model="formData.format" required />
        </div>
        <div class="form-group">
          <label for="status">Status *</label>
          <input id="status" v-model="formData.status" required />
        </div>
        <div class="form-group">
          <label for="performance">Performance *</label>
          <input id="performance" v-model="formData.performance" required />
        </div>
        <div class="form-group">
          <label for="notes">Notizen</label>
          <textarea id="notes" v-model="formData.notes" rows="3"></textarea>
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="submitting" class="btn-submit">
            {{ submitting ? 'Wird erstellt...' : 'Erstellen' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="error && !showForm" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">Loading...</div>
    <ul v-else>
      <li v-for="piece in contentPieces" :key="piece.id" class="content-item">
        <h3>{{ piece.title }}</h3>
        <p><strong>Pillar:</strong> {{ piece.contentPillar }}</p>
        <p><strong>Format:</strong> {{ piece.format }}</p>
        <p><strong>Status:</strong> {{ piece.status }}</p>
        <p><strong>Performance:</strong> {{ piece.performance }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.content-piece-list {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

h2 {
  margin: 0;
  color: var(--color-heading);
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #35a372;
}

.form-container {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.form-container h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--color-heading);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  background: var(--color-background);
  color: var(--color-text);
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  margin-top: 1.5rem;
}

.btn-submit {
  padding: 0.75rem 2rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #35a372;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.content-item {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.content-item h3 {
  margin-top: 0;
  color: var(--color-heading);
}

.content-item p {
  margin: 0.5rem 0;
  color: var(--color-text);
}

.loading {
  padding: 2rem;
  text-align: center;
  color: var(--color-text);
}

.error {
  padding: 2rem;
  text-align: center;
  color: #ff4444;
  background: var(--color-background-soft);
  border: 1px solid #ff4444;
  border-radius: 8px;
  margin-bottom: 1rem;
}
</style>
