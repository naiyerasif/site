# Microflash [![deploy](https://github.com/Microflash/site/actions/workflows/deploy.yml/badge.svg)](https://github.com/Microflash/site/actions/workflows/deploy.yml)

Personal website of [@naiyerasif](https://github.com/naiyerasif)

## Development

- Install [Deno](https://deno.land/) and [Lume](https://lume.land/)
- Run `lume --serve` to serve the site at port `8080`
- Run `lume` to generate a production build

## Deployment

The deployment on [Netlify](https://www.netlify.com/) is automated through [GitHub Actions](./.github/workflows/deploy.yml).

## Affordances

Install [Velociraptor](https://velociraptor.run) to use the affordances.

### Creating a draft

```sh
vr post -t '${title}' -c '${category}' -d '${date in YYYY-MM-DD HH:mm:ss format}' -h '${comma separated tags}'
```

The draft will be created in `.workspace/posts` directory.

## License

The source code of this site is available under [MIT](./LICENSE.md), the content under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
