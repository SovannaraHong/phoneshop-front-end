import { trigger, transition, style, animate, stagger, query } from '@angular/animations';

export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        stagger(
          60,
          animate(
            '480ms cubic-bezier(0.35, 0, 0.25, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }),
          ),
        ),
      ],
      { optional: true },
    ),
    query(
      ':leave',
      [
        stagger(
          30,
          animate(
            '300ms cubic-bezier(0.35, 0, 0.25, 1)',
            style({ opacity: 0, transform: 'translateY(-10px)' }),
          ),
        ),
      ],
      { optional: true },
    ),
  ]),
]);

export const statAnimation = trigger('statAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(12px)' }),
    animate(
      '560ms cubic-bezier(0.35, 0, 0.25, 1)',
      style({ opacity: 1, transform: 'translateY(0)' }),
    ),
  ]),
]);

export const toastAnimation = trigger('toastAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(32px)' }),
    animate(
      '480ms cubic-bezier(0.22, 1, 0.36, 1)',
      style({ opacity: 1, transform: 'translateX(0)' }),
    ),
  ]),
  transition(':leave', [
    animate(
      '300ms cubic-bezier(0.22, 1, 0.36, 1)',
      style({ opacity: 0, transform: 'translateX(32px)' }),
    ),
  ]),
]);

// 👇 NEW — smooth route transition
export const routeAnimation = trigger('routeAnimation', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '520ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ],
      { optional: true },
    ),
    query(
      ':leave',
      [
        animate(
          '280ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 0, transform: 'translateY(-12px)' }),
        ),
      ],
      { optional: true },
    ),
  ]),
]);
