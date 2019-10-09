// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
// Partials
import { PartialsModule } from "../partials/partials.module";
// Pages
import { CoreModule } from "../../core/core.module";
import { VscanDevicesComponent } from "./vscan-devices/vscan-devices.component";
import { MatButtonModule } from "@angular/material/button";

@NgModule({
	declarations: [VscanDevicesComponent],
	exports: [],
	imports: [
		CommonModule,
		HttpClientModule,
		FormsModule,
		CoreModule,
		PartialsModule,
		MatButtonModule
	],
	providers: []
})
export class PagesModule {}
