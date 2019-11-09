import { Injectable } from "@angular/core";
import { CanLoad, Route, Router, UrlSegment } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../_services";

@Injectable({
	providedIn: "root"
})
export class AdminLoadGuard implements CanLoad {
	constructor(private auth: AuthService, private router: Router) {}
	canLoad(
		route: Route,
		segments: UrlSegment[]
	): Observable<boolean> | Promise<boolean> | boolean {
		if (!this.auth.isUserRoot()) {
			this.router.navigateByUrl("/dashboard");
			return false;
		}
		return true;
	}
}
