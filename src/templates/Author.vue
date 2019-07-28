<template>
  <Layout>
    <div v-for="detail in this.$page.author.details" :key="detail.id">
      <div v-html="detail"/>
    </div>
  </Layout>
</template>

<page-query>
query Author ($path: String!) {
  author (path: $path) {
    id
    title
    bio
    details
  }
}
</page-query>

<script>
export default {
  metaInfo () {
    return {
      title: this.$page.author.title,
      meta: [
        {
          key: 'description',
          name: 'description',
          content: this.$page.author.bio
        }
      ]
    }
  }
}
</script>
