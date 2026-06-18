import { OutlineLayer } from './outline-layer.js';

const button = document.querySelector<HTMLButtonElement>('.site-header__menu-button');
const nav = document.querySelector<HTMLElement>('.site-header__nav');

button?.addEventListener('click', () => {
	const isOpen = nav?.classList.toggle('-open');
	button.setAttribute('aria-expanded', String(isOpen));
});

new OutlineLayer({
	colors: {
		line: 'rgba(1,46,64,0.28)',
		body: 'rgba(1,46,64,0.7)',
		r: 'rgba(214,40,60,0.8)',
		b: 'rgba(0,90,200,0.8)',
	},
}).mount();
