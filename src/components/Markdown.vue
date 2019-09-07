<template>
  <div class="remarkability">
  </div>
</template>

<style>
/*! remarkability.css v0.5.1 | MIT License | github.com/Microflash/remarkability */
.remarkability * {
  box-sizing: border-box;
}

.remarkability {
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  line-height: 1.5;
  font-size: 1.15rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.remarkability a {
  background-color: transparent;
}

.remarkability a:active,
.remarkability a:hover {
  outline-width: 0;
}

.remarkability blockquote,
.remarkability dl,
.remarkability ol,
.remarkability p,
.remarkability pre,
.remarkability table,
.remarkability ul {
  margin-bottom: 1.75rem;
}

.remarkability p:last-child,
.remarkability dl:last-child,
.remarkability ol:last-child,
.remarkability ul:last-child,
.remarkability blockquote:last-child,
.remarkability pre:last-child,
.remarkability table:last-child {
  margin-bottom: 0;
}

.remarkability p:empty {
  display: none;
}

.remarkability ul + p,
.remarkability ol + p {
  margin-top: 1.5em;
}

.remarkability h1 .icon-link,
.remarkability h2 .icon-link,
.remarkability h3 .icon-link,
.remarkability h4 .icon-link,
.remarkability h5 .icon-link,
.remarkability h6 .icon-link {
  opacity: 0;
  font-size: .85em;
  float: left;
  margin-left: -.87em;
  padding-right: .15em;
  margin-top: .125em;
  opacity: 0;
}

@media (max-width: 419px) {
  .remarkability h1 .icon-link,
  .remarkability h2 .icon-link,
  .remarkability h3 .icon-link,
  .remarkability h4 .icon-link,
  .remarkability h5 .icon-link,
  .remarkability h6 .icon-link {
    margin-left: -.72em;
  }
}

.remarkability h1:hover .icon-link, 
.remarkability h2:hover .icon-link, 
.remarkability h3:hover .icon-link, 
.remarkability h4:hover .icon-link, 
.remarkability h5:hover .icon-link, 
.remarkability h6:hover .icon-link {
  opacity: 1;
}

.remarkability h1 .icon-link::before,
.remarkability h2 .icon-link::before,
.remarkability h3 .icon-link::before,
.remarkability h4 .icon-link::before,
.remarkability h5 .icon-link::before,
.remarkability h6 .icon-link::before {
  content: '#';
}

.remarkability h1:first-child,
.remarkability h2:first-child,
.remarkability h3:first-child,
.remarkability h4:first-child,
.remarkability h5:first-child,
.remarkability h6:first-child {
  margin-top: 0;
}

.remarkability h1,
.remarkability h2,
.remarkability h3,
.remarkability h4,
.remarkability h5,
.remarkability h6 {
  margin-bottom: 0;
  margin-top: 0;
  font-weight: 600;
  line-height: 1.25;
}

.remarkability h1 {
  font-size: 2em;
  margin-bottom: 1.5rem;
  margin-top: 1.5rem;
}

.remarkability h2 {
  font-size: 1.5em;
  margin-bottom: 1.35rem;
  margin-top: 1.35rem;
}

.remarkability h3 {
  font-size: 1.25em;
  margin-bottom: 1.2rem;
  margin-top: 1.2rem;
}

.remarkability h4 {
  font-size: 1em;
  margin-bottom: 1.05rem;
  margin-top: 1.05rem;
}

.remarkability h5 {
  font-size: .875em;
  margin-bottom: 0.9rem;
  margin-top: 0.9rem;
}

.remarkability h6 {
  font-size: .85em;
  margin-bottom: 0.75rem;
  margin-top: 0.75rem;
}

.remarkability hr {
  @apply bg-background-header;
  border: none;
  display: block;
  height: 1px;
  margin-bottom: 1.4em;
  margin-top: 1.4em;
}

.remarkability abbr {
  border-bottom: 1px dotted;
  cursor: help;
}

.remarkability cite {
  font-style: italic;
}

.remarkability details {
  display: block;
}

.remarkability summary {
  display: list-item;
}

.remarkability details summary {
  cursor: pointer;
}

.remarkability strong {
  font-weight: inherit;
  font-weight: 600;
}

.remarkability small {
  font-size: 0.8em;
}

.remarkability sub,
.remarkability sup {
  font-size: 0.8em;
}

.remarkability sub {
  vertical-align: sub;
}

.remarkability sup {
  vertical-align: super;
}

.remarkability code,
.remarkability kbd,
.remarkability pre {
  @apply font-mono;
  font-size: 1em;
  -moz-osx-font-smoothing: auto;
  -webkit-font-smoothing: auto;
}

.remarkability code {
  @apply bg-background-header;
  border-radius: 7px;
  font-size: 85%;
  margin: 0;
  padding: .2em .4em;
}

.remarkability pre {
  word-wrap: normal;
  overflow: auto;
  word-break: normal;
  border-radius: 3px;
  padding: 16px;
  line-height: 1.5;
  margin-top: 0;
}

@media (max-width: 639px) {
  .remarkability pre {
    margin: .85rem -1.5rem;
    padding-left: 1.65rem;
    padding-right: 1.65rem;
    border-radius: 0;
  }
}

.remarkability pre>code {
  background: transparent;
  border: 0;
  font-size: 85%;
  margin: 0;
  padding: 0;
  white-space: pre;
  word-break: normal;
}

.remarkability pre code {
  background-color: transparent;
  border: 0;
  display: inline;
  line-height: inherit;
  margin: 0;
  max-width: auto;
  overflow: visible;
  padding: 0;
  word-wrap: normal;
}

.remarkability img {
  border-style: none;
  vertical-align: text-bottom;
  background-color: transparent;
  box-sizing: content-box;
  max-width: 100%;
}

.remarkability img[align=right] {
  padding-left: 20px;
}

.remarkability img[align=left] {
  padding-right: 20px;
}

.remarkability figure {
  margin-bottom: 2.8em;
  text-align: center;
}

.remarkability figure:first-child {
  margin-top: 0;
}

.remarkability figure:last-child {
  margin-bottom: 0;
}

.remarkability figcaption {
  font-size: 0.8em;
  margin-top: 0.875em;
}

.remarkability blockquote {
  border-left: .15em solid rgba(100, 100, 100, 0.6);
  padding: 0 1em;
}

.remarkability blockquote>:first-child {
  margin-top: 0;
}

.remarkability blockquote>:last-child {
  margin-bottom: 0;
}

.remarkability blockquote p,
.remarkability li p {
  margin-bottom: 0.4em;
}

.remarkability ol,
.remarkability ul {
  margin-bottom: 0;
  margin-top: 0;
  padding-left: 0;
}

.remarkability ol ol,
.remarkability ul ol {
  list-style-type: lower-alpha;
}

.remarkability ol ol ol,
.remarkability ol ul ol,
.remarkability ul ol ol,
.remarkability ul ul ol {
  list-style-type: lower-roman;
}

.remarkability ol ol ol ol,
.remarkability ol ul ol ol,
.remarkability ol ol ul ol,
.remarkability ul ol ol ol,
.remarkability ul ul ol ol,
.remarkability ul ol ul ol,
.remarkability ol ul ul ol,
.remarkability ul ul ul ol {
  list-style-type: lower-greek;
}

.remarkability dd {
  margin-left: 0;
}

.remarkability ol,
.remarkability ul {
  padding-left: 2em;
}

.remarkability ol ol,
.remarkability ol ul,
.remarkability ul ol,
.remarkability ul ul {
  margin-bottom: 0;
  margin-top: 0;
}

.remarkability li {
  word-wrap: break-all;
}

.remarkability ul {
  list-style-type: disc;
}

.remarkability ul ul {
  list-style-type: circle;
}

.remarkability ul ul ul {
  list-style-type: square;
}

.remarkability ul ul ul ul {
  list-style-type: circle;
}

.remarkability li+li {
  margin-top: .25em;
}

.remarkability dl {
  padding: 0;
}

.remarkability dl dt {
  font-size: 1em;
  font-style: italic;
  font-weight: 600;
  margin-top: 16px;
  padding: 0;
}

.remarkability dl dd {
  margin-bottom: 16px;
  padding: 0 16px;
}

.remarkability table {
  border-collapse: collapse;
  border-spacing: 0;
  display: block;
  overflow: auto;
  width: 100%;
}

.remarkability table pre {
  white-space: pre-wrap;
}

.remarkability table th {
  font-weight: 600;
}

.remarkability table td,
.remarkability table th {
  border: 1px solid rgba(100, 100, 100, 0.6);
  padding: 6px 13px;
}

.remarkability table tr {
  @apply bg-background-header;
  border-top: 1px solid rgba(100, 100, 100, 0.6);
}

.remarkability table tr:nth-child(2n) {
  @apply bg-background-body;
}

.remarkability table tr code {
  background-color: transparent;
  padding-left: 0;
  padding-right: 0;
}

.remarkability:before {
  content: "";
  display: table;
}

.remarkability:after {
  clear: both;
  content: "";
  display: table;
}

.remarkability>:first-child {
  margin-top: 0!important;
}

.remarkability>:last-child {
  margin-bottom: 0!important;
}
</style>
