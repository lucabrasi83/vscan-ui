import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { VscanUsersComponent } from "./users/vscan-users.component";
import { VscanEnterprisesComponent } from "./enterprises/vscan-enterprises.component";
import { RouterModule, Routes } from "@angular/router";
import { EditUsersComponent } from "./users/edit-users/edit-users.component";
import { ngxLoadingAnimationTypes, NgxLoadingModule } from "ngx-loading";
import { ReactiveFormsModule } from "@angular/forms";
import { PartialsModule } from "../../partials/partials.module";
// Pages
import { CoreModule } from "../../../core/core.module";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatDialogModule } from "@angular/material/dialog";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { EditEnterpriseComponent } from "./enterprises/edit-enterprise/edit-enterprise.component";

const routes: Routes = [
	{
		path: "users",
		component: VscanUsersComponent
	},
	{
		path: "enterprises",
		component: VscanEnterprisesComponent
	}
];

@NgModule({
	declarations: [
		VscanUsersComponent,
		VscanEnterprisesComponent,
		EditUsersComponent,
		EditEnterpriseComponent
	],
	imports: [
		CommonModule,
		PartialsModule,
		CoreModule,
		ReactiveFormsModule,
		RouterModule.forChild(routes),
		NgxLoadingModule.forRoot({
			backdropBackgroundColour: "rgba(0, 0, 0, 0.7)",
			primaryColour: "#ea7926",
			secondaryColour: "#ea7926",
			tertiaryColour: "#ea7926",
			animationType: ngxLoadingAnimationTypes.threeBounce
		}),
		MatButtonModule,
		MatTooltipModule,
		MatFormFieldModule,
		MatInputModule,
		MatIconModule,
		MatTableModule,
		MatSortModule,
		MatCheckboxModule,
		MatChipsModule,
		MatPaginatorModule,
		MatDialogModule,
		MatOptionModule,
		MatSelectModule
	],
	entryComponents: [EditUsersComponent, EditEnterpriseComponent]
})
export class VscanAdminModule {}
