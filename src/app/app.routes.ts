import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { SiswaComponent } from './components/siswa/siswa';
import { KandidatComponent } from './components/kandidat/kandidat';
import { PemungutanSuaraComponent } from './components/pemungutan-suara/pemungutan-suara';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'siswa',
    component: SiswaComponent
  },
  {
    path: 'kandidat',
    component: KandidatComponent
  },
  {
    path: 'pemungutan-suara',
    component: PemungutanSuaraComponent
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
