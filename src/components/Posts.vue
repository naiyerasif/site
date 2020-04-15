<template>
  <div class="container posts">
    <section class="canvas">
      <div class="post" v-for="post in posts" :key="post.id">
        <div class="post-header">
          <span v-html="post.node.date"/>
          <span class="separator"></span>{{ post.node.timeToRead }} min read
          <span class="separator"></span>
          <Sprite :symbol="label" class="label" v-for="label in post.node.labels" :key="label" />
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
import Sprite from './Sprite'

export default {
  props: ['posts'],
  components: {
    Sprite
  }
}
</script>
