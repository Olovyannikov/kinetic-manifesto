<template>
  <!-- Логотип MoscowJS слева внизу на всех слайдах -->
  <img src="/moscowjs-logo.png" alt="MoscowJS" class="slidev-brand-logo" />

  <!-- Номер слайда справа внизу, кроме титульного -->
  <div v-if="$slidev.nav.currentPage > 1" class="slidev-page-no">
    {{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}
  </div>
</template>
