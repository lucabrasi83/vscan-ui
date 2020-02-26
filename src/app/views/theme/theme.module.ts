import { NgxPermissionsModule } from "ngx-permissions";
// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
// Angular Material
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
// NgBootstrap
import {
	NgbProgressbarModule,
	NgbTooltipModule
} from "@ng-bootstrap/ng-bootstrap";
// Translation
import { TranslateModule } from "@ngx-translate/core";
// Loading bar
import { LoadingBarModule } from "@ngx-loading-bar/core";
// NGRX
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
// Ngx DatePicker
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
// Perfect Scrollbar
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
// SVG inline
import { InlineSVGModule } from "ng-inline-svg";
// Core Module
import { CoreModule } from "../../core/core.module";
import { HeaderComponent } from "./header/header.component";
import { AsideLeftComponent } from "./aside/aside-left.component";
import { FooterComponent } from "./footer/footer.component";
import { SubheaderComponent } from "./subheader/subheader.component";
import { BrandComponent } from "./brand/brand.component";
import { TopbarComponent } from "./header/topbar/topbar.component";
import { MenuHorizontalComponent } from "./header/menu-horizontal/menu-horizontal.component";
import { PartialsModule } from "../partials/partials.module";
import { BaseComponent } from "./base/base.component";
import { PagesModule } from "../pages/pages.module";
import { HtmlClassService } from "./html-class.service";
import { HeaderMobileComponent } from "./header/header-mobile/header-mobile.component";
import { ErrorPageComponent } from "./content/error-page/error-page.component";
import {
	PermissionEffects,
	permissionsReducer,
	RoleEffects,
	rolesReducer
} from "../../core/auth";

import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { MatListModule } from "@angular/material/list";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { TataFooterComponent } from "./tata-footer/tata-footer.component";

@NgModule({
	declarations: [
		BaseComponent,
		FooterComponent,

		// headers
		HeaderComponent,
		BrandComponent,
		HeaderMobileComponent,

		// subheader
		SubheaderComponent,

		// topbar components
		TopbarComponent,

		// aside left menu components
		AsideLeftComponent,

		// horizontal menu components
		MenuHorizontalComponent,

		ErrorPageComponent,

		TataFooterComponent
	],
	exports: [
		BaseComponent,
		FooterComponent,

		// headers
		HeaderComponent,
		BrandComponent,
		HeaderMobileComponent,

		// subheader
		SubheaderComponent,

		// topbar components
		TopbarComponent,

		// aside left menu components
		AsideLeftComponent,

		// horizontal menu components
		MenuHorizontalComponent,

		TataFooterComponent,

		ErrorPageComponent
	],
	providers: [HtmlClassService],
	imports: [
		CommonModule,
		RouterModule,
		NgxPermissionsModule.forChild(),
		StoreModule.forFeature("roles", rolesReducer),
		StoreModule.forFeature("permissions", permissionsReducer),
		EffectsModule.forFeature([PermissionEffects, RoleEffects]),
		PagesModule,
		PartialsModule,
		CoreModule,
		PerfectScrollbarModule,
		FormsModule,
		MatProgressBarModule,
		MatTabsModule,
		MatButtonModule,
		MatSelectModule,
		MatOptionModule,
		MatTooltipModule,
		TranslateModule.forChild(),
		LoadingBarModule,
		NgxDaterangepickerMd,
		InlineSVGModule,

		// ng-bootstrap modules
		NgbProgressbarModule,
		NgbTooltipModule,
		MatListModule,
		MatToolbarModule,
		MatIconModule
	]
})
export class ThemeModule {}
