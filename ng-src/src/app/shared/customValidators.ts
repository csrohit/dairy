import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export const confirmPasswrdValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value ? null : { passwordMatched: true };
};
