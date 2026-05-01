import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  specialtiesList = [
    'Cuisine française',
    'Pâtisserie',
    'Cuisine italienne',
    'Cuisine végétarienne',
    'Plats rapides',
    'Cuisine asiatique'
  ];

  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    bio: [''],
    specialties: this.fb.array([])
  });

  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  get specialties() {
    return this.registerForm.get('specialties') as FormArray;
  }

  onSpecialtyChange(specialty: string, event: any) {
    const specialtiesArray = this.specialties;
    if (event.checked) {
      specialtiesArray.push(this.fb.control(specialty));
    } else {
      const index = specialtiesArray.controls.findIndex(
        control => control.value === specialty
      );
      if (index >= 0) {
        specialtiesArray.removeAt(index);
      }
    }
  }

  isSpecialtySelected(specialty: string): boolean {
    return this.specialties.controls.some(
      control => control.value === specialty
    );
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const specialties = this.registerForm.value.specialties || [];
      const registerData = {
        email: this.registerForm.value.email!,
        password: this.registerForm.value.password!,
        firstName: this.registerForm.value.firstName!,
        lastName: this.registerForm.value.lastName!,
        bio: this.registerForm.value.bio,
        specialties: Array.isArray(specialties) ? specialties.filter(Boolean) : []
      };
      
      this.authService.register(registerData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Cet email est déjà utilisé ou une erreur est survenue';
          console.error('Register error:', err);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}