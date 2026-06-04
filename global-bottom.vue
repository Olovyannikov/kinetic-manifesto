<template>
  <!-- Номер слайда на всех слайдах, кроме титульного -->
  <div v-if="$slidev.nav.currentPage > 1" class="slidev-page-no">
    {{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}
  </div>
</template>
