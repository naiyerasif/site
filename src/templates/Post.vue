<template>
  <Layout>
    <Hero :item="heroItem" />
    <div class="container post">
      <Article class="article" v-html="$page.post.content" />
      <Shortcuts :dest="'table-of-contents'" />
    </div>
    <div class="container post-edit">
      <span>Spotted a mistake or want to improve this post?</span>
      <a target="_blank" rel="noopener noreferrer" :href="editUrl"><svg class="icon icon-edit" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Edit this page on GitHub!</a>
    </div>
  </Layout>
</template>

<page-query>
query Post ($path: String!) {
  post: post (path: $path) {
    title
    date (format: "MMM D, Y")
    updated (format: "MMM D, Y")
    author {
      id
      title
      avatar
      path
    }
    content
    path
    timeToRead
    tags {
      title
      path
    }
  }
}
</page-query>

<static-query>
query {
  metadata {
    postEditUrl
  }
}
</static-query>

<script>
import Hero from '~/components/Hero'
import Article from '~/components/Article'
import Shortcuts from '~/components/Shortcuts'

export default {
  metaInfo() {
    return {
      title: this.$page.post.title
    }
  },
  components: {
    Hero,
    Article,
    Shortcuts
  },
  computed: {
    heroItem() {
      return {
        title: this.$page.post.title,
        post: true,
        authors: this.$page.post.author,
        tags: this.$page.post.tags,
        timeToRead: this.$page.post.timeToRead,
        date: this.displayDate
      }
    },
    displayDate() {
      return this.$page.post.updated !== this.$page.post.date ? 'Updated ' + this.$page.post.updated : 'Published ' + this.$page.post.date;
    },
    editUrl() {
      const tokens = this.$page.post.path.split('/');
      tokens[1] = tokens[1] + "/" + tokens[2];
      const slug = tokens.splice(1,2).join('/') + tokens.join('-');
      return this.$static.metadata.postEditUrl + slug.substring(0, slug.length - 1) + ".md";
    }
  }
}
</script>
