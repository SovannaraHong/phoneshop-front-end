import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { RoleType } from '../../core/models/user.model';
import { RoleService } from '../../core/services/role/role-service';
import { CommonModule } from '@angular/common';
import { ProductForm } from '../../content/product-form/product-form';

@Component({
  selector: 'app-product',
  imports: [CommonModule, ProductForm],
  standalone: true,
  templateUrl: './product.html',
  styleUrl: './product.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Product implements OnInit {
  roleList$!: Observable<RoleType[]>;
  private roleService = inject(RoleService);
  ngOnInit(): void {
    this.loadRole();
  }
  loadRole() {
    this.roleList$ = this.roleService.getRoles();
  }
}
