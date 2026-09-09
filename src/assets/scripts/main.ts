import { OutlineLayer } from './outline-layer.js';

const button = document.querySelector<HTMLButtonElement>('.site-header__menu-button');
const nav = document.querySelector<HTMLElement>('.site-header__nav');

button?.addEventListener('click', () => {
	const isOpen = nav?.classList.toggle('-open');
	button.setAttribute('aria-expanded', String(isOpen));
});

new OutlineLayer({
	lineWidth: 2,
	autoGlitch: false,
	scrollGlitch: true,
	scrollGain: 0.008,
	scrollMax: 0.8,
	idleSlice: true,
	idleSliceInterval: [3000, 12000],
	burstDecay: 0.86,
	amp: 6,
	sliceShift: 60,
	colors: {
		line: 'rgba(1,46,64,0.7)',
		body: 'rgba(1,46,64,0.7)',
		r: 'rgba(255,0,153,0.9)',
		b: 'rgba(0,229,255,0.9)',
	},
}).mount();
