import { AbstractControl, ValidationErrors } from '@angular/forms';

export function validUrlValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  // Simple URL pattern (can be adjusted for stricter validation)
  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

  return urlPattern.test(value) ? null : { invalidUrl: true };
}

export function minItemsValidator(min: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control?.value?.length >= min) {
      return null;
    }
    return {
      minItems: {
        requiredLength: min,
        actualLength: control?.value?.length || 0,
      },
    };
  };
}
