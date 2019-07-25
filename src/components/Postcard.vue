<template>
  <section class="postcard">
    <div class="text-copy-quaternary text-xs">{{ item.date }} &middot; {{ item.timeToRead }} min read</div>
    <g-link :to="item.path" class="text-copy-primary">
      <h2 class="text-3xl font-semibold mb-2">{{ item.title }} <svg class="inline mb-1" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></h2>
      <div class="text-copy-quaternary font-normal mb-4">{{ item.summary }}</div>
    </g-link>
    
    <div class="text-copy-secondary text-gray-700 mb-8">
      <g-link class="bg-background-tertiary text-copy-tertiary hover:text-copy-tertiary rounded-full px-2 py-1 mr-2 text-xs" v-for="tag in item.tags" :key="tag.id" :to="tag.path">
        <span>#</span>{{ tag.title }}
      </g-link>
    </div>
  </section>
</template>

<script>
export default {
  props: ['item']
}
</script>
