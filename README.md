# Hospital Frontend

Este proyecto corresponde a la interfaz de usuario del Sistema de Gestión Hospitalaria.

## Requisitos previos
- Node.js (v16 o superior recomendado)
- npm (Node Package Manager)

## Instalación y ejecución

1. Clona el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>

2. Ingresa a la carpeta del frontend
   ```bash
    cd frontendAng/hospital-frontend
    ```
3. Instala las dependencias
   ```bash
   npm install
   ```
4. Ejecuta el proyecto
   ```bash
   ng serve
   ```
5. Accede a la aplicación en tu navegador
   ```bash
   http://localhost:4200
   ```
   ### Estructura de archivos principal
    frontendAng/
├── hospital-frontend/
│   ├── .angular/
│   ├── .editorconfig
│   ├── .gitignore
│   ├── .vscode/
│   ├── README.md
│   ├── angular.json
│   ├── package-lock.json
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.css
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   ├── login.component.ts
│   │   │   │   ├── register/
│   │   │   │   │   ├── register.component.css
│   │   │   │   │   ├── register.component.html
│   │   │   │   │   ├── register.component.ts
│   │   │   ├── shared/
│   │   │   │   ├── styles/
│   │   │   │   │   ├── auth.styles.css        
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   └── tsconfig.spec.json
├── package-lock.json
└── package.json