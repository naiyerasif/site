<template>
  <div class="container grid-lg">
    <div class="grid-lg-cell" v-for="post in posts" :key="post.id">
      <div class="panel card">
        <div class="card-header">
          <g-link v-for="tag in post.node.tags" :key="tag.id" :to="tag.path">
            #{{ tag.title }}
          </g-link>
          <span class="translucent">&sol;</span> {{ displayDate(post.node) }} <span class="translucent">&sol;</span> {{ post.node.timeToRead }} min read
        </div>
        <g-link :to="post.node.path">
          <h2 class="card-body">{{ post.node.title }}</h2>
          <p class="card-footer">{{ post.node.blurb | clip }} &hellip;</p>
        </g-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['posts'],
  methods: {
    displayDate(post) {
      const published = `Published ${post.date}`
      return !post.hasOwnProperty('updated') ? published : (post.updated !== post.date ? `Updated ${post.updated}` : published); 
    }
  }
}
</script>
