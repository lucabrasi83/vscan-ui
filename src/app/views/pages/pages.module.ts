// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
// Partials
import { PartialsModule } from "../partials/partials.module";
// Pages
import { CoreModule } from "../../core/core.module";
import { VscanDevicesComponent } from "./vscan-devices/inventory-list/vscan-devices.component";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatIconModule } from "@angular/material/icon";
import { MatSortModule } from "@angular/material/sort";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ngxLoadingAnimationTypes, NgxLoadingModule } from "ngx-loading";
import { MatChipsModule } from "@angular/material/chips";
import { RouterModule } from "@angular/router";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { SelectAutocompleteModule } from "mat-select-autocomplete";

@NgModule({
	declarations: [VscanDevicesComponent],
	exports: [],
	imports: [
		CommonModule,
		HttpClientModule,
		FormsModule,
		CoreModule,
		PartialsModule,
		MatButtonModule,
		MatTableModule,
		MatFormFieldModule,
		MatOptionModule,
		MatSelectModule,
		MatInputModule,
		MatCheckboxModule,
		MatMenuModule,
		MatProgressSpinnerModule,
		MatPaginatorModule,
		MatIconModule,
		MatSortModule,
		MatTooltipModule,
		NgxLoadingModule.forRoot({
			backdropBackgroundColour: "rgba(0, 0, 0, 0.7)",
			primaryColour: "#ea7926",
			secondaryColour: "#ea7926",
			tertiaryColour: "#ea7926",
			animationType: ngxLoadingAnimationTypes.threeBounce
		}),
		MatChipsModule,
		RouterModule.forChild([]),
		MatAutocompleteModule,
		ReactiveFormsModule,
		SelectAutocompleteModule
	],
	providers: []
})
export class PagesModule {}
