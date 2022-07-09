export default function (keyword: string) {
	const modalHeader = `<strong class="search-keyword">${keyword}</strong>`
	const modalBody = `<div class="modal-section" x-show="searchResults && searchResults.length > 0" x-transition>
		<div class="modal-section-header" x-text="searchResults.length + ' related'"></div>
		<template x-for="searchResult in searchResults">
			<a x-text="searchResult.item.title" :href="searchResult.item.path" class="modal-section-item"></a>
		</template>
	</div>`

	return `<div x-data="tag('${keyword}')" @keydown.escape.prevent.stop="close($refs.modalButton)" x-id="['modal-button']" class="modal">
	<button x-ref="modalButton" type="button" @click="launch()" :aria-expanded="open" :aria-controls="$id('modal-button')" class="button kbd">${keyword}</button>
		<template x-teleport="body">
			<div x-ref="modalOverlay" x-show="open" x-transition class="modal-overlay">
				<div @click.outside="close($refs.modalButton)" :id="$id('modal-button')" class="modal-container" role="dialog" aria-modal="true">
					<div class="modal-header">${modalHeader}<button type="button" @click="close($refs.modalButton)" class="button kbd">esc</button></div>
					<div class="modal-body">${modalBody}</div>
				</div>
			</div>
		</template>
	</div>`
}
