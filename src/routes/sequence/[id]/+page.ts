import type { PageLoad, EntryGenerator } from './$types';
import type { ManifestEntry } from '$lib/types';
import manifest from '$lib/data/manifest.json';
import { toTitleCase } from '$lib/utils/formatters';

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

		// Check if thumbnail exists, fallback to default if not
		let thumbnailExists = false;
		try {
			const thumbnailResponse = await fetch(`/${sequence.thumbnail}`, { method: 'HEAD' });
			thumbnailExists = thumbnailResponse.ok;
		} catch {
			thumbnailExists = false;
		}

		// Generate meta tags data
		const pageTitle = `${toTitleCase(sequence.name)} | SynapSeq Hub`;
		const pageDescription = `${sequence.category || 'Sequence'} sequence by ${sequence.author || 'SynapSeq'}. Stream or download this brainwave entrainment audio on SynapSeq Hub.`;
		const pageUrl = `https://hub.synapseq.org/sequence/${sequence.id}`;
		const pageImage = sequence.thumbnail
			? `https://hub.synapseq.org/${sequence.thumbnail}`
			: 'https://hub.synapseq.org/logo.png';

		return {
			sequence: {
				...sequence,
				thumbnail: thumbnailExists ? sequence.thumbnail : 'default-thumbnail.webp'
			},
			meta: {
				title: pageTitle,
				description: pageDescription,
				url: pageUrl,
				image: pageImage,
				imageAlt: toTitleCase(sequence.name)
			}
		};
	} catch (error) {
		return {
			status: 500,
			error: new Error('Failed to load sequence')
		};
	}
};
