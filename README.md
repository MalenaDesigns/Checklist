# Checklist

Proyecto de prueba en Next.js con CRUD de tareas.

## Funcionalidades

- Crear tarea
- Listar tareas
- Editar titulo
- Marcar completada/no completada
- Eliminar tarea

## Ejecutar local

```bash
npm install
npm run dev
```

## Configuracion de GitHub

1. Edita `.github/CODEOWNERS` y reemplaza `OWNER_GITHUB_USERNAME` por tu usuario real.
2. En GitHub, activa branch protection para `main` con:
   - `Require a pull request before merging`
   - `Require approvals`: `1`
   - `Require review from Code Owners`
3. Dependabot ya esta configurado en `.github/dependabot.yml` para revisar dependencias npm semanalmente.
