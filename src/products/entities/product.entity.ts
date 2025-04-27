// backend/src/products/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';

@Entity('PRODUCTOS') // Nombre de tabla en español y mayúsculas
export class Product {
  @PrimaryGeneratedColumn({ name: 'ID_PRODUCTO' })
  id: number;

  @Column({ 
    name: 'NOMBRE_PRODUCTO', 
    type: 'varchar', 
    length: 100 
  })
  name: string;

  @Column({ 
    name: 'DESCRIPCION_PRODUCTO', 
    type: 'text', 
    nullable: true 
  })
  description: string;

  @OneToMany(() => Sale, sale => sale.product)
  sales: Sale[];
}