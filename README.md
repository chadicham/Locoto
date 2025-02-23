# Locoto

Locoto est une application web de gestion de location de véhicules entre particuliers. Développée par un passionné de location de scooters, elle répond à un besoin réel du marché en offrant une solution complète et intuitive pour les propriétaires souhaitant gérer efficacement leur flotte de véhicules.

## Fonctionnalités principales

- Inscription et authentification des propriétaires
- Enregistrement et gestion des véhicules
- Création de contrats de location personnalisables
- Génération de contrats au format PDF avec signature électronique
- Envoi automatique des contrats par e-mail aux locataires
- Gestion des données des locataires
- Tableau de bord avec statistiques et calendrier des locations
- Intégration de paiements en ligne sécurisés avec Stripe

## Technologies utilisées

- Frontend :
  - React : bibliothèque JavaScript pour la construction de l'interface utilisateur
  - Redux : bibliothèque de gestion d'état pour les applications JavaScript
  - Vite : outil de build et serveur de développement pour les applications web
  - Material-UI (MUI) : bibliothèque de composants React pour la création d'interfaces attrayantes et réactives
- Backend : 
  - Node.js : environnement d'exécution JavaScript côté serveur
  - Express : framework web pour Node.js utilisé pour la création de l'API
  - MongoDB : base de données NoSQL utilisée pour le stockage des données
  - Stripe : plateforme de paiement en ligne pour gérer les transactions sécurisées

## Prérequis

- Node.js (version 14 ou supérieure)
- npm (gestionnaire de paquets Node.js)
- MongoDB (base de données)
- ngrok (pour utiliser Stripe en mode développement)

## Installation

1. Clonez le dépôt GitHub :https://github.com/chadicham/Locoto
2. Accédez au répertoire du projet :cd locoto
3. Installez les dépendances : npm install
4. Configurez les variables d'environnement :
- Créez un fichier `.env` à la racine du projet
- Définissez les variables d'environnement requises (ex: URL de connexion MongoDB, clés d'API Stripe, etc.)

5. Lancez l'application :
- Démarrez le serveur backend :
  ```
  npm run server
  ```
- Démarrez l'application frontend :
  ```
  npm run dev
  ```

6. Accédez à l'application dans votre navigateur à l'adresse `http://localhost:3000`

7. Pour utiliser Stripe en mode développement, suivez ces étapes supplémentaires :
- Installez ngrok globalement :
  ```
  npm install -g ngrok
  ```
- Lancez ngrok pour exposer votre serveur local :
  ```
  ngrok http 5000
  ```
- Copiez l'URL HTTPS générée par ngrok (ex: `https://xxxxxxxx.ngrok.io`)
- Configurez cette URL dans votre tableau de bord Stripe en tant qu'URL de webhook
