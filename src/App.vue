<template>
  <transition appear name="fade" mode="out-in">
    <router-view />
  </transition>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/mixins/animate' as *;

@include transform-with-opacity(fadeIn, 0, translateZ(-100%), 1, translateZ(0));
@include transform-with-opacity(fadeOut, 1, translateZ(0%), 0, translateZ(-100%));

.fade-enter-active {
  @include animate(fadeIn, $timing-fn: ease-out);
}

.fade-leave-active {
  @include animate(fadeOut, $timing-fn: ease-out);
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
