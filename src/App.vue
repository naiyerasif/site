<template>
  <transition appear name="fade" mode="out-in">
    <router-view />
  </transition>
</template>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateZ(-100px);
  }
  to {
    opacity: 1;
    transform: translateZ(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateZ(0);
  }
  to {
    opacity: 0;
    transform: translateZ(-100px);
  }
}

.fade-enter-active,
.fade-leave-active {
  animation-duration: 500ms;
  transition-duration: 500ms;
  animation-fill-mode: both;
  transition-timing-function: ease-out;
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
  
}

.fade-leave-active {
  animation-name: fadeOut;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
