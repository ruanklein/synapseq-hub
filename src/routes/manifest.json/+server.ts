import manifest from '$lib/data/manifest.json';
import { json } from '@sveltejs/kit';

export const prerender = true;

export const GET = async () => {
	return json(manifest);
};
