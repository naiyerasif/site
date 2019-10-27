<template>
  <section class="postcard rounded-none md:rounded">
    <div class="postcard-metadata">
      <g-link :class="{'font-bold': i === 0}" class="tag" v-for="(tag, i) in item.tags" :key="tag.id" :to="tag.path">
        <span>#</span>{{ tag.title }}
      </g-link>
      {{ item.hasOwnProperty("updated") && item.updated !== item.date ? 'Updated ' + item.updated : 'Published ' + item.date }} <span class="opacity-50">&sol;</span> {{ item.timeToRead }} min read
    </div>
    <g-link :to="item.path" class="postcard-title text-content-body hover:text-primary-700">
      <h2 class="text-2xl md:text-3xl font-semibold mb-2">{{ item.title }}</h2>
      <div class="font-normal">{{ item.summary }}</div>
    </g-link>
  </section>
</template>

<script>
export default {
  props: ['item']
}
</script>

<style scoped>
.postcard {
  @apply bg-background-postcard w-full overflow-hidden shadow p-6;
}

.postcard-metadata {
  @apply tracking-wide text-xs mb-2;
}

.postcard-title {
  @apply my-1;
}
</style>
