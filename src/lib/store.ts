import { writable, derived } from 'svelte/store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { ManifestEntry } from './types';

dayjs.extend(relativeTime);

export const sequences = writable<ManifestEntry[]>([]);

export const searchTerm = writable<string>('');

export const selectedCategory = writable<string>('');
export const selectedAuthor = writable<string>('');

export async function loadManifest() {
	try {
		const response = await fetch('/manifest.json');
		const data = await response.json();
		sequences.set(data.entries);
		return data;
	} catch (error) {
		console.error('Failed to load manifest:', error);
		return null;
	}
}

export const filteredSequences = derived(
	[sequences, searchTerm, selectedCategory, selectedAuthor],
	([$sequences, $searchTerm, $selectedCategory, $selectedAuthor]) => {
		let filtered = $sequences;

		if ($searchTerm) {
			const term = $searchTerm.toLowerCase();
			filtered = filtered.filter(
				(seq) =>
					seq.name.toLowerCase().includes(term) ||
					seq.author.toLowerCase().includes(term) ||
					seq.category.toLowerCase().includes(term)
			);
		}

		if ($selectedCategory) {
			filtered = filtered.filter((seq) => seq.category === $selectedCategory);
		}

		if ($selectedAuthor) {
			filtered = filtered.filter((seq) => seq.author === $selectedAuthor);
		}

		return filtered;
	}
);

export const categories = derived(sequences, ($sequences) => {
	const cats = new Set($sequences.map((seq) => seq.category));
	return Array.from(cats).sort();
});

export const authors = derived(sequences, ($sequences) => {
	const auths = new Set($sequences.map((seq) => seq.author));
	return Array.from(auths).sort();
});

export const lastUpdated = derived(sequences, ($sequences) => {
	if ($sequences.length === 0) return null;

	const dates = $sequences
		.map((seq) => new Date(seq.updated_at))
		.sort((a, b) => b.getTime() - a.getTime());

	return dates[0];
});

export function formatRelativeTime(date: Date | string): string {
	return dayjs(date).fromNow();
}

export function formatFullDate(date: Date | string): string {
	return dayjs(date).format('MMMM D, YYYY [at] h:mm A');
}

export const selectedSequence = writable<ManifestEntry | null>(null);
