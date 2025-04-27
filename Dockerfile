# Usamos una imagen oficial de Node.js como base
FROM node:20-alpine

# Seteamos directorio de trabajo
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Build de la app NestJS
RUN npm run build

# Exponemos el puerto que usa NestJS
EXPOSE 3000

# Comando para correr la app
CMD ["npm", "run", "start:prod"]
