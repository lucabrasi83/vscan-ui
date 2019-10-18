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
import { environment } from "../../../../environments/environment";
import { AuthNoticeService } from "../auth-notice/auth-notice.service";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private store: Store<AppState>,
		private router: Router,
		private auth: AuthService,
		private notice: AuthNoticeService
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean> {
		return this.store.pipe(
			select(isLoggedIn),
			tap(loggedIn => {
				const isTokenInvalid = this.auth.isTokenInvalid();

				if (!loggedIn) {
					localStorage.removeItem(environment.vscanJWT);
					// Set Session Expired Flag
					this.notice.setNotice(
						"Session has expired. Please login again.",
						"info"
					);
					this.router.navigateByUrl("/auth/login");
				} else if (isTokenInvalid) {
					localStorage.removeItem(environment.vscanJWT);
					// Set Session Expired Flag
					this.notice.setNotice(
						"Session has expired. Please login again.",
						"info"
					);
					this.router.navigateByUrl("/auth/login");
					return false;
				}
			})
		);
	}
}
