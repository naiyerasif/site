export enum ContentType {
	PAGE,
	POST,
	POSTS,
	PROFILE
}

export interface MetaInfo {
	title: string,
	description?: string,
	url: string,
	type?: ContentType
	previous?: string,
	next?: string,
	source?: string,
	published?: string,
	updated?: string
}

export interface PageSlots {
	hero: string,
	main: string
}

export interface PageInfo {
	metaInfo: MetaInfo,
	slots: PageSlots
}
