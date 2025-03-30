# Empleos API

## Configuración rápida

### 1. Crear y activar entorno virtual
#### Windows:
```sh
python -m venv venv

# Para Git Bash / WSL:
source venv/Scripts/activate 

# Para CMD / PowerShell:
venv\Scripts\activate
```
#### Linux / Mac:
```sh
python -m venv venv
source venv/bin/activate
```

### 2. Instalar dependencias
```sh
pip install -r requirements.txt
```

### 3. Aplicar migraciones

Si es la **primera vez**, generar la migración inicial:
```sh
alembic revision --autogenerate -m "Initial migration"
```

Luego, aplicar las migraciones:
```sh
alembic upgrade head
```

### 4. Ejecutar API
```sh
python run.py
```