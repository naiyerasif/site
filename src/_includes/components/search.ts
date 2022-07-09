import icon from './icon.ts'

export default function () {
	const activator = icon('search')
	const focusTarget = '$refs.searchBox'
	const modalHeader = `<input x-ref="searchBox" x-model="query" @keyup="search()" placeholder="Search..." class="search-box">`
	const recentSearches = `<div class="modal-section" x-show="recentlySearched && recentlySearched.length > 0" x-transition>
		<div class="modal-section-header">Recently searched</div>
		<template x-for="recentlySearchedItem in recentlySearched">
			<a x-text="recentlySearchedItem.item.title" :href="recentlySearchedItem.item.path" class="modal-section-item"></a>
		</template>
	</div>`
	const searchResults = `<div class="modal-section" x-show="searchResults && searchResults.length > 0" x-transition>
		<div class="modal-section-header" x-text="searchResults && searchResults.length > 1 ? searchResults.length + ' results' : searchResults.length + ' result'"></div>
		<template x-for="searchResult in searchResults">
			<a x-text="searchResult.item.title" :href="searchResult.item.path" class="modal-section-item"></a>
		</template>
	</div><div class="modal-section" x-show="query && searchResults && searchResults.length < 1" x-transition>
		<div class="modal-section-header">0 results</div>
		<div x-text="'No search results for &ldquo;' + query + '&rdquo;'" class="modal-section-item"></div>
	</div>`
	const modalBody = searchResults + recentSearches

	return `<div x-data="search" @keydown.escape.prevent.stop="close($refs.modalButton)" x-id="['modal-button']" class="modal">
	<button x-ref="modalButton" type="button" @click="launch(${focusTarget})" :aria-expanded="open" :aria-controls="$id('modal-button')" aria-label="Search" class="button">${activator}</button>
		<template x-teleport="body">
			<div x-ref="modalOverlay" x-show="open" x-transition.origin.top.right class="modal-overlay">
				<div @click.outside="close($refs.modalButton)" :id="$id('modal-button')" class="modal-container" role="dialog" aria-modal="true">
					<div class="modal-header">${modalHeader}<button type="button" @click="close($refs.modalButton)" class="button kbd">esc</button></div>
					<div class="modal-body">${modalBody}</div>
				</div>
			</div>
		</template>
	</div>`
}
