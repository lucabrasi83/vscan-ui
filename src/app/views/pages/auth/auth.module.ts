// Angular
import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
// Material
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
// Translate
import { TranslateModule } from "@ngx-translate/core";
// NGRX
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
// CRUD
import { InterceptService } from "../../../core/_base/crud/";
// Module components
import { AuthComponent } from "./auth.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { AuthNoticeComponent } from "./auth-notice/auth-notice.component";
// Auth
import {
	AuthEffects,
	AuthGuard,
	authReducer,
	AuthService
} from "../../../core/auth";
import { JwtModule } from "@auth0/angular-jwt";
import { RefreshSessionComponent } from "./refresh-session/refresh-session.component";
import { MatIconModule } from "@angular/material/icon";
import { CountdownModule } from "ngx-countdown";

const routes: Routes = [
	{
		path: "",
		component: AuthComponent,
		children: [
			{
				path: "",
				redirectTo: "login",
				pathMatch: "full"
			},
			{
				path: "login",
				component: LoginComponent,
				data: { returnUrl: window.location.pathname }
			},
			{
				path: "register",
				component: RegisterComponent
			},
			{
				path: "forgot-password",
				component: ForgotPasswordComponent
			}
		]
	}
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		RouterModule.forChild(routes),
		MatInputModule,
		MatFormFieldModule,
		MatCheckboxModule,
		TranslateModule.forChild(),
		StoreModule.forFeature("auth", authReducer),
		EffectsModule.forFeature([AuthEffects]),
		MatIconModule,
		CountdownModule
	],
	providers: [
		InterceptService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: InterceptService,
			multi: true
		}
	],
	exports: [AuthComponent],
	declarations: [
		AuthComponent,
		LoginComponent,
		RegisterComponent,
		ForgotPasswordComponent,
		AuthNoticeComponent,
		RefreshSessionComponent
	],
	entryComponents: [RefreshSessionComponent]
})
export class AuthModule {
	static forRoot(): ModuleWithProviders<AuthModule> {
		return {
			ngModule: AuthModule,
			providers: [AuthService, AuthGuard]
		};
	}
}
