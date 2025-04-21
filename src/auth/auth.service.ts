import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  private usuarios: Usuario[] = [];
  private idCounter = 1;

  constructor(private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const existe = this.usuarios.find(u => u.email === dto.email);
    if (existe) throw new UnauthorizedException('El usuario ya existe');

    const hashed = await bcrypt.hash(dto.password, 10);
    const nuevo = {
      id: this.idCounter++,
      nombre: dto.nombre,
      email: dto.email,
      password: hashed,
    };
    this.usuarios.push(nuevo);
    return { message: 'Usuario registrado con éxito' };
  }

  async login(dto: LoginDto) {
    const usuario = this.usuarios.find(u => u.email === dto.email);
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    const match = await bcrypt.compare(dto.password, usuario.password);
    if (!match) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { email: usuario.email, sub: usuario.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
