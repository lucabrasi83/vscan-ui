// Angular
import { Component, Input, OnInit } from "@angular/core";
// RxJS
import { Observable } from "rxjs";
// NGRX
import { select, Store } from "@ngrx/store";
// State
import { AppState } from "../../../../../core/reducers";
import {
	AuthService,
	currentUser,
	Logout,
	User
} from "../../../../../core/auth";

@Component({
	selector: "kt-user-profile",
	templateUrl: "./user-profile.component.html"
})
export class UserProfileComponent implements OnInit {
	// Public properties
	user$: Observable<User>;
	userEmail: string;
	userName: string;

	@Input() avatar: boolean = true;
	@Input() greeting: boolean = true;
	@Input() badge: boolean;
	@Input() icon: boolean;

	/**
	 * Component constructor
	 *
	 * @param store: Store<AppState>
	 *
	 * @param auth: AuthService
	 *
	 */
	constructor(private store: Store<AppState>, private auth: AuthService) {}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		// this.user$ = this.store.pipe(select(currentUser));
		this.userEmail = this.auth.getUserTokenField("email");

		// Fallback username
		this.userName = this.userEmail.split("@")[0];
	}

	/**
	 * Log out
	 */
	logout() {
		this.store.dispatch(new Logout());
	}
}
