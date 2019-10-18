import { Injectable } from "@angular/core";
import {
	HttpClient,
	HttpErrorResponse,
	HttpHeaders
} from "@angular/common/http";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { User } from "../_models/user.model";
import { Permission, Role } from "..";
import { catchError, map } from "rxjs/operators";
import { QueryParamsModel, QueryResultsModel } from "../../_base/crud";
import { environment } from "../../../../environments/environment";
import { JwtokenModel } from "../_models/jwtoken-model";
import { JwtHelperService } from "@auth0/angular-jwt";

// const API_USERS_URL = "api/users";
const API_USERS_URL = environment.vscanAPIURL + "/login";
const API_PERMISSION_URL = "api/permissions";
const API_ROLES_URL = "api/roles";

@Injectable()
export class AuthService {
	constructor(private http: HttpClient) {}

	// Authentication/Authorization
	login(email: string, password: string): Observable<JwtokenModel> {
		return this.http
			.post<JwtokenModel>(API_USERS_URL, {
				username: email,
				password: password
			})
			.pipe(catchError(this.handleError));
	}

	isTokenInvalid(): boolean {
		const jwtHelper = new JwtHelperService();
		const userToken = localStorage.getItem(environment.vscanJWT);
		let isExpired: boolean;

		try {
			if (userToken) {
				isExpired = jwtHelper.isTokenExpired(userToken);
				return isExpired;
			}
		} catch (e) {
			console.log(e);
			return true;
		}
		return true;
	}

	getUserTokenField(field: string): string {
		const jwtHelper = new JwtHelperService();
		const token = localStorage.getItem(environment.vscanJWT);
		const val = jwtHelper.decodeToken(token);

		return val[field];
	}
	isUserRoot(): boolean {
		return this.getUserTokenField("role") === "vulscanoroot";
	}
	getUserByToken(): Observable<User> {
		const userToken = localStorage.getItem(environment.vscanJWT);
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Authorization", "Bearer " + userToken);
		return this.http.get<User>(API_USERS_URL, { headers: httpHeaders });
	}

	register(user: User): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http
			.post<User>(API_USERS_URL, user, { headers: httpHeaders })
			.pipe(
				map((res: User) => {
					return res;
				}),
				catchError(err => {
					return null;
				})
			);
	}

	/*
	 * Submit forgot password request
	 *
	 * @param {string} email
	 * @returns {Observable<any>}
	 */
	public requestPassword(email: string): Observable<any> {
		return this.http
			.get(API_USERS_URL + "/forgot?=" + email)
			.pipe(catchError(this.handleError));
	}

	getAllUsers(): Observable<User[]> {
		return this.http.get<User[]>(API_USERS_URL);
	}

	getUserById(userId: number): Observable<User> {
		return this.http.get<User>(API_USERS_URL + `/${userId}`);
	}

	// DELETE => delete the user from the server
	deleteUser(userId: number) {
		const url = `${API_USERS_URL}/${userId}`;
		return this.http.delete(url);
	}

	// UPDATE => PUT: update the user on the server
	updateUser(_user: User): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.put(API_USERS_URL, _user, { headers: httpHeaders });
	}

	// CREATE =>  POST: add a new user to the server
	createUser(user: User): Observable<User> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.post<User>(API_USERS_URL, user, {
			headers: httpHeaders
		});
	}

	// Method from server should return QueryResultsModel(items: any[], totalsCount: number)
	// items => filtered/sorted result
	findUsers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.post<QueryResultsModel>(
			API_USERS_URL + "/findUsers",
			queryParams,
			{ headers: httpHeaders }
		);
	}

	// Permission
	getAllPermissions(): Observable<Permission[]> {
		return this.http.get<Permission[]>(API_PERMISSION_URL);
	}

	getRolePermissions(roleId: number): Observable<Permission[]> {
		return this.http.get<Permission[]>(
			API_PERMISSION_URL + "/getRolePermission?=" + roleId
		);
	}

	// Roles
	getAllRoles(): Observable<Role[]> {
		return this.http.get<Role[]>(API_ROLES_URL);
	}

	getRoleById(roleId: number): Observable<Role> {
		return this.http.get<Role>(API_ROLES_URL + `/${roleId}`);
	}

	// CREATE =>  POST: add a new role to the server
	createRole(role: Role): Observable<Role> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.post<Role>(API_ROLES_URL, role, {
			headers: httpHeaders
		});
	}

	// UPDATE => PUT: update the role on the server
	updateRole(role: Role): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.put(API_ROLES_URL, role, { headers: httpHeaders });
	}

	// DELETE => delete the role from the server
	deleteRole(roleId: number): Observable<Role> {
		const url = `${API_ROLES_URL}/${roleId}`;
		return this.http.delete<Role>(url);
	}

	// Check Role Before deletion
	isRoleAssignedToUsers(roleId: number): Observable<boolean> {
		return this.http.get<boolean>(
			API_ROLES_URL + "/checkIsRollAssignedToUser?roleId=" + roleId
		);
	}

	findRoles(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// This code imitates server calls
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.post<QueryResultsModel>(
			API_ROLES_URL + "/findRoles",
			queryParams,
			{ headers: httpHeaders }
		);
	}

	/*
	 * Handle Http operation that failed.
	 * Let the app continue.
	 *
	 * @param operation - name of the operation that failed
	 * @param result - optional value to return as the observable result
	 */
	// private handleError<T>(operation = "operation", result?: any) {
	// 	return (error: any): Observable<any> => {
	// 		// TODO: send the error to remote logging infrastructure
	// 		console.error(error); // log to console instead
	//
	// 		// Let the app keep running by returning an empty result.
	// 		return of(result);
	// 	};
	// }

	handleError(error: HttpErrorResponse) {
		let errMsg = "Unknown error";
		if (error.error instanceof ErrorEvent) {
			// A client-side or network error occurred. Handle it accordingly.
			errMsg = error.error.message;
			console.error("An error occurred:", error.error.message);
		} else {
			// The backend returned an unsuccessful response code.
			// The response body may contain clues as to what went wrong,

			let errObj = JSON.parse(JSON.stringify(error.error));
			errMsg = errObj.error;
			console.error(
				`Backend returned code ${error.status}, ` +
					`body was: ${errMsg}`
			);
		}
		// return an observable with a user-facing error message
		return throwError(errMsg);
	}
}
