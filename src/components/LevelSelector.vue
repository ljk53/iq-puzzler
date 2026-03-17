<template>
  <div class="level-selector">
    <div class="level-label">Levels</div>
    <div
      v-for="(group, difficulty) in groupedLevels"
      :key="difficulty"
      class="level-group"
    >
      <span class="difficulty-label">{{ difficulty }}</span>
      <div class="level-buttons">
        <button
          v-for="level in group"
          :key="level.id"
          class="level-btn"
          :class="{ active: store.currentLevel?.id === level.id }"
          @click="store.loadLevel(levelIndex(level.id))"
        >
          {{ level.id }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'
import { levels } from '../utils/levels'

const store = useGameStore()

const groupedLevels = computed(() => {
  const groups = {}
  for (const level of levels) {
    if (!groups[level.difficulty]) groups[level.difficulty] = []
    groups[level.difficulty].push(level)
  }
  return groups
})

function levelIndex(id) {
  return levels.findIndex(l => l.id === id)
}
</script>

<style scoped>
.level-selector {
  background: #222;
  border-radius: 10px;
  padding: 10px;
}

.level-label {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 8px;
  padding-left: 4px;
}

.level-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.difficulty-label {
  font-size: 0.65rem;
  color: #aaa;
  text-transform: uppercase;
  min-width: 50px;
}

.level-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.level-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.level-btn.active {
  background: #f0c040;
  color: #000;
  border-color: #f0c040;
}
</style>
