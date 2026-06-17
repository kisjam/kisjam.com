import { jstParts } from "./posts";

// JST(Asia/Tokyo)基準で YYYY/MM/DD 表示。ビルド環境のTZ(CIはUTC)に依存しない。
export function formatDate(dateString: string | Date): string {
	const [year, month, day] = jstParts(new Date(dateString));
	return `${year}/${month}/${day}`;
}

export function isSameDay(date1: string | Date, date2: string | Date): boolean {
	return formatDate(date1) === formatDate(date2);
}
