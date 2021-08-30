const projects = [
  {
    title: 'Spritely',
    description: 'A handy Node.js CLI to generate SVG sprites',
    path: 'https://github.com/Microflash/spritely'
  },
  {
    title: 'Gridsome Feed Plugin',
    description: 'A Gridsome plugin to generate RSS, Atom and JSON feeds',
    path: 'https://github.com/Microflash/gridsome-plugin-feed'
  },
  {
    title: 'Succinct',
    description: 'A Vuepress theme with support for dark and light modes, and web-fonts',
    path: 'https://succinct.mflash.dev'
  }
]

const loadProjects = collection => {
  projects.forEach(project => collection.addNode({
    title: project.title,
    description: project.description,
    link: project.path,
  }))
}

module.exports = { loadProjects }
