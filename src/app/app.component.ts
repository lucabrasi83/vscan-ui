import { Observable, Subject, Subscription, throwError, timer } from "rxjs";
// Angular
import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
// Layout
import {
	LayoutConfigService,
	SplashScreenService,
	TranslationService
} from "./core/_base/layout";
// language list
import { locale as enLang } from "./core/_config/i18n/en";
import { locale as chLang } from "./core/_config/i18n/ch";
import { locale as esLang } from "./core/_config/i18n/es";
import { locale as jpLang } from "./core/_config/i18n/jp";
import { locale as deLang } from "./core/_config/i18n/de";
import { locale as frLang } from "./core/_config/i18n/fr";
import { select, Store } from "@ngrx/store";
import { AppState } from "./core/reducers";
import { AuthService } from "./core/auth/_services";
import { AuthNoticeService, isLoggedIn, Login, Logout } from "./core/auth";
import { MatDialog } from "@angular/material/dialog";
import { RefreshSessionComponent } from "./views/pages/auth/refresh-session/refresh-session.component";
import {
	catchError,
	repeatWhen,
	switchMap,
	takeUntil,
	tap
} from "rxjs/operators";

@Component({
	// tslint:disable-next-line:component-selector
	selector: "body[kt-root]",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
	// Public properties
	title = "VSCAN";
	loader: boolean;
	private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

	private readonly _stop = new Subject<void>();
	private readonly _start = new Subject<void>();

	/**
	 * Component constructor
	 *
	 * @param translationService: TranslationService
	 * @param router: Router
	 * @param layoutConfigService: LayoutCongifService
	 * @param splashScreenService: SplashScreenService
	 * @param store: Store
	 * @param auth: AuthService
	 * @param notice: AuthNoticeService
	 * @param dialog: MatDialog
	 */
	constructor(
		private translationService: TranslationService,
		private router: Router,
		private layoutConfigService: LayoutConfigService,
		private splashScreenService: SplashScreenService,
		private store: Store<AppState>,
		private auth: AuthService,
		private notice: AuthNoticeService,
		public dialog: MatDialog
	) {
		// register translations
		this.translationService.loadTranslations(
			enLang,
			chLang,
			esLang,
			jpLang,
			deLang,
			frLang
		);
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		// enable/disable loader
		this.loader = this.layoutConfigService.getConfig("loader.enabled");

		const routerSubscription = this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				// hide splash screen
				this.splashScreenService.hide();

				// scroll to top on every route change
				window.scrollTo(0, 0);

				// to display back the body content
				setTimeout(() => {
					document.body.classList.add("kt-page--loaded");
				}, 500);
			}
		});
		this.unsubscribe.push(routerSubscription);

		// User Token Expiration Flow

		// Select loggedIn status from NGRX store
		this.store.pipe(select(isLoggedIn)).subscribe(loggedIn => {
			if (loggedIn) {
				timer(1000)
					.pipe(
						switchMap(() =>
							// Check every 10 seconds JWT expiration date vs current date
							timer(0, 10000).pipe(
								tap(() => {
									let tokenExpDate = this.auth.getTokenExpirationDate();
									let warningDate = tokenExpDate;
									let currentDate = new Date();

									// Logout user immediately if token has expired
									if (tokenExpDate < currentDate) {
										// Set Session Expired Flag
										this.notice.setNotice(
											"Your session has expired. Please login again.",
											"info"
										);
										this.store.dispatch(new Logout());
									}

									// Fire Notice when token is going to expire in 5 minutes
									warningDate.setMinutes(
										warningDate.getMinutes() - 5
									);

									if (warningDate < currentDate) {
										this.stop();
										const dialogRef = this.dialog.open(
											RefreshSessionComponent,
											{
												width: "400px",
												autoFocus: false,
												disableClose: true,
												data: { remainingTime: 300 }
											}
										);
										dialogRef
											.afterClosed()
											.subscribe(res => {
												if (!res) {
													// Set Session Expired Flag
													this.notice.setNotice(
														"Your session has expired. Please login again.",
														"info"
													);

													this.store.dispatch(
														new Logout()
													);
												} else if (res) {
													this.auth
														.refreshToken()
														.pipe(
															tap(res => {
																// Re-emit value in switchMap to restart the timer
																this.start();

																this.store.dispatch(
																	new Login({
																		authToken:
																			res.token
																	})
																);
															}),
															catchError(err => {
																// Set Session Expired Flag
																this.notice.setNotice(
																	"Your session has expired. Please login again.",
																	"info"
																);

																this.store.dispatch(
																	new Logout()
																);

																return throwError(
																	err
																);
															})
														)
														.subscribe();
												}
											});
									}
								}),
								// Emit value until we found the token is about to expire
								takeUntil(this._stop),

								// Restart interval timer Observable once user decides to extend session
								repeatWhen(() => this._start)
							)
						)
					)
					.subscribe();
			}
		});
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.unsubscribe.forEach(sb => sb.unsubscribe());
	}

	start(): void {
		this._start.next();
	}
	stop(): void {
		this._stop.next();
	}
}
