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
import { DeviceVulnDetailsComponent } from "./vscan-devices/device-vuln-details/device-vuln-details.component";
import { MatDialogModule } from "@angular/material/dialog";
import { VscanScanComponent } from "./vscan-devices/vscan-scan/vscan-scan.component";
import { MatStepperModule } from "@angular/material/stepper";
import { MatProgressButtonsModule } from "mat-progress-buttons";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { ScanResultsComponent } from "./vscan-devices/vscan-scan/scan-results/scan-results.component";
import { MatCardModule } from "@angular/material/card";
import { MatListModule } from "@angular/material/list";
import { MatExpansionModule } from "@angular/material/expansion";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { OndemandScanComponent } from "./ondemand-scan/ondemand-scan.component";
import { OndemandResultsComponent } from "./ondemand-scan/ondemand-results/ondemand-results.component";
import { ChartsModule } from "ng2-charts";
import { VscanDeviceCredsComponent } from "./vscan-device-creds/vscan-device-creds.component";
import { VscanSshGatewaysComponent } from "./vscan-ssh-gateways/vscan-ssh-gateways.component";
import { VscanJobsComponent } from "./vscan-jobs/vscan-jobs.component";
import { VscanInventoryComponent } from "./vscan-inventory/vscan-inventory.component";

@NgModule({
	declarations: [
		VscanDevicesComponent,
		DeviceVulnDetailsComponent,
		VscanScanComponent,
		ScanResultsComponent,
		OndemandScanComponent,
		OndemandResultsComponent,
		VscanDeviceCredsComponent,
		VscanSshGatewaysComponent,
		VscanJobsComponent,
		VscanInventoryComponent
	],
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
		MatDialogModule,
		MatStepperModule,
		MatProgressButtonsModule,
		MatProgressBarModule,
		PerfectScrollbarModule,
		MatCardModule,
		MatListModule,
		MatExpansionModule,
		NgxDatatableModule,
		ChartsModule
	],
	entryComponents: [DeviceVulnDetailsComponent, VscanScanComponent],
	providers: []
})
export class PagesModule {}
