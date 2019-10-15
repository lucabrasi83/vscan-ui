// Angular
import { Injectable } from "@angular/core";
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot
} from "@angular/router";
// RxJS
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
// NGRX
import { select, Store } from "@ngrx/store";
// Auth reducers and selectors
import { AppState } from "../../../core/reducers/";
import { isLoggedIn } from "../_selectors/auth.selectors";
import { AuthService } from "../_services";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private store: Store<AppState>,
		private router: Router,
		private auth: AuthService
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean> {
		return this.store.pipe(
			select(isLoggedIn),
			tap(loggedIn => {
				const isTokenExpired = this.auth.isTokenExpired();

				if (!loggedIn) {
					this.router.navigateByUrl("/auth/login");
				} else if (isTokenExpired) {
					this.router.navigateByUrl("/auth/login");
					return false;
				}
			})
		);
	}
}
