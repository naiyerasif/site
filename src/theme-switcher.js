(function () {
	window.__onThemeChange = function () {}
	function setTheme(newTheme) {
		window.__theme = newTheme
		preferredTheme = newTheme
		document.firstElementChild.setAttribute('data-theme', newTheme)
		window.__onThemeChange(newTheme)
	}

	var preferredTheme
	try {
		preferredTheme = localStorage.getItem('theme')
	} catch (err) {}

	window.__setPreferredTheme = function (newTheme) {
		setTheme(newTheme)
		try {
			localStorage.setItem('theme', newTheme)
		} catch (err) {}
	}

	var isColorSchemeDark = window.matchMedia('(prefers-color-scheme: dark)')

	function setThemeOnChange(e) {
		window.__setPreferredTheme(e.matches ? 'dark' : 'light')
	}

	try {
		isColorSchemeDark.addEventListener('change', setThemeOnChange)
	} catch (err) {
		isColorSchemeDark.addListener(setThemeOnChange)
	}

	setTheme(preferredTheme || (isColorSchemeDark.matches ? 'dark' : 'light'))
})()