<template>
  <div class="postcard">
    <div class="postcard-metadata">
      <g-link v-for="tag in item.tags" :key="tag.id" :to="tag.path">
        #{{ tag.title }}
      </g-link>
      <span class="slash">&sol;</span> {{ displayDate }} <span class="slash">&sol;</span> {{ item.timeToRead }} min read
    </div>
    <g-link :to="item.path" class="postcard-title">
      <h2>{{ item.title }}</h2>
      <div>{{ summary }}</div>
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

<style lang="scss">
.postcard {
  width: $expanse-full;
  overflow: hidden;
  box-shadow: $shadow;
  padding: $gap-sl;
  border-radius: $radius-0;
  background-color: var(--background-card);

  &:focus, &:hover {
    background-color: var(--background-card-hover);
  }

  @include tablet-portrait {
    border-radius: $radius;
  }

  .postcard-metadata, .postcard-title {
    color: var(--text-block);
  }

  .postcard-metadata {
    letter-spacing: $text-relaxed;
    font-size: $text-xs;
  }

  .postcard-title {
    display: block;
    margin-top: $gap-xs / 2;
    margin-bottom: $gap-xs / 2;

    &:focus, &:hover {
      color: $color-visited-link;
    }

    h2 {
      font-size: $text-md;
      font-weight: $font-semibold;
      margin-bottom: $gap-sm;

      @include tablet-portrait {
        font-size: $text-lg;
      }
    }

    div {
      font-size: $text-sm;
      font-weight: $font-normal;
    }
  }
}
</style>
