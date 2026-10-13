import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  // Desktop sidebar open (true) vs completely closed (false)
  readonly isSidebarOpen = signal<boolean>(true);

  // Backward-compatibility alias
  readonly isSidebarExpanded = this.isSidebarOpen;

  // Mobile sidebar drawer: open (true) vs closed (false)
  readonly isMobileSidebarOpen = signal<boolean>(false);

  toggleSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.isMobileSidebarOpen.update(v => !v);
    } else {
      this.isSidebarOpen.update(v => !v);
    }
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
    this.isMobileSidebarOpen.set(false);
  }

  openSidebar(): void {
    this.isSidebarOpen.set(true);
    this.isMobileSidebarOpen.set(true);
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update(v => !v);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  openMobileSidebar(): void {
    this.isMobileSidebarOpen.set(true);
  }
}
