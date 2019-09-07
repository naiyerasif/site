<template>
  <section class="postcard">
    <div class="text-content-body text-xs">{{ item.hasOwnProperty("updated") && item.updated !== item.date ? 'Updated ' + item.updated : 'Published ' + item.date }} &middot; {{ item.timeToRead }} min read</div>
    <g-link :to="item.path" class="text-content-body">
      <h2 class="text-2xl md:text-3xl font-semibold mb-2">{{ item.title }} <svg class="inline mb-1" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></h2>
      <div class="font-normal mb-4">{{ item.summary }}</div>
    </g-link>
    
    <div class="mb-8">
      <g-link :class="{'font-bold': i === 0}" class="tag" v-for="(tag, i) in item.tags" :key="tag.id" :to="tag.path">
        <span v-if="i !== 0">#</span>{{ tag.title }}
      </g-link>
    </div>
  </section>
</template>

<script>
export default {
  props: ['item']
}
</script>
