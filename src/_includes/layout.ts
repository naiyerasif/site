import head from './partials/head.ts'
import header from './partials/header.ts'
import footer from './partials/footer.ts'
import icon from './components/icon.ts'
import { PageInfo } from './types.ts'

export default function (pageInfo: PageInfo): string {
	const { metaInfo, slots, content } = pageInfo
	const mainClasses = content ? 'wrapper-base has-content' : 'wrapper-base'
	return `<!DOCTYPE html>
	<html lang="en">
		<head>
			${head(metaInfo)}
		</head>
		<body class="app">
			<a id="skiplink" href="#content">Skip to main content&ensp;${icon('arrow-circle-270-degree')}</a>
			<script src="/alpinejs@3.10.3.min.js" defer></script>
			<script src="/alpine.init.js" inline></script>
			<script src="/fuse.js@6.6.2.min.js"></script>
			${header(slots.hero)}
			<main class="${mainClasses}" id="content">${slots.main}</main>
			${footer()}
			<div style="display:none">
				<img src="/sprites.svg" inline>
			</div>
		</body>
	</html>`
}
