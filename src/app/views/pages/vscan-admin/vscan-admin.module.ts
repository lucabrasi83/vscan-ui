import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { VscanUsersComponent } from "./users/vscan-users.component";
import { VscanEnterprisesComponent } from "./enterprises/vscan-enterprises.component";
import { RouterModule, Routes } from "@angular/router";

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
	declarations: [VscanUsersComponent, VscanEnterprisesComponent],
	imports: [CommonModule, RouterModule.forChild(routes)]
})
export class VscanAdminModule {}
