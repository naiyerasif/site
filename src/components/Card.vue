<template>
  <StitchedCard :src="src" :class="{ 'large-gap': large }">
    <div v-if="metadata" class="card-metadata">{{ metadata }}</div>
    <div v-else class="card-metadata">
      <slot></slot>
    </div>
    <div class="card-title" :class="{ 'large-title': large }">
      <Sprite v-if="icon" class="label" :symbol="icon" />
      {{ this.src == '#' || this.src.startsWith('/') ? title : title + '&nearr;' }}
    </div>
    <div class="card-description">{{ description }}</div>
  </StitchedCard>
</template>

<script>
import Sprite from './Sprite'
import StitchedCard from './partials/StitchedCard'

export default {
  props: {
    metadata: String,
    title: String,
    description: String,
    icon: String,
    large: Boolean,
    src: {
      type: String,
      default: '#'
    }
  },
  components: {
    Sprite,
    StitchedCard
  }
}
</script>
