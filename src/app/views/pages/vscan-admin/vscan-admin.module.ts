import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { VscanUsersComponent } from "./users/vscan-users.component";
import { VscanEnterprisesComponent } from "./enterprises/vscan-enterprises.component";

@NgModule({
	declarations: [VscanUsersComponent, VscanEnterprisesComponent],
	imports: [CommonModule]
})
export class VscanAdminModule {}
