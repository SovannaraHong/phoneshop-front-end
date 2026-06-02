import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sum',
  standalone: true,
})
export class SumPipe implements PipeTransform {
  transform<T>(items: T[] | null | undefined, key: keyof T): number {
    if (!items || !Array.isArray(items)) return 0;

    return items.reduce((total, item) => {
      const value = item?.[key];

      // ensure it's a number
      const num = typeof value === 'number' ? value : Number(value);

      return total + (isNaN(num) ? 0 : num);
    }, 0);
  }
}
