<template>
  <div class="card">
    <div v-if="metadata" class="card-metadata">{{ metadata }}</div>
    <div v-else class="card-metadata">
      <slot></slot>
    </div>
    <div class="card-content">
      <CardTitle :src="src" class="card-title">
        <Sprite v-if="icon" class="label" :symbol="icon" />
        {{ this.src == '#' || this.src.startsWith('/') ? title : title + '&nearr;' }}
      </CardTitle>
      <div class="card-description">{{ description }}</div>
    </div>
  </div>
</template>

<script>
import Sprite from './Sprite'
import CardTitle from './CardTitle'

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
    CardTitle
  }
}
</script>
