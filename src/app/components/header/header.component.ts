import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() mode: 'light' | 'dark' = 'light';
  @Output() toggleTheme = new EventEmitter<void>();

  get label(): string {
    return this.mode === 'dark' ? 'Day mode' : 'Night mode';
  }

  get icon(): string {
    return this.mode === 'dark' ? '☀️' : '🌙';
  }

  onToggle(): void {
    this.toggleTheme.emit();
  }
}
