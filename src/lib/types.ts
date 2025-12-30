export interface Dependency {
	type: string;
	name: string;
	download_url: string;
}

export interface ManifestEntry {
	id: string;
	name: string;
	author: string;
	path: string;
	category: string;
	download_url: string;
	thumbnail: string;
	updated_at: string;
	dependencies: Dependency[];
}

export interface Manifest {
	version: string;
	lastUpdated: string;
	entries: ManifestEntry[];
}
