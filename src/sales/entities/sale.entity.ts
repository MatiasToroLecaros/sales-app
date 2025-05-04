// backend/src/sales/entities/sale.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity('VENTAS') // Table name in Spanish and uppercase
export class Sale {
  @PrimaryGeneratedColumn({ name: 'ID_VENTA' })
  id: number;

  @Column({ name: 'ID_PRODUCTO' })
  productId: number;

  @Column({ name: 'ID_USUARIO' })
  userId: number;
  
  @Column({ name: 'CANTIDAD', type: 'int' })
  quantity: number;

  @Column({ 
    name: 'PRECIO_UNITARIO', 
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  unitPrice: number;

  @Column({ name: 'FECHA_VENTA', type: 'timestamp' })
  date: Date;

  @ManyToOne(() => Product, product => product.sales, { 
    onDelete: 'RESTRICT', 
    onUpdate: 'CASCADE' 
  })
  @JoinColumn({ name: 'ID_PRODUCTO' }) // Foreign key column name
  product: Product;

  @ManyToOne(() => User, user => user.sales, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'ID_USUARIO' })
  user: User;
}