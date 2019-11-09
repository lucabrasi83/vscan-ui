export class VscanUsersList {
	users: VscanUsers[];
}

export class VscanUsers {
	userID: string;
	firstName: string;
	lastName: string;
	middleName?: string;
	email: string;
	role: string;
	enterpriseID: string;

	clear() {
		this.userID = "";
		this.firstName = "";
		this.lastName = "";
		this.middleName = "";
		this.email = "";
		this.role = "";
		this.enterpriseID = "";
	}
}

export interface UserCreate {
	email: string;
	firstName: string;
	lastName: string;
	middleName?: string;
	password: string;
	role: string;
	enterpriseID: string;
}

export interface UserUpdate {
	email?: string;
	password?: string;
	role?: string;
	enterpriseID?: string;
	firstName?: string;
	lastName?: string;
	middleName?: string;
}

export const HIDDEN_PASSWORD = "~P|A#//6xd6#sQ8y*";

export const ROOT_USER = "root@vscan.com";

export const ROOT_ROLE = "vulscanoroot";
export const USER_ROLE = "vulscanouser";
