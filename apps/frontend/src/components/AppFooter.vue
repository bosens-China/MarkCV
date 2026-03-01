<template>
  <footer class="app-footer">
    <p>© 2026 {{ PROJECT_NAME }}</p>
  </footer>
</template>

<script setup lang="ts">
import { PROJECT_NAME } from '../constants';
</script>

<style scoped>
.app-footer {
  padding: 24px;
  text-align: center;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.app-footer p {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}
</style>
