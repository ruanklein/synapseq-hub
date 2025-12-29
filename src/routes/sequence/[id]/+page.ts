import type { PageLoad, EntryGenerator } from './$types';
import type { ManifestEntry } from '$lib/types';
import manifest from '$lib/data/manifest.json';

export const prerender = true;

export const entries: EntryGenerator = async () => {
	return manifest.entries.map((entry) => ({
		id: entry.id
	}));
};

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const response = await fetch('/manifest.json');
		const data = await response.json();

		const sequence = data.entries.find((entry: ManifestEntry) => entry.id === params.id);

		if (!sequence) {
			return {
				status: 404,
				error: new Error('Sequence not found')
			};
		}

		return {
			sequence
		};
	} catch (error) {
		return {
			status: 500,
			error: new Error('Failed to load sequence')
		};
	}
};
