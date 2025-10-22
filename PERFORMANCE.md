# Guide d'optimisation des performances - Locoto

## ✅ Optimisations implémentées

### Frontend (Vite + React)

#### 1. **Code Splitting et Lazy Loading**
- ✅ Configuration Vite avec manualChunks pour séparer les vendors
- ✅ Lazy loading de toutes les routes avec React.lazy()
- ✅ Suspense avec indicateur de chargement
- ✅ Suppression automatique des console.log en production

#### 2. **Optimisation des assets**
- ✅ Preconnect et DNS prefetch pour les domaines externes
- ✅ Meta tags optimisés pour SEO et performance
- ✅ Composant LazyImage pour le chargement lazy des images
- ✅ Support de l'attribut loading="lazy" natif

#### 3. **Optimisation des requêtes API**
- ✅ Cache en mémoire pour les requêtes GET (5 minutes)
- ✅ Timeout configuré à 30 secondes
- ✅ Gestion automatique de la déconnexion sur 401
- ✅ Fonctions clearCache() et invalidateCache()

#### 4. **Hooks et utilitaires**
- ✅ Hook useDebounce pour les recherches
- ✅ Fonction debounce utilitaire
- ✅ Composant LazyImage réutilisable

### Backend (Express)

#### 1. **Compression et Cache**
- ✅ Compression gzip avec seuil de 1KB
- ✅ Cache des fichiers statiques (1 an en production)
- ✅ Headers de cache optimisés pour les images

#### 2. **Sécurité et Rate Limiting**
- ✅ Configuration Helmet optimisée
- ✅ Middleware de rate limiting personnalisé
- ✅ Nettoyage automatique des entrées de rate limit

#### 3. **Logging optimisé**
- ✅ Morgan 'dev' en développement
- ✅ Morgan 'combined' en production

## 📋 Recommandations supplémentaires

### Pour aller plus loin :

1. **Service Worker / PWA**
   ```bash
   npm install vite-plugin-pwa -D
   ```
   - Ajoutez le plugin dans vite.config.js
   - Permet le cache offline et les mises à jour en arrière-plan

2. **Optimisation des images**
   ```bash
   npm install vite-plugin-imagemin -D
   ```
   - Compression automatique des images au build

3. **Bundle Analyzer**
   ```bash
   npm install rollup-plugin-visualizer -D
   ```
   - Visualiser la taille des bundles
   - Identifier les dépendances lourdes

4. **Base de données**
   - Ajouter des index sur les champs fréquemment recherchés
   - Utiliser Redis pour le cache et les sessions
   - Implémenter la pagination sur toutes les listes

5. **CDN**
   - Héberger les assets statiques sur un CDN (Cloudflare, AWS CloudFront)
   - Configurer les headers de cache appropriés

6. **Monitoring**
   - Intégrer Google Analytics ou Plausible
   - Ajouter Sentry pour le tracking des erreurs
   - Utiliser Lighthouse CI pour les audits automatiques

## 🚀 Commandes utiles

```bash
# Build en production avec analyse
npm run build

# Prévisualiser le build en production
npm run preview

# Analyser les bundles (après installation du plugin)
npm run build -- --mode analyze

# Tester les performances
npm run lighthouse
```

## 📊 Métriques à surveiller

1. **First Contentful Paint (FCP)** : < 1.8s
2. **Largest Contentful Paint (LCP)** : < 2.5s
3. **Time to Interactive (TTI)** : < 3.8s
4. **Cumulative Layout Shift (CLS)** : < 0.1
5. **Total Blocking Time (TBT)** : < 200ms

## 💡 Bonnes pratiques

1. **Images**
   - Utiliser WebP quand possible
   - Définir width et height pour éviter les CLS
   - Utiliser le composant LazyImage créé

2. **Requêtes API**
   - Toujours utiliser le debounce pour les recherches
   - Invalider le cache après les mutations (POST, PUT, DELETE)
   - Utiliser React Query pour une gestion avancée

3. **Components**
   - Mémoriser les composants lourds avec React.memo
   - Utiliser useMemo et useCallback judicieusement
   - Éviter les re-renders inutiles

4. **Bundle size**
   - Vérifier régulièrement la taille des bundles
   - Utiliser les imports dynamiques pour les fonctionnalités rarement utilisées
   - Tree-shaking automatique avec les imports ES6

## 🔍 Outils de test

- **Lighthouse** : Audit de performance dans Chrome DevTools
- **WebPageTest** : Tests détaillés de performance
- **GTmetrix** : Analyse complète du site
- **Bundle Phobia** : Vérifier la taille des packages npm

## 📝 Notes importantes

- Le cache API est en mémoire et se vide au rechargement
- Le rate limiter est basique et devrait utiliser Redis en production
- Les console.log sont automatiquement supprimés en production
- Les source maps sont désactivées pour réduire la taille du build
