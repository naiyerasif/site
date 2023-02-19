;(function () {
	let preferredTheme
	try {
		preferredTheme = localStorage.getItem("theme")
	} catch (err) {}

	function setTheme(newTheme) {
		window.__theme = newTheme
		preferredTheme = newTheme
		document.firstElementChild.setAttribute("data-theme", newTheme)
	}
	
	const colorSchemeQuery = "(prefers-color-scheme: dark)"
	const prefersDarkTheme = window.matchMedia(colorSchemeQuery)

	window.__setPreferredTheme = function (newTheme) {
		setTheme(newTheme)
		try {
			localStorage.setItem("theme", newTheme)
		} catch (err) {}

		document.firstElementChild.dispatchEvent(new CustomEvent("themechange", {
			bubbles: true,
			composed: true,
			detail: { theme: newTheme }
		}))
	}

	prefersDarkTheme.addEventListener("change", function (event) {
		window.__setPreferredTheme(event.matches ? "dark" : "light")
	})

	setTheme(preferredTheme || (prefersDarkTheme.matches ? "dark" : "light"))
})()
