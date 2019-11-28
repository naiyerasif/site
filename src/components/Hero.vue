<template>
  <section class="container hero">
    <h1 v-if="item">{{ item.title }}</h1>
    <h1 v-else><slot /></h1>
    <PostContext v-if="item && item.post" :authors="item.authors" :tags="item.tags" :timeToRead="item.timeToRead" :date="item.date" />
  </section>
</template>

<script>
import PostContext from './PostContext'

export default {
  props: ['item'],
  components: {
    PostContext
  }
}
</script>

<style lang="scss" scoped>
.hero {
  margin-top: $gap-xs;
  margin-bottom: $gap;
  width: $expanse-full;

  @include tablet-portrait {
    margin-top: $gap-sm;
    margin-bottom: $gap-md;
  }

  @include tablet-portrait {
    margin-top: $gap;
    margin-bottom: $gap-lg;
  }

  h1 {
    font-size: $text-xl;
    font-weight: $font-semibold;
    line-height: 1.25;

    @include tablet-portrait {
      font-size: $text-3xl;
      width: $expanse-half * 1.5;
    }
  }

  a {
    &:focus, &:hover {
      text-decoration: none;
    }
  }
}
</style>
