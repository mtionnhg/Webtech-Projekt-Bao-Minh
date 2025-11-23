<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchContentPieces, type ContentPiece } from '../services/api'

const contentPieces = ref<ContentPiece[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    contentPieces.value = await fetchContentPieces()
  } catch (err) {
    error.value = 'Failed to load content pieces. Please try again later.'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="content-piece-list">
    <h2>Content Pieces</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
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

h2 {
  margin-bottom: 1.5rem;
  color: var(--color-heading);
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
}
</style>
