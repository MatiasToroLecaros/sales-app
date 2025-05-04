import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';

@Entity('USUARIOS')
export class User {
  @PrimaryGeneratedColumn({ name: 'ID_USUARIO' })
  id: number;

  @Column({ name: 'NOMBRE_COMPLETO', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'CORREO_ELECTRONICO', type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ name: 'CONTRASENA', type: 'varchar', length: 100 })
  password: string;

  @OneToMany(() => Sale, sale => sale.user,{
    onDelete: 'CASCADE'
  })
  sales: Sale[];
}