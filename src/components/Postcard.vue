<template>
  <div class="postcard rounded-none md:rounded bg-background-postcard hover:bg-background-postcardh">
    <div class="postcard-metadata">
      <g-link class="tag" v-for="tag in item.tags" :key="tag.id" :to="tag.path">
        <span>#</span>{{ tag.title }}
      </g-link>
      {{ displayDate }} <span class="opacity-50">&sol;</span> {{ item.timeToRead }} min read
    </div>
    <g-link :to="item.path" class="postcard-title text-content-body hover:text-primary-700">
      <h2 class="text-2xl font-semibold mb-2">{{ item.title }}</h2>
      <div class="text-sm font-normal">{{ summary }}</div>
    </g-link>
  </div>
</template>

<script>
export default {
  props: ['item'],
  computed: {
    displayDate() {
      return !this.item.hasOwnProperty("updated") ? this.item.date : (this.item.updated != this.item.date ? `Updated ${this.item.updated}` : `Published ${this.item.date}`);
    },
    summary() {
      const maxLength = 260;
      const titleLength = Math.round(this.item.title.length * 2.3);
      if ((this.item.summary.length + titleLength) <= maxLength) {
        return this.item.summary
      } else {
        const lastIdxOfWord = this.item.summary.lastIndexOf(' ', maxLength - titleLength);
        return this.item.summary.substr(0, lastIdxOfWord) + ' …'
      }
    }
  }
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
  @apply block my-1;
}
</style>
