<template>
  <StitchedCard :src="src">
    <div v-if="metadata" class="card-metadata">{{ metadata }}</div>
    <div v-else class="card-metadata">
      <slot></slot>
    </div>
    <div class="card-content">
      <div class="card-title">
        <Sprite v-if="icon" class="label" :symbol="icon" />
        {{ this.src == '#' || this.src.startsWith('/') ? title : title + '&nearr;' }}
      </div>
      <div class="card-description">{{ description }}</div>
    </div>
  </StitchedCard>
</template>

<script>
import Sprite from './Sprite'
import StitchedCard from './StitchedCard'

export default {
  props: {
    metadata: String,
    title: String,
    description: String,
    icon: String,
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
