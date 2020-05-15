<template>
  <transition appear name="fade">
    <router-view />
  </transition>
</template>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  animation-duration: 500ms;
  transition-duration: 500ms;
  animation-fill-mode: both;
}

@media (print), (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    animation-duration: 1ms;
    transition-duration: 1ms;
    animation-iteration-count: 1;
  }
}

.fade-enter-active {
  animation-name: fadeIn;
  transition-timing-function: ease-in;
}

.fade-leave-active {
  animation-name: fadeOut;
  transition-timing-function: ease-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
