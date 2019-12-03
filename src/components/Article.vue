<template>
  <main class="remarkability">
  </main>
</template>

<style lang="scss">
@import "../../node_modules/@microflash/remarkability/scss/remarkability.scss";

.remarkability {
  &>p:first-of-type {
    line-height: 1.625;
    font-size: $text-md;
  }

  pre {
    @include phone-only {
      margin-right: -$gap;
      margin-left: -$gap;
    }
  }

  h3#table-of-contents {
    @include tablet-landscape {
      + ul {
      position: fixed;
      text-align: right;
      font-size: $font-size * 0.8;
      max-width: $gap-ws * 2.7;
      bottom: 5vh;
      right: $gap;
      z-index: $rise-lg;
      list-style-type: none;

      ul {
        list-style-type: none;
      }

      &:before {
        content: 'Table of Contents';
        font-weight: $font-semibold;
      }
    }

    @include hidden;
    }
  }

  .toclink {
    margin-right: $gap-xs / 3;
    font-weight: $font-normal;

    &::after {
      content: '#';
      outline: none;
    }
  }
}
</style>
