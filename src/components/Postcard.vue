<template>
  <g-link :to="item.path" class="postcard rounded-none md:rounded bg-background-postcard hover:bg-background-postcardh text-content-body hover:text-primary-700">
    <div class="postcard-metadata">
      <g-link class="tag" v-for="tag in item.tags" :key="tag.id" :to="tag.path">
        <span>#</span>{{ tag.title }}
      </g-link>
      {{ item.hasOwnProperty("updated") && item.updated !== item.date ? 'Updated ' + item.updated : 'Published ' + item.date }} <span class="opacity-50">&sol;</span> {{ item.timeToRead }} min read
    </div>
    <div class="postcard-title">
      <h2 class="text-2xl font-semibold mb-2">{{ item.title }}</h2>
      <div class="font-normal">{{ item.summary }}</div>
    </div>
  </g-link>
</template>

<script>
export default {
  props: ['item']
}
</script>

<style scoped>
.postcard {
  @apply w-full overflow-hidden shadow p-6 z-0;
}

.postcard-metadata {
  @apply tracking-wide text-xs mb-2 text-content-body;
}

.postcard-title {
  @apply my-1;
}
</style>
