# CMS Blog - Guide de Développement

## Architecture de Développement Robuste

Ce projet utilise un système de gestion des ports automatique pour éviter les conflits `EADDRINUSE`.

## Installation Initiale

```bash
# Installer toutes les dépendances
npm run setup

# Ou manuellement:
npm run setup:backend  # Backend NestJS
npm run setup:frontend # Frontend Angular
```

## Commandes de Développement

### Démarrage Automatique (Recommandé)
```bash
# Démarre backend + frontend avec gestion automatique des ports
npm run dev
```

### Commandes Individuelles
```bash
# Backend uniquement
npm run dev:backend

# Frontend uniquement  
npm run dev:frontend

# Nettoyage des ports
npm run kill-ports
```

### Gestion des Ports

Le système gère automatiquement:
- **Détection** des ports occupés
- **Libération** propre des processus
- **Fallback** sur ports alternatifs si nécessaire

**Ports par défaut:**
- Backend: `3001` (fallback: 3002, 3003, 3004, 3005)
- Frontend: `4200` (fallback: 4201, 4202, 4203, 4204)

## Configuration

### Variables d'Environnement

Le fichier `.env` à la racine configure les ports globaux:
```env
BACKEND_PORT=3001
FRONTEND_PORT=4200
```

### Accès aux Applications

Une fois démarré:
- **Backend API**: http://localhost:3001/api
- **Frontend**: http://localhost:4200
- **Documentation API**: http://localhost:3001/api/docs

## Bonnes Pratiques

### Arrêt Propre
```bash
# Ctrl+C dans le terminal (arrêt gracieux)
# Ou manuellement:
npm run kill-ports
```

### Nettoyage Complet
```bash
# Nettoyer node_modules et builds
npm run clean

# Réinstaller proprement
npm run setup
```

### Dépannage

#### Si les ports sont toujours occupés:
```bash
# Nettoyage manuel
sudo lsof -ti:3001 | xargs kill -TERM
sudo lsof -ti:4200 | xargs kill -TERM

# Ou utiliser le script automatique
node scripts/cleanup-ports.js
```

#### Si l'API ne répond pas:
1. Vérifier que MongoDB tourne: `mongod`
2. Vérifier les logs du backend dans la console
3. Redémarrer avec: `npm run dev`

## Architecture Technique

### Scripts Automatisés

- **`port-manager.js`**: Gestion intelligente des ports
- **`dev-server.js`**: Serveur de développement unifié
- **`cleanup-ports.js`**: Nettoyage des processus

### Sécurité des Ports

- Détection automatique des conflits
- Arrêt gracieux avec SIGTERM
- Forçage avec SIGKILL en dernier recours
- Timeout configurable pour éviter les blocages

### Experience Développeur (DX)

- **Commande unique**: `npm run dev`
- **Logs séparés et clairs**
- **Information d'accès automatique**
- **Gestion des erreurs non bloquante**

## Production

Pour la production, utilisez:
```bash
npm run build
npm run start:prod
```

---

## Résumé des Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre tout automatiquement |
| `npm run setup` | Installation complète |
| `npm run clean` | Nettoyage complet |
| `npm run kill-ports` | Tue les processus sur les ports |
| `npm run status` | Affiche les URLs d'accès |

**Plus jamais de problèmes EADDRINUSE !**
