<template>
  <div class="container posts">
    <section class="canvas">
      <div class="post" v-for="post in posts" :key="post.id">
        <div class="post-header">
          <span v-html="displayDate(post.node)"/>
          <span class="separator"></span>{{ post.node.timeToRead }} min read
          <span class="separator"></span>
          <g-link v-for="tag in post.node.tags" :key="tag.id" :to="tag.path">
            #{{ tag.title }} 
          </g-link>
        </div>
        <g-link :to="post.node.path">
          <h2 class="post-body">{{ post.node.title }}</h2>
          <p class="post-footer">{{ post.node.excerpt | clip }} &hellip;</p>
        </g-link>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  props: ['posts'],
  methods: {
    displayDate(post) {
      const published = `Published <time>${post.date}</time>`
      return !post.hasOwnProperty('updated') ? published : (post.updated !== post.date ? `Updated <time>${post.updated}</time>` : published); 
    }
  }
}
</script>
