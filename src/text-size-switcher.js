(function () {
	window.__onTextSizeChange = function () {}
	function setTextSize(newTextSize) {
		window.__textSize = newTextSize
		preferredTextSize = newTextSize
		document.firstElementChild.setAttribute('data-text-size', newTextSize)
		window.__onTextSizeChange(newTextSize)
	}

	var preferredTextSize
	try {
		preferredTextSize = localStorage.getItem('text-size')
	} catch (err) {}

	window.__setPreferredTextSize = function (newTextSize) {
		setTextSize(newTextSize)
		try {
			localStorage.setItem('text-size', newTextSize)
		} catch (err) {}
	}

	setTextSize(preferredTextSize || 'regular')
})()
