import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SshGwEditComponent } from "./ssh-gw-edit.component";

describe("SshGwEditComponent", () => {
	let component: SshGwEditComponent;
	let fixture: ComponentFixture<SshGwEditComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SshGwEditComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SshGwEditComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
