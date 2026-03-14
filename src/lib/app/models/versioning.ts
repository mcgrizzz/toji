export type WorkingCopy<TBody> = {
	id: string;
	name: string;
	body: TBody;
	createdAt?: string;
	updatedAt?: string;
};

export type Snapshot<TBody> = {
	id: string;
	sourceId: string;
	version: string;
	name: string;
	body: TBody;
	isPublic: boolean;
	createdAt?: string;
};
