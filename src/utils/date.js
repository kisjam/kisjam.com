export function formatDate(dateString) {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	const formattedMonth = month < 10 ? `0${month}` : month;
	const formattedDay = day < 10 ? `0${day}` : day;

	return `${year}/${formattedMonth}/${formattedDay}`;
}

export function isSameDay(date1, date2) {
	const d1 = new Date(date1);
	const d2 = new Date(date2);
	return (
		d1.getFullYear() === d2.getFullYear() &&
		d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate()
	);
}
