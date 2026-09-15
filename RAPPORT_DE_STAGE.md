# 🎓 RAPPORT DE STAGE TECHNIQUE / PROJET DE FIN D'ÉTUDES

**Sujet :** Conception et Développement d'une Plateforme de Réseau Social Fullstack Sécurisée  
**Technologies :** Spring Boot 3 (Java), Next.js (React / TypeScript), SQLite, Docker  
**Auteur :** Stagiaire / Développeur Fullstack  
**Branche du projet :** `oumayma`  
**Dépôt :** `social-network`  

---

## 📑 Sommaire

1. [Introduction Générale & Contexte du Projet](#1-introduction-générale--contexte-du-projet)
2. [Cahier des Charges & Analyse des Besoins](#2-cahier-des-charges--analyse-des-besoins)
   - 2.1 Besoins Fonctionnels
   - 2.2 Besoins Non-Fonctionnels (Sécurité, Performance, UX)
3. [Environnement Technique & Choix Technologiques](#3-environnement-technique--choix-technologiques)
   - 3.1 Stack Backend (Spring Boot, Spring Security, JPA, Flyway)
   - 3.2 Stack Frontend (Next.js, React, TypeScript, Tailwind CSS)
   - 3.3 Infrastructure & DevOps (Docker, Docker Compose, SQLite)
4. [Architecture & Conception du Système](#4-architecture--conception-du-système)
   - 4.1 Architecture Globale Client-Serveur
   - 4.2 Architecture en Couches du Backend
   - 4.3 Modélisation des Données (Base de données & Relations)
5. [Détail des Réalisations & Modules Développés](#5-détail-des-réalisations--modules-développés)
   - 5.1 Module 1 : Authentification & Sécurité Stateful
   - 5.2 Module 2 : Gestion des Profils & Confidentialité
   - 5.3 Module 3 : Système de Suivi (Follow / Unfollow & Followers Modal)
   - 5.4 Module 4 : Téléversement de Photo dès l'Inscription (Upload & Preview)
   - 5.5 Module 5 : Recherche Dynamique d'Utilisateurs (Debounce & Autocomplete)
6. [Défis Techniques & Solutions Apportées](#6-défis-techniques--solutions-apportées)
7. [Validation, Tests & Résultats](#7-validation-tests--résultats)
8. [Bilan Personnel & Compétences Acquises](#8-bilan-personnel--compétences-acquises)
9. [Conclusion & Perspectives](#9-conclusion--perspectives)

---

## 1. Introduction Générale & Contexte du Projet

Dans le cadre de mon stage d'études en ingénierie logicielle / développement web, j'ai participé à la conception et au développement complet d'une application de **réseau social moderne** inspirée des plateformes contemporaines (Facebook, Twitter/X, Instagram).

L'objectif principal était de concevoir une application **Fullstack** robuste, modulaire, sécurisée et évolutive, capable de gérer des profils utilisateurs, des relations sociales (abonnements avec gestion de la vie privée), l'authentification sécurisée, la manipulation de médias et la recherche d'utilisateurs en temps réel.

Ce projet a été réalisé en appliquant les standards industriels : séparation stricte des couches, conteneurisation Docker, versioning de base de données, et typage statique de bout en bout.

---

## 2. Cahier des Charges & Analyse des Besoins

### 2.1 Besoins Fonctionnels

1. **Gestion des Comptes & Authentification :**
   - Inscription d'un nouvel utilisateur avec email unique, mot de passe sécurisé, nom, prénom, date de naissance, pseudo optionnel et biographie.
   - Possibilité d'uploader une photo de profil directement lors de l'inscription depuis la galerie ou les fichiers locaux, avec prévisualisation immédiate.
   - Connexion sécurisée et déconnexion.
   - Persistance de la session active (session conservée après rafraîchissement ou redémarrage serveur).

2. **Gestion des Profils & Vie Privée :**
   - Consultation de son propre profil (`/profile/me`) et modification des informations.
   - Consultation des profils tiers (`/profile/[id]`).
   - Gestion de la confidentialité : choix entre profil **Public** et profil **Privé**.

3. **Système de Relations Sociales (Follow / Unfollow) :**
   - Suivre ou ne plus suivre un utilisateur.
   - Si le profil cible est public : acceptation automatique de la demande (`ACCEPTED`).
   - Si le profil cible est privé : mise en attente de la demande (`PENDING`) jusqu'à approbation.
   - Consultation de la liste interactive des abonnés (*Followers*) et abonnements (*Following*) via une modale interactive.

4. **Moteur de Recherche d'Utilisateurs :**
   - Recherche en temps réel par prénom, nom de famille ou nom d'utilisateur (pseudo).
   - Menu déroulant affichant les résultats correspondants avec avatar, nom complet et lien direct vers le profil.

### 2.2 Besoins Non-Fonctionnels

- **Sécurité :** Hachage robuste des mots de passe (BCrypt), protection contre les failles XSS grâce aux cookies `HttpOnly`, protection contre les injections SQL (requêtes JPQL paramétrées).
- **Performance & Économie Réseau :** Implémentation d'une technique de *Debouncing* sur la saisie de recherche pour éviter de surcharger le serveur.
- **Ergonomie & UX :** Interface fluide, design responsive (mobile et desktop), mode sombre natif, retours visuels immédiats lors des actions.
- **Portabilité :** Déploiement "en un clic" grâce à Docker Compose.

---

## 3. Environnement Technique & Choix Technologiques

### 3.1 Stack Backend

| Technologie | Version | Rôle dans le projet |
|---|---|---|
| **Java** | 17+ | Langage robuste, typé et orienté objet pour l'écriture de la logique serveur. |
| **Spring Boot** | 3.x | Framework d'application d'entreprise facilitant la configuration et le déploiement REST. |
| **Spring Security** | 6.x | Gestion centralisée des autorisations, filtres HTTP, et encodage des mots de passe. |
| **Spring Session JDBC** | Intégré | Stockage des sessions HTTP en base de données pour une sécurité sans faille et une persistance robuste. |
| **Spring Data JPA / Hibernate**| Intégré | ORM assurant la traduction automatique entre les classes Java et la base de données relationnelle. |
| **Flyway** | Intégré | Gestion et versioning automatisé du schéma SQL (migrations `V1` à `V13`). |
| **Lombok** | Intégré | Réduction du code verbeux (génération des getters, setters, constructeurs via annotations). |

### 3.2 Stack Frontend

| Technologie | Version | Rôle dans le projet |
|---|---|---|
| **Next.js** | 15+ (App Router) | Framework React moderne offrant un routage optimisé, rendu hybride et performances accrues. |
| **React** | 19 | Bibliothèque d'interfaces utilisateur basée sur les composants et les hooks. |
| **TypeScript** | 5.x | Surcouche typée de JavaScript prévenant les bugs à la compilation. |
| **Tailwind CSS** | 3.x / 4.x | Framework CSS utilitaire permettant un stylage moderne, réactif et le support du Dark Mode. |

### 3.3 Infrastructure & DevOps

- **Docker & Dockerfile Multi-stage :** Encapsulation hermétique de chaque service avec toutes ses dépendances.
- **Docker Compose :** Orchestration conjointe du frontend et du backend avec liaison réseau et montage de volumes persistants (`db-data` et `uploads_data`).
- **SQLite :** Système de gestion de base de données relationnelle léger et fiable, parfaitement adapté à l'environnement conteneurisé.
- **Git & Git Flow :** Gestion des versions du code source, branches fonctionnelles (`master`, `oumayma`).

---

## 4. Architecture & Conception du Système

### 4.1 Architecture Globale Client-Serveur

L'architecture retenue est une architecture **découplée** à haute cohésion :

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Web                            │
│              (Next.js / React - Port 3000)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
             Appels REST HTTPS / Cookies HttpOnly
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Backend Spring Boot                   │
│                         (Port 8080)                         │
│                                                             │
│   ┌───────────────┐   ┌───────────────┐   ┌─────────────┐   │
│   │  Controllers  │──>│   Services    │──>│ Repositories│   │
│   └───────────────┘   └───────────────┘   └─────────────┘   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Base de Données SQLite                   │
│             + Volume de fichiers stockés /uploads           │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Architecture en Couches du Backend (Layered Pattern)

Pour garantir la maintenabilité et la séparation des responsabilités :
1. **Contrôleurs (`controller`) :** Expose les points de terminaison REST (`@RestController`). Reçoit les requêtes HTTP, valide les données d'entrée et transmet au service.
2. **Services (`service`) :** Implémente la logique métier (règles de suivi, validation de format de fichiers, vérification des mots de passe).
3. **Dépôts (`repository`) :** Interfaces étendant `JpaRepository` pour dialoguer avec la base SQLite via JPA ou requêtes JPQL.
4. **Entités (`entity`) :** Classes représentant les tables (`User`, `Follow`).
5. **DTOs (`dto`) :** Objets de transfert dédiés permettant de contrôler strictement les données entrantes et sortantes sans exposer les entités internes.

---

## 5. Détail des Réalisations & Modules Développés

Durant ce stage, j'ai conçu, développé et validé les 5 grands modules suivants :

### 5.1 Module 1 : Authentification & Sécurité Stateful

- **Mécanisme :** Contrairement aux architectures JWT classiques souvent vulnérables au vol de token dans le `localStorage`, j'ai mis en place une architecture basée sur **Spring Session JDBC** et des **cookies de session sécurisés** (`JSESSIONID`).
- **Fonctionnalités réalisées :**
  - Endpoint `POST /api/auth/register` : Création de compte avec hachage BCrypt.
  - Endpoint `POST /api/auth/login` : Authentification et émission du cookie `Set-Cookie: JSESSIONID; HttpOnly; SameSite=Lax`.
  - Endpoint `GET /api/auth/me` : Récupération automatique du profil de l'utilisateur connecté pour maintenir l'état au rafraîchissement.
  - Endpoint `POST /api/auth/logout` : Destruction de la session côté serveur et invalidation du cookie.
  - Frontend `AuthContext.tsx` : Fournisseur de contexte global React permettant à l'ensemble des pages d'accéder à l'état de l'utilisateur en cours (`user`, `loading`).

### 5.2 Module 2 : Gestion des Profils & Confidentialité

- **Backend :**
  - `ProfileController.java` & `ProfileService.java` : Récupération des informations publiques ou privées d'un utilisateur selon qu'il soit public ou que l'utilisateur demandeur fasse partie de ses abonnés validés.
  - Mise à jour des informations de profil (nom, bio, statut public/privé).
- **Frontend :**
  - Page dynamique `app/profile/[id]/page.tsx` : Affichage adaptatif selon l'état de la relation (bouton "Modifier" pour son propre profil, bouton "Suivre / En attente / Ne plus suivre" pour les profils tiers).

### 5.3 Module 3 : Système de Suivi (Follow / Unfollow & Followers Modal)

- **Backend :**
  - Entité `Follow.java` liant un `follower` et un `followed` avec un statut `FollowStatus` (`PENDING`, `ACCEPTED`).
  - `FollowRepository.java` contenant les requêtes pour compter les abonnés, vérifier si une relation existe et lister les abonnés/abonnements.
- **Frontend :**
  - `FollowButton.tsx` : Bouton interactif dont le libellé et l'action s'adaptent instantanément :
    - *Suivre* (devient immédiatement *Abonné* si le profil est public, ou *Demandé* s'il est privé).
    - *Abonné* (permet de se désabonner).
  - `FollowersListModal.tsx` : Modale affichant la liste complète des abonnés et abonnements, avec fermeture par touche `Échap` ou clic en dehors, et navigation directe vers leurs profils.

### 5.4 Module 4 : Téléversement de Photo dès l'Inscription (Upload & Preview)

- **Backend :**
  - Création de `FileStorageService.java` : Gestion sécurisée de l'écriture des fichiers images sur disque avec génération d'identifiants uniques UUID (`uuid_filename.png`), détection du type MIME et création automatique des dossiers `/uploads/avatars/`.
  - Configuration de `WebMvcConfig.java` pour exposer publiquement le dossier `/uploads/**`.
  - Adaptation d' `AuthController.java` et `AuthService.java` : Support du format `multipart/form-data` pour recevoir simultanément les champs texte d'inscription et le fichier binaire de l'avatar. Préservation de la rétrocompatibilité avec le format JSON existant.
- **Frontend :**
  - Page `app/register/page.tsx` :
    - Sélecteur de fichier lié à la galerie ou au système de fichiers local (`<input type="file" accept="image/*">`).
    - **Prévisualisation instantanée** via `URL.createObjectURL(file)` permettant à l'utilisateur de visualiser sa photo en rond avant même de valider.
    - Gestion du glisser-déposer (Drag & Drop) et bouton de suppression de la photo sélectionnée.
    - Soumission via l'objet standard `FormData`.

### 5.5 Module 5 : Recherche Dynamique d'Utilisateurs (Debounce & Autocomplete)

- **Backend :**
  - `UserRepository.java` : Implémentation d'une requête JPQL optimisée et insensible à la casse :
    ```java
    @Query("""
        SELECT u FROM User u
        WHERE LOWER(u.nickname) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
    """)
    List<User> searchUsers(@Param("query") String query);
    ```
  - `UserController.java` : Endpoint REST dédié `GET /api/users/search?query=...` retournant la liste des correspondances sous forme de `UserResponse` (sans exposer de données sensibles).
- **Frontend :**
  - Création du composant `UserSearchBar.tsx` intégré dans la page d'accueil.
  - **Debouncing de 300 ms :** Temporisation intelligente évitant d'exécuter une requête réseau à chaque frappe de touche.
  - **Menu déroulant avec affichage de l'avatar :** Affichage de la photo de profil (ou des initiales si aucune photo), du nom complet et du pseudo.
  - **Gestion de la fermeture au clic extérieur :** Utilisation de `useRef` et d'un écouteur d'événement `mousedown` avec nettoyage approprié.

---

## 6. Défis Techniques & Solutions Apportées

| Problème / Défi rencontré | Solution technique mise en place |
|---|---|
| **Blocage CORS avec cookies de session :** Le frontend (`:3000`) ne recevait pas le cookie émis par le backend (`:8080`). | Configuration explicite de `CorsConfig.java` avec `setAllowCredentials(true)` et `allowedOrigins("http://localhost:3000")`, combinée à l'option `credentials: "include"` sur tous les appels `fetch` du frontend. |
| **Multiplicité des requêtes réseau lors de la recherche :** Taper un nom générait une requête HTTP par lettre tapée. | Mise en place du patron **Debounce** (300ms) avec `setTimeout` et `clearTimeout` dans un hook `useEffect`. |
| **Upload d'avatar sans casser l'authentification existante :** Les tests et l'API existante envoyaient du JSON, alors que l'upload nécessitait du `multipart/form-data`. | Surcharge de la méthode `register` dans `AuthService` et ajout d'un endpoint `POST` acceptant `consumes = MediaType.MULTIPART_FORM_DATA_VALUE` tout en conservant l'endpoint `APPLICATION_JSON_VALUE`. |
| **Persistance des photos téléversées dans Docker :** Les fichiers disparaissaient à l'arrêt du conteneur. | Ajout d'un volume Docker dédié `uploads_data` monté sur `/app/uploads` dans `docker-compose.yml`. |
| **Fuite de mémoire avec les prévisualisations d'images :** La création d'URL blobs consommait de la mémoire non libérée. | Invocation systématique de `URL.revokeObjectURL()` lors du remplacement ou de la suppression d'un fichier. |

---

## 7. Validation, Tests & Résultats

1. **Compilation Frontend & Typage :**
   - Exécution réussie de `next build` avec **0 erreur TypeScript** et génération optimisée des routes statiques et dynamiques.
2. **Intégrité de la Base de Données :**
   - Application sans conflit des 13 migrations Flyway (`V1` à `V13`).
3. **Validation des Scénarios Utilisateurs :**
   - Inscription complète avec sélection d'une photo depuis l'explorateur de fichiers -> photo stockée et affichée sur `/profile/me`.
   - Recherche d'un utilisateur par nom ou pseudo -> affichage instantané des résultats et redirection fluide vers son profil.
   - Demande de suivi sur profil privé -> mise en attente du statut `PENDING` et masquage des informations sensibles.

---

## 8. Bilan Personnel & Compétences Acquises

Ce projet de stage a été une opportunité majeure d'approfondir mes compétences techniques et méthodologiques :

- **Compétences Backend :** Maîtrise avancée de l'écosystème Spring (Spring Boot, Spring Security, Spring Session, Spring Data JPA, Flyway, gestion d'erreurs et architecture REST).
- **Compétences Frontend :** Prise en main experte de Next.js (App Router, gestion des états réactifs, Context API, interfaces TypeScript rigoureuses, optimisation UX).
- **Compétences DevOps :** Orchestration multi-conteneurs avec Docker Compose, gestion des volumes persistants et des variables d'environnement.
- **Rigueur Méthodologique :** Respect des bonnes pratiques de Clean Code, documentation technique claire, modularité du code et sécurité défensive.

---

## 9. Conclusion & Perspectives

Le stage a pleinement atteint ses objectifs : doter la plateforme d'un système d'authentification robuste avec téléversement immédiat d'avatar, d'une gestion fine des profils et abonnements, et d'un moteur de recherche dynamique performant.

**Perspectives d'évolution futures :**
1. Intégration de la messagerie instantanée en temps réel via **WebSockets / STOMP**.
2. Module de création de publications (Posts) avec partage d'images et système de likes/commentaires.
3. Système de notifications en temps réel pour les demandes d'abonnement reçues.

