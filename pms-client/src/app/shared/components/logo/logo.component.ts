import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/dashboard" class="logo-wrap" [class.logo-vertical]="orientation === 'vertical'">

      <!-- UAE-inspired icon badge -->
      <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 48 52"
           xmlns="http://www.w3.org/2000/svg" class="logo-svg">
        <defs>
          <clipPath [attr.id]="clipId">
            <rect width="48" height="52" rx="11"/>
          </clipPath>
          <linearGradient [attr.id]="gradId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#005C35"/>
            <stop offset="100%" stop-color="#003d24"/>
          </linearGradient>
        </defs>

        <!-- Clipped group: all layers sit inside the rounded rect -->
        <g [attr.clip-path]="'url(#' + clipId + ')'">

          <!-- Green background -->
          <rect width="48" height="52" [attr.fill]="'url(#' + gradId + ')'"/>

          <!-- UAE Flag red stripe (left) -->
          <rect x="0" y="0" width="9" height="52" fill="#CE1126"/>

          <!-- Gold top band -->
          <rect x="0" y="0" width="48" height="3.5" fill="#C9A028"/>

          <!-- Gold bottom band -->
          <rect x="0" y="48.5" width="48" height="3.5" fill="#C9A028"/>

          <!-- ── Tower silhouette (Burj Khalifa-inspired) ── -->
          <!-- Spire — gold -->
          <rect x="27" y="5" width="2.5" height="11" rx="1.2" fill="#C9A028"/>

          <!-- Level 1 — white (narrow top) -->
          <rect x="24" y="15" width="8" height="4.5" rx="1" fill="white"/>

          <!-- Level 2 -->
          <rect x="21" y="19" width="14" height="4" fill="white"/>

          <!-- Level 3 -->
          <rect x="18" y="23" width="20" height="4" fill="white"/>

          <!-- Level 4 / podium -->
          <rect x="14" y="27" width="28" height="4" fill="white"/>

          <!-- Base block -->
          <rect x="11" y="31" width="34" height="14" fill="white"/>

          <!-- Windows — level 2 -->
          <rect x="23" y="20" width="2.5" height="2.5" fill="#004d2c" opacity="0.7"/>
          <rect x="28" y="20" width="2.5" height="2.5" fill="#004d2c" opacity="0.7"/>

          <!-- Windows — level 3 -->
          <rect x="20" y="24" width="2.5" height="2.5" fill="#004d2c" opacity="0.7"/>
          <rect x="25.5" y="24" width="2.5" height="2.5" fill="#004d2c" opacity="0.7"/>
          <rect x="31" y="24" width="2.5" height="2.5" fill="#004d2c" opacity="0.7"/>

          <!-- Windows — base (two rows) -->
          <rect x="14" y="32" width="3" height="3" fill="#004d2c" opacity="0.6"/>
          <rect x="20" y="32" width="3" height="3" fill="#004d2c" opacity="0.6"/>
          <rect x="26" y="32" width="3" height="3" fill="#004d2c" opacity="0.6"/>
          <rect x="32" y="32" width="3" height="3" fill="#004d2c" opacity="0.6"/>
          <rect x="38" y="32" width="3" height="3" fill="#004d2c" opacity="0.6"/>

          <rect x="14" y="37" width="3" height="3" fill="#004d2c" opacity="0.6"/>
          <rect x="20" y="37" width="3" height="3" fill="#004d2c" opacity="0.6"/>
          <rect x="26" y="37" width="3" height="3" fill="#004d2c" opacity="0.6"/>
          <rect x="32" y="37" width="3" height="3" fill="#004d2c" opacity="0.6"/>
          <rect x="38" y="37" width="3" height="3" fill="#004d2c" opacity="0.6"/>

        </g>

        <!-- Gold border ring -->
        <rect width="48" height="52" rx="11" fill="none" stroke="#C9A028"
              stroke-width="1.5" opacity="0.5"/>
      </svg>

      <!-- Text block -->
      <div class="logo-text-block">
        <span class="logo-name">PMS</span>
        <span class="logo-sub">Project Management</span>
      </div>

    </a>
  `,
  styles: [`
    .logo-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      cursor: pointer;
    }
    .logo-wrap:hover .logo-svg {
      filter: drop-shadow(0 2px 8px rgba(201,160,40,0.4));
      transition: filter 0.2s;
    }
    .logo-vertical {
      flex-direction: column;
      gap: 0.875rem;
    }

    /* Sidebar (dark bg) defaults */
    .logo-name {
      display: block;
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: 3px;
      color: #C9A028;
      line-height: 1;
    }
    .logo-sub {
      display: block;
      font-size: 0.68rem;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.55);
      margin-top: 0.25rem;
    }

    /* Light theme override (login page) */
    :host(.light) .logo-name  { color: #1e293b; }
    :host(.light) .logo-sub   { color: #64748b; }
    :host(.light) .logo-text-block { text-align: center; }
  `]
})
export class LogoComponent implements OnInit {
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() iconSize = 44;

  clipId = '';
  gradId = '';

  ngOnInit() {
    const uid = Math.random().toString(36).slice(2, 8);
    this.clipId = `logo-clip-${uid}`;
    this.gradId = `logo-grad-${uid}`;
  }
}
