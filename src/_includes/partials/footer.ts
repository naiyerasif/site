import icon from '../components/icon.ts'

export default function () {
	return `<footer class="footer" id="bottom">
		<div class="wrapper">
			<div class="impression">
				<p style="color: var(--sugar-color-stress)">&copy; 2018 &mdash;&mdash; today, Naiyer Asif</p>
				<p>Except as otherwise noted, the content on this site is licensed under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="nofollow noopener noreferrer">Creative Commons Attribution 4.0 License</a>, and the source code of this site and the code samples are licensed under the <a href="https://github.com/Microflash/site/blob/main/LICENSE.md" rel="nofollow noopener noreferrer">MIT License</a>.</p>
				<div class="footer-network">
					<a href="/feed.xml" aria-label="RSS feed">${icon('rss')}</a>
					<a href="https://github.com/naiyerasif" aria-label="GitHub" rel="noopener noreferrer">${icon('github')}</a>
					<a href="https://twitter.com/Microflash" aria-label="Twitter" rel="noopener noreferrer">${icon('twitter')}</a>
					<a href="https://in.linkedin.com/in/naiyerasif" aria-label="LinkedIn" rel="noopener noreferrer">${icon('linkedin')}</a>
				</div>
			</div>
			<div class="links">
				<a href="/privacy">Privacy</a>
				<a href="https://github.com/Microflash/site/issues/new" rel="nofollow noopener noreferrer">Report an issue</a>
				<a href="https://github.com/Microflash/site" rel="nofollow noopener noreferrer">Source code</a>
				<a href="/sitemap.xml">Sitemap</a>
			</div>
		</div>
	</footer>`
}
