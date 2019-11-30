<template>
  <div class="post-context">
    <div class="post-author" v-for="author in authors" :key="author.id">
      <g-image :alt="author.title" :src="author.avatar" class="avatar" />
      <div>
        <g-link :to="author.path">{{ author.title }}</g-link>
        <p>{{ date }}</p>
      </div>
    </div>
    <div class="post-meta">
      <g-link :to="tag.path" v-for="tag in tags" :key="tag.id">
        #{{ tag.title }} 
      </g-link> 
      <p>&nbsp;<span class="slash">&sol;</span> {{ timeToRead }} min read</p>
    </div>
  </div>
</template>

<script>
export default {
  props: ['authors', 'tags', 'timeToRead', 'date']
}
</script>

<style lang="scss" scoped>
.post-context {
  font-size: $text-sm;
  margin-top: $gap;

  @include tablet-portrait {
    margin-top: $gap-md;
  }

  p {
    margin-bottom: 0;
  }

  .post-author, .post-meta {
    display: flex;
    align-items: center;
  }

  .post-author {
    padding-bottom: $gap-xs;

    .avatar {
      height: $media-lg;
      width: $media-lg;
      box-shadow: $shadow;
      border-radius: $radius-all;
      margin-right: $gap-xs;
    }
  }
}
</style>
