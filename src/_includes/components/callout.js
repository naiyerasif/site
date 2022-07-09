export default function (label, content, type = 'note', icon = type) {
	return `<aside class="callout callout-${type}"><div class="callout-indicator"><svg viewBox="0 0 24 24" role="img" aria-hidden="true" class="icon callout-sign"><use href="#ini-${icon}"></use></svg><div class="callout-label">${label}</div></div><div class="callout-content">${content}</div></aside>`
}
