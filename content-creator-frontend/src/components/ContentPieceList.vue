<script setup lang="ts">
interface ContentPiece {
  id: number
  title: string
  contentPillar: string
  format: string
  status: string
  performance: string
}

const contentPieces: ContentPiece[] = [
  {
    id: 1,
    title: 'Tech Video 1',
    contentPillar: 'Tech',
    format: 'Talking Head',
    status: 'Ideation',
    performance: 'High'
  },
  {
    id: 2,
    title: 'Business Video 1',
    contentPillar: 'Business',
    format: 'List Video',
    status: 'Needs Scripting',
    performance: 'Medium'
  },
  {
    id: 3,
    title: 'Lifestyle Video 1',
    contentPillar: 'Lifestyle',
    format: 'Talking Head',
    status: 'Ready to Post',
    performance: 'High'
  }
]
</script>

<template>
  <div class="content-piece-list">
    <h2>Content Pieces</h2>
    <ul>
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
</style>
