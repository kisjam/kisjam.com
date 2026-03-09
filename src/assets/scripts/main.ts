const button = document.querySelector<HTMLButtonElement>('.site-header__menu-button');
const nav = document.querySelector<HTMLElement>('.site-header__nav');

button?.addEventListener('click', () => {
	const isOpen = nav?.classList.toggle('-open');
	button.setAttribute('aria-expanded', String(isOpen));
});
