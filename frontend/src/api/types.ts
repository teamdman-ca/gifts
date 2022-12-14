export interface Group {
	id: string;
	displayName: string;
	password: string;
	members: string[];
	owners: string[];
}

export interface User {
	id: string;
	displayName: string;
}

export interface Wishlist {
	id: string;
	displayName: string;
	owners: string[];
}

export interface Card {
	id: string;
	wishlistId: string;
	groupId: string;
	content: string;
	visibleToListOwners: boolean;
	tags: Record<string, boolean>;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
	namespace App {
		export interface Error {
			returnUrl?: string;
		}
	}
}
