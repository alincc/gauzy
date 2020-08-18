import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NbDialogRef, NbToastrService } from '@nebular/theme';

import { TranslateService } from '@ngx-translate/core';
import { TranslationBaseComponent } from '../../language-base/translation-base.component';
import {
	Employee,
	Skill,
	OrganizationEmploymentType,
	Tag,
	PayPeriodEnum,
	CurrenciesEnum,
	LanguagesEnum
} from '@gauzy/models';
import { OrganizationEmploymentTypesService } from '../../../@core/services/organization-employment-types.service';
import { switchMap, map, tap, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Store } from '../../../@core/services/store.service';
import { EmployeeLevelService } from '../../../@core/services/employee-level.service';

@Component({
	selector: 'ngx-public-page-employee-mutation',
	templateUrl: './public-page-employee-mutation.component.html',
	styleUrls: ['./public-page-employee-mutation.component.scss'],
	providers: [OrganizationEmploymentTypesService]
})
export class PublicPageEmployeeMutationComponent
	extends TranslationBaseComponent
	implements OnInit {
	employee: Employee;
	form: FormGroup;
	employmentTypes$: Observable<OrganizationEmploymentType[]>;
	employeeLevels: { level: string; organizationId: string }[] = [];
	payPeriods = Object.values(PayPeriodEnum);
	currencies = Object.values(CurrenciesEnum);
	languages: string[] = Object.values(LanguagesEnum);
	privacySettings: any[];

	constructor(
		private fb: FormBuilder,
		protected dialogRef: NbDialogRef<PublicPageEmployeeMutationComponent>,
		private readonly toastrService: NbToastrService,
		readonly translateService: TranslateService,
		private organizationEmploymentTypeService: OrganizationEmploymentTypesService,
		private employeeLevelService: EmployeeLevelService,
		private store: Store
	) {
		super(translateService);
	}

	ngOnInit() {
		this._fillPrivacySettings();
		this._initForm();

		this.employmentTypes$ = this.store.selectedOrganization$.pipe(
			filter((organization) => !!organization),
			tap(async (organization) => {
				const { items } = await this.employeeLevelService.getAll(
					organization.id
				);
				this.employeeLevels = items;
			}),
			switchMap((organization) =>
				this.organizationEmploymentTypeService.getAll([], {
					organizationId: organization.id
				})
			),
			map(({ items }) => items)
		);
	}

	private _fillPrivacySettings() {
		const {
			show_anonymous_bonus,
			show_average_bonus,
			show_average_expenses,
			show_average_income,
			show_billrate,
			show_payperiod,
			show_start_work_on
		} = this.employee;

		const privacySettings = {
			show_anonymous_bonus,
			show_average_bonus,
			show_average_expenses,
			show_average_income,
			show_billrate,
			show_payperiod,
			show_start_work_on
		};

		this.privacySettings = Object.keys(privacySettings).map((key) => ({
			key,
			value: privacySettings[key],
			translation: `POP_UPS.${key.toUpperCase()}`
		}));
	}

	private _initForm() {
		this.form = this.fb.group({
			username: this.employee.user.username,
			email: [this.employee.user.email, Validators.required],
			firstName: this.employee.user.firstName,
			lastName: this.employee.user.lastName,
			preferredLanguage: this.employee.user.preferredLanguage,
			short_description: this.employee.short_description,
			description: this.employee.description,
			billRateValue: this.employee.billRateValue,
			billRateCurrency: [
				{ value: this.employee.billRateCurrency, disabled: true }
			],
			reWeeklyLimit: this.employee.reWeeklyLimit,
			startedWorkOn: this.employee.startedWorkOn,
			organizationEmploymentTypes: [
				this.employee.organizationEmploymentTypes || null
			],
			employeeLevel: this.employee.employeeLevel,
			tags: this.employee.tags,
			payPeriod: this.employee.payPeriod,
			show_anonymous_bonus: this.employee.show_anonymous_bonus,
			show_average_bonus: this.employee.show_average_bonus,
			show_average_expenses: this.employee.show_average_expenses,
			show_average_income: this.employee.show_average_income,
			show_billrate: this.employee.show_billrate,
			show_payperiod: this.employee.show_payperiod,
			show_start_work_on: this.employee.show_start_work_on,
			skills: this.employee.skills
		});
	}

	selectedSkillsHandler(skill: Skill) {
		this.form.get('skills').setValue(skill);
	}

	selectedTagsHandler(currentSelection: Tag[]) {
		this.form.get('tags').setValue(currentSelection);
	}

	close() {
		this.dialogRef.close();
	}

	updateEmployee() {
		if (this.form.valid) {
			this.dialogRef.close(this.form.value);
		}
	}
}