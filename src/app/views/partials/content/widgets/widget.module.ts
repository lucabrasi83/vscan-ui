import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { CoreModule } from "../../../../core/core.module";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
// Datatable
import { DataTableComponent } from "./general/data-table/data-table.component";
// General widgets
import { Widget1Component } from "./widget1/widget1.component";
import { Widget4Component } from "./widget4/widget4.component";
import { Widget5Component } from "./widget5/widget5.component";
import { Widget12Component } from "./widget12/widget12.component";
import { Widget14Component } from "./widget14/widget14.component";
import { Widget26Component } from "./widget26/widget26.component";
import { Timeline2Component } from "./timeline2/timeline2.component";
import { ChartSampleComponent } from "./chart-sample/chart-sample.component";
import { ChartsModule } from "ng2-charts";

@NgModule({
	declarations: [
		DataTableComponent,
		// Widgets
		Widget1Component,
		Widget4Component,
		Widget5Component,
		Widget12Component,
		Widget14Component,
		Widget26Component,
		Timeline2Component,
		ChartSampleComponent
	],
	exports: [
		DataTableComponent,
		// Widgets
		Widget1Component,
		Widget4Component,
		Widget5Component,
		Widget12Component,
		Widget14Component,
		Widget26Component,
		Timeline2Component,
		ChartSampleComponent
	],
	imports: [
		CommonModule,
		PerfectScrollbarModule,
		MatTableModule,
		CoreModule,
		MatIconModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		MatPaginatorModule,
		MatSortModule,
		ChartsModule
	]
})
export class WidgetModule {}
