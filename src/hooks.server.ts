import type { Handle } from '@sveltejs/kit';
import manifest from '$lib/data/manifest.json';
import { toTitleCase } from '$lib/utils/formatters';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Only inject meta tags for sequence pages
	if (event.url.pathname.startsWith('/sequence/')) {
		const sequenceId = event.url.pathname.split('/sequence/')[1];
		const sequence = manifest.entries.find((entry) => entry.id === sequenceId);

		if (sequence) {
			const pageTitle = `${toTitleCase(sequence.name)} | SynapSeq Hub`;
			const pageDescription = `${sequence.category || 'Sequence'} sequence by ${sequence.author || 'SynapSeq'}. Stream or download this brainwave entrainment audio on SynapSeq Hub.`;
			const pageUrl = `https://hub.synapseq.org/sequence/${sequence.id}`;
			const pageImage = sequence.thumbnail
				? `https://hub.synapseq.org/${sequence.thumbnail}`
				: 'https://hub.synapseq.org/logo.png';

			const metaTags = `
		<title>${pageTitle}</title>
		<meta name="description" content="${pageDescription}" />
		<meta property="og:type" content="website" />
		<meta property="og:url" content="${pageUrl}" />
		<meta property="og:title" content="${pageTitle}" />
		<meta property="og:description" content="${pageDescription}" />
		<meta property="og:image" content="${pageImage}" />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta property="og:image:alt" content="${toTitleCase(sequence.name)}" />
		<meta property="og:site_name" content="SynapSeq Hub" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:url" content="${pageUrl}" />
		<meta name="twitter:title" content="${pageTitle}" />
		<meta name="twitter:description" content="${pageDescription}" />
		<meta name="twitter:image" content="${pageImage}" />
		<meta name="twitter:image:alt" content="${toTitleCase(sequence.name)}" />
		<link rel="canonical" href="${pageUrl}" />
	`;

			// Inject meta tags into the HTML
			let body = await response.text();
			body = body.replace('</head>', `${metaTags}</head>`);

			return new Response(body, {
				status: response.status,
				headers: response.headers
			});
		}
	}

	return response;
};
