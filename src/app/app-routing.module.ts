// Angular
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
// Components
import { BaseComponent } from "./views/theme/base/base.component";
import { ErrorPageComponent } from "./views/theme/content/error-page/error-page.component";
// Auth
import { AuthGuard } from "./core/auth";
import { VscanDevicesComponent } from "./views/pages/vscan-devices/inventory-list/vscan-devices.component";
import { OndemandScanComponent } from "./views/pages/ondemand-scan/ondemand-scan.component";
import { VscanDeviceCredsComponent } from "./views/pages/vscan-device-creds/vscan-device-creds.component";

const routes: Routes = [
	{
		path: "auth",
		loadChildren: () =>
			import("./views/pages/auth/auth.module").then(m => m.AuthModule)
	},

	{
		path: "",
		component: BaseComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: "dashboard",
				loadChildren: () =>
					import("./views/pages/dashboard/dashboard.module").then(
						m => m.DashboardModule
					),
				canActivate: [AuthGuard]
			},

			{
				path: "builder",
				loadChildren: () =>
					import("./views/theme/content/builder/builder.module").then(
						m => m.BuilderModule
					)
			},
			{
				path: "scan/devices",
				component: VscanDevicesComponent,
				canActivate: [AuthGuard]
			},
			{
				path: "scan/ondemand",
				component: OndemandScanComponent,
				canActivate: [AuthGuard]
			},
			{
				path: "settings/device-credentials",
				component: VscanDeviceCredsComponent,
				canActivate: [AuthGuard]
			},
			{
				path: "error/403",
				component: ErrorPageComponent,
				data: {
					type: "error-v6",
					code: 403,
					title: "403... Access forbidden",
					desc:
						"Looks like you don't have permission to access for requested page.<br> Please, contact administrator"
				}
			},
			{ path: "error/:type", component: ErrorPageComponent },
			{ path: "", redirectTo: "dashboard", pathMatch: "full" },
			{ path: "**", redirectTo: "dashboard", pathMatch: "full" }
		]
	},

	{ path: "**", redirectTo: "error/403", pathMatch: "full" }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
