module.exports = {
  content: [
    'content/**/*md',
    'src/**/*.scss',
    'src/**/*.vue',
    'src/**/*.js',
  ],
  safelist: {
    standard: [
      'abbr',
      'dd',
      'del',
      'dl',
      'dt',
      'figcaption',
      'hr',
      'ins',
      'kbd',
      'mark',
      'ol',
      'sub',
      'sup',
      'th',
      'td',
      'ul',
    ],
    deep: [
      /^~/,
      /^!/,
      /^%/,
      /gridsome-highlight$/,
      /tbody$/,
      /tfoot$/,
      /thead$/,
      /toc-body$/,
    ],
    greedy: [
      /data-theme$/,
    ]
  }
}
