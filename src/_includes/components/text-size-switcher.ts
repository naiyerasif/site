export default function () {
	return `<script src="/text-size-switcher.js" inline></script>
		<button role="switch" aria-live="polite" :aria-label="label()" aria-checked="true" x-data="textSizeSwitcher" @click="switchTextSize()" class="button" type="button"><svg aria-hidden="true" role="img" class="icon"><use x-show="currentTextSize === 'regular'" x-transition href="#ini-text-size-regular"/><use x-show="currentTextSize === 'medium'" x-transition href="#ini-text-size-medium"/><use x-show="currentTextSize === 'large'" x-transition href="#ini-text-size-large"/></svg></button>`
}
