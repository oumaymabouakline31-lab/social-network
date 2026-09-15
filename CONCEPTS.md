# 📚 Guide des Concepts & Architecture du Projet "Social Network"

Ce document détaille l'ensemble des **concepts informatiques**, **patrons de conception (design patterns)**, **technologies**, **mécanismes de sécurité** et **choix architecturaux** mis en œuvre dans ce projet de réseau social.

---

## 📑 Table des Matières

1. [Architecture Globale du Système](#1-architecture-globale-du-système)
2. [Concepts Backend (Spring Boot & Java)](#2-concepts-backend-spring-boot--java)
   - [Architecture en Couches (Layered Architecture)](#architecture-en-couches-layered-architecture)
   - [Inversion de Contrôle (IoC) & Injection de Dépendances](#inversion-de-contrôle-ioc--injection-de-dépendances)
   - [ORM & Mapping Objet-Relationnel (JPA / Hibernate)](#orm--mapping-objet-relationnel-jpa--hibernate)
   - [Migrations de Schéma (Flyway)](#migrations-de-schéma-flyway)
   - [Requêtes JPQL & HQL](#requêtes-jpql--hql)
   - [Sécurité & Gestion de Session (Spring Security + Spring Session JDBC)](#sécurité--gestion-de-session-spring-security--spring-session-jdbc)
   - [Gestion & Stockage de Fichiers (Uploads / Multipart)](#gestion--stockage-de-fichiers-uploads--multipart)
   - [CORS (Cross-Origin Resource Sharing)](#cors-cross-origin-resource-sharing)
3. [Concepts Frontend (Next.js, React & TypeScript)](#3-concepts-frontend-nextjs-react--typescript)
   - [App Router & Rendu Hybride (Client vs Server Components)](#app-router--rendu-hybride-client-vs-server-components)
   - [Typage Statique (TypeScript)](#typage-statique-typescript)
   - [Gestion d'État Global (React Context API)](#gestion-détat-global-react-context-api)
   - [Routage Dynamique (Dynamic Routing)](#routage-dynamique-dynamic-routing)
   - [Hooks React Fondamentaux](#hooks-react-fondamentaux)
   - [Debouncing (Optimisation des Requêtes)](#debouncing-optimisation-des-requêtes)
   - [Upload de Fichiers & Prévisualisation Instantanée (Blob / Object URL)](#upload-de-fichiers--prévisualisation-instantanée-blob--object-url)
   - [Gestion des Événements DOM & Références (useRef & Click Outside)](#gestion-des-événements-dom--références-useref--click-outside)
   - [Design Responsive & Dark Mode (Tailwind CSS)](#design-responsive--dark-mode-tailwind-css)
4. [Concepts Base de Données & Modélisation Métier](#4-concepts-base-de-données--modélisation-métier)
   - [Modèle Relationnel & Clés Étrangères](#modèle-relationnel--clés-étrangères)
   - [Système de Followers (Public vs Privé, En attente vs Accepté)](#système-de-followers-public-vs-privé-en-attente-vs-accepté)
   - [Indexation & Performances](#indexation--performances)
5. [Concepts DevOps & Déploiement (Docker)](#5-concepts-devops--déploiement-docker)
   - [Conteneurisation Multi-Services (Docker Compose)](#conteneurisation-multi-services-docker-compose)
   - [Volumes Persistants (Data Persistence)](#volumes-persistants-data-persistence)
6. [Récapitulatif des Bonnes Pratiques Appliquées](#6-récapitulatif-des-bonnes-pratiques-appliquées)

---

## 1. Architecture Globale du Système

L'application repose sur une **architecture Client-Serveur découplée** (Decoupled Frontend / Backend Architecture) :

```
┌─────────────────────────────────────────────────────────────┐
│                    Navigateur Client                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
               HTTP / JSON / Cookies de Session
                               │
        ┌──────────────────────┴──────────────────────┐
        │                                             │
        ▼                                             ▼
┌───────────────────────────┐             ┌───────────────────────────┐
│     Frontend Next.js      │             │    Backend Spring Boot    │
│       (Port 3000)         │             │        (Port 8080)        │
│                           │             │                           │
│ • Rendu UI React          │             │ • Contrôleurs REST        │
│ • Contexte Auth           │             │ • Logique métier Services │
│ • App Router & Pages      │             │ • Sécurité & Sessions     │
└───────────────────────────┘             └─────────────┬─────────────┘
                                                        │
                                                        ▼
                                          ┌───────────────────────────┐
                                          │      Base de Données      │
                                          │      SQLite + Flyway      │
                                          │   (Volume persistant)     │
                                          └───────────────────────────┘
```

- **Frontend (Port 3000) :** Interface utilisateur moderne construite avec **Next.js**, gérant l'affichage, les interactions utilisateurs, les formulaires et l'état de navigation.
- **Backend (Port 8080) :** API REST sécurisée construite avec **Spring Boot**, gérant la logique métier, l'authentification, la persistance des données et la manipulation des fichiers.
- **Base de Données :** **SQLite** versionnée via **Flyway**, stockée sur un volume Docker persistant pour préserver les données entre redémarrages.

---

## 2. Concepts Backend (Spring Boot & Java)

### Architecture en Couches (Layered Architecture)

Le backend sépare rigoureusement les responsabilités selon le patron MVC / N-Tiers :

1. **Controller Layer (`com.example.socialnetwork.controller`)**
   - Rôle : Point d'entrée HTTP de l'API. Réceptionne les requêtes (`@GetMapping`, `@PostMapping`), valide les entrées (`@Valid`, `@RequestParam`), et retourne des réponses formatées (`ResponseEntity<T>`).
   - *Exemples :* `AuthController`, `ProfileController`, `UserController`.

2. **Service Layer (`com.example.socialnetwork.service`)**
   - Rôle : Cœur de la logique métier (Business Logic). Orchestre les opérations, effectue les calculs, vérifie les règles métier et coordonne les repositories.
   - *Exemples :* `AuthService`, `ProfileService`, `FileStorageService`.

3. **Repository Layer (`com.example.socialnetwork.repository`)**
   - Rôle : Accès aux données (Data Access Layer). Hérite de `JpaRepository<T, ID>` de Spring Data, permettant d'exécuter des requêtes CRUD automatiques ou personnalisées.
   - *Exemples :* `UserRepository`, `FollowRepository`.

4. **Entity Layer (`com.example.socialnetwork.entity`)**
   - Rôle : Représente les tables en base de données sous forme d'objets Java annotés (`@Entity`, `@Table`, `@Id`, `@Column`).
   - *Exemples :* `User`, `Follow`.

5. **DTO Layer (`com.example.socialnetwork.dto`)**
   - Rôle : *Data Transfer Object*. Objets dédiés au transport des données entre le client et l'API, évitant d'exposer directement le modèle de base de données (ex: masquage du mot de passe hashé).
   - *Exemples :* `RegisterRequest`, `LoginRequest`, `UserResponse`, `ProfileResponse`.

---

### Inversion de Contrôle (IoC) & Injection de Dépendances

- **Principe :** Le framework Spring instancie et gère lui-même le cycle de vie des objets (appelés *Spring Beans*).
- **Mise en œuvre :** Utilisation de l'injection par constructeur via Lombok (`@RequiredArgsConstructor`) :
  ```java
  @RestController
  @RequiredArgsConstructor
  public class UserController {
      private final UserRepository userRepository; // Injecté automatiquement par Spring
  }
  ```
- **Avantage :** Couplage faible, testabilité accrue, modularité.

---

### ORM & Mapping Objet-Relationnel (JPA / Hibernate)

- **ORM (Object-Relational Mapping) :** Pont automatique entre les tables SQL relationnelles et les classes Java.
- **Annotations clés :**
  - `@Entity` : Marque la classe comme entité persistante.
  - `@Table(name = "users")` : Lie la classe à la table correspondante.
  - `@Id` & `@GeneratedValue` : Identifiant unique auto-généré.
  - `@Enumerated(EnumType.STRING)` : Stocke les statuts (`PENDING`, `ACCEPTED`) sous forme de texte plutôt que d'entier.
  - `@CreationTimestamp` / `@UpdateTimestamp` : Gestion automatique des dates de création et de mise à jour.

---

### Migrations de Schéma (Flyway)

- **Concept :** Outil de versioning de base de données (semblable à Git pour le code).
- **Fonctionnement :**
  - Scripts SQL versionnés dans `src/main/resources/db/migration/sqlite/` nommés `V1__create_users.sql`, `V2__...`.
  - À chaque démarrage, Flyway inspecte la table d'historique `flyway_schema_history` et applique uniquement les nouvelles migrations dans l'ordre strict.
- **Avantage :** Zéro migration manuelle, cohérence garantie sur tous les environnements (développement, test, production).

---

### Requêtes JPQL & HQL

- **Concept & Différence fondamentale avec le SQL ordinaire :**
  - **SQL classique :** Cible des tables et des colonnes physiques de la base de données (`SELECT * FROM users WHERE first_name = 'Mohamed'`).
  - **JPQL :** Cible directement les **Classes Java (`@Entity`)** et leurs attributs d'objets (`SELECT u FROM User u WHERE u.firstName = 'Mohamed'`).
  - **Avantages majeurs :**
    1. *Indépendance du SGBD :* Écriture unique du JPQL. Hibernate traduit automatiquement le JPQL dans le dialecte SQL spécifique du moteur utilisé (SQLite, PostgreSQL, MySQL, Oracle).
    2. *Sécurité du typage :* Si un attribut est renommé dans la classe Java `User`, les erreurs sont détectables dès la compilation ou l'analyse statique par l'IDE.
#### 1. Définition & Comparaison : SQL vs JPQL

- **Exemple appliqué dans la recherche d'utilisateurs ([`UserRepository.java`](file:///c:/Users/zeze/OneDrive/Desktop/social-network/backend/src/main/java/com/example/socialnetwork/repository/UserRepository.java)) :**
| Critère | SQL Classique | JPQL (Java Persistence Query Language) |
| :--- | :--- | :--- |
| **Cible interrogée** | Tables et colonnes physiques de la base | Classes Java (`@Entity`) et attributs d'objets |
| **Exemple** | `SELECT * FROM users WHERE first_name = 'Mohamed'` | `SELECT u FROM User u WHERE u.firstName = 'Mohamed'` |
| **Portabilité SGBD** | Dépendante du moteur (syntaxe propre à SQLite, MySQL, etc.) | **100 % portable** : Hibernate traduit le JPQL vers le bon dialecte SQL |
| **Sécurité du typage** | Faible (chaîne brute, erreurs découvertes à l'exécution) | Forte (refactorings et renommages vérifiables par l'IDE et le compilateur) |
| **Résultat renvoyé** | Lignes de données brutes (`ResultSet`) | Objets Java typés et hydratés (`List<User>`) |

---

#### 2. Dissection Chirurgicale de la Requête de Recherche ([`UserRepository.java`](file:///c:/Users/zeze/OneDrive/Desktop/social-network/backend/src/main/java/com/example/socialnetwork/repository/UserRepository.java))

```java
@Query("""
    SELECT u FROM User u
    WHERE LOWER(u.nickname) LIKE LOWER(CONCAT('%', :query, '%'))
       OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
       OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
""")
List<User> searchUsers(@Param("query") String query);
```

Chaque élément répond à un objectif technique précis :

1. **`SELECT u FROM User u` (Sélection d'entité) :**
   - On nomme `u` l'alias de l'entité `User`.
   - Contrairement au `SELECT *` de SQL, `SELECT u` indique à JPA d'instancier directement des objets `User` avec toutes leurs propriétés mappées.

2. **`LOWER(...)` (Insensibilité à la casse) :**
   - Harmonise les deux membres de la comparaison en minuscules : la valeur en base (`LOWER(u.firstName)`) et la saisie utilisateur (`LOWER(:query)`).
   - Résultat : la recherche est insensible à la casse (`"Karim"`, `"karim"` ou `"KARIM"` trouvent le même profil).

3. **`CONCAT('%', :query, '%')` et `LIKE` (Pattern Matching / Sous-chaîne) :**
   - Le caractère `%` est un joker (*wildcard*) signifiant "zéro, un ou plusieurs caractères".
   - Pour un terme recherché `"med"`, `CONCAT` produit `"%med%"`. L'opérateur `LIKE` capture toute correspondance :
     - En début : **Med**hi
     - Au milieu : Moha**med**
     - En fin : Ah**med**

4. **Opérateurs `OR` (Recherche multi-champs) :**
   - Combine en une seule requête la recherche sur le pseudo (`nickname`), le prénom (`firstName`) et le nom (`lastName`).
   - L'utilisateur n'a pas besoin de choisir un filtre : un unique champ de recherche scrute l'ensemble de son identité.

---

#### 3. Sécurité : Immunité Totale contre l'Injection SQL

- **Le piège de la concaténation brute :**
  ```java
  @Query("""
      SELECT u FROM User u
      WHERE LOWER(u.nickname) LIKE LOWER(CONCAT('%', :query, '%'))
         OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
         OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
  """)
  List<User> searchUsers(@Param("query") String query);
  // ❌ VULNÉRABILITÉ CRITIQUE : Concaténation de chaîne
  String sql = "SELECT * FROM users WHERE first_name = '" + query + "'";
  ```
  Si un attaquant saisit `' OR '1'='1`, la clause devient `WHERE first_name = '' OR '1'='1'`, exposant la totalité des données utilisateurs.

- **Dissection technique mot par mot de la requête :**
  - `SELECT u FROM User u` : Sélectionne l'objet complet `u` de type `User`. Spring Data JPA et Hibernate instancient et retournent directement une `List<User>` d'objets Java prêts à l'emploi.
  - `LOWER(...)` *(Insensibilité à la casse / Case-Insensitive)* :
    - Convertit la valeur en base (`LOWER(u.firstName)`) et le terme saisi (`LOWER(:query)`) en minuscules.
    - Garantit qu'une recherche pour `"mohamed"`, `"MOHAMED"` ou `"MoHaMeD"` retournera les résultats attendus.
  - `CONCAT('%', :query, '%')` et `LIKE` *(Recherche partielle / sous-chaîne)* :
    - En SQL, `%` est le caractère joker (*wildcard*).
    - Pour la recherche `"med"`, `CONCAT` produit `"%med%"`. L'opérateur `LIKE` trouve toute occurrence contenant `"med"` : au début (*Medhi*), au milieu (*Mohamed*) ou à la fin (*Ahmed*).
  - Conditions `OR` *(Recherche multi-critères)* :
    - Inspecte simultanément le pseudonyme (`nickname`), le prénom (`firstName`) et le nom (`lastName`) sans obliger l'utilisateur à spécifier un champ particulier.
- **La protection par paramètre nommé (`:query` + `@Param`) :**
  - Le symbole `:query` définit un **paramètre de substitution**.
  - Spring Data JPA transmet ce paramètre au moteur sous forme de **`PreparedStatement`**.
  - La valeur utilisateur est injectée en tant que **littéral de données pur**, séparé de l'arbre syntaxique SQL. Même la présence de guillemets, d'apostrophes ou de mots-clés SQL (`DROP`, `UNION`) est traitée comme du texte inoffensif.

- **Sécurité absolue contre les Injections SQL (`:query` & `@Param`) :**
  - **Vulnérabilité classique par concaténation :** `String sql = "SELECT * FROM users WHERE firstName = '" + query + "'";`. Une entrée telle que `' OR '1'='1` exposerait l'intégralité de la table.
  - **Protection native avec JPQL :** Le paramètre nommé `:query` associé à `@Param("query")` est traité en interne via un **`PreparedStatement`**. Les entrées utilisateur sont transmises sous forme de données brutes isolées de la commande SQL, neutralisant tout caractère spécial (`'`, `;`, `DROP TABLE`).
---

- **Traduction sous le capot (JPQL vers SQLite) :**
  ```sql
  SELECT 
      u.id, u.email, u.first_name, u.last_name, u.nickname, u.avatar_url, u.is_public
  FROM users u 
#### 4. Cycle de Traduction Interne (Sous le capot)

```
Requête JPQL (@Query)
       │
       ▼
Hibernate ORM (Analyse syntaxique HQL/JPQL)
       │
       ▼ (Application du dialecte SQLite)
Requête SQL compilée avec PreparedStatement :
  SELECT u.id, u.email, u.first_name, u.last_name, u.nickname, u.avatar_url, u.is_public
  FROM users u
  WHERE lower(u.nickname) LIKE ('%' || ? || '%')
     OR lower(u.first_name) LIKE ('%' || ? || '%')
     OR lower(u.last_name) LIKE ('%' || ? || '%');
  ```
  *(Hibernate adapte automatiquement la concaténation de chaînes avec l'opérateur `||` propre à SQLite).*
       │
       ▼ (Exécution sur SQLite avec paramètre sécurisé ?)
Mapping automatique du ResultSet vers List<User>
```

- **Pitch d'audit (3 points clés à retenir) :**
  1. *Abstraction & Portabilité :* Utilisation de JPQL pour manipuler des objets Java persistants plutôt que des tables physiques, garantissant la neutralité vis-à-vis du SGBD.
  2. *Ergonomie & Efficacité :* Recherche souple multi-colonnes (`OR`), insensible à la casse (`LOWER`) et partielle (`CONCAT` + `LIKE`).
  3. *Sécurité par conception :* Paramètres nommés compilés en `PreparedStatement`, assurant une imperméabilité totale aux injections SQL.
> **Note :** Hibernate convertit automatiquement la fonction standard JPQL `CONCAT()` en opérateur de concaténation natif de SQLite (`||`).

---

#### 5. Synthèse pour l'Audit (Script Oral en 3 points)

1. **Architecture & Abstraction :** *"Nous interrogeons nos entités métier via JPQL plutôt que des tables physiques SQL, garantissant un découplage total avec le moteur de base de données."*
2. **Expérience Utilisateur :** *"La recherche est universelle et flexible grâce à l'insensibilité à la casse (`LOWER`) et la détection de sous-chaînes (`CONCAT` + `LIKE`) sur 3 critères simultanés (`nickname`, `firstName`, `lastName`)."*
3. **Sécurité Défensive :** *"La requête utilise des paramètres nommés compilés en `PreparedStatement`, bloquant à 100 % tout risque d'injection SQL sans aucun traitement manuel nécessaire."*

---

### Sécurité & Gestion de Session (Spring Security + Spring Session JDBC)

L'application utilise une sécurité **Stateful par Session Cookie** (plutôt qu'un JWT stocké dans le `localStorage`) :

1. **Spring Session JDBC :**
   - Les sessions actives sont stockées dans la base de données (`SPRING_SESSION`).
   - Si le backend redémarre, les utilisateurs **ne sont pas déconnectés**.
2. **Cookie de Session `JSESSIONID` :**
   - Transmis dans les en-têtes HTTP de manière transparente (`Set-Cookie`).
   - Attributs de sécurité : `HttpOnly` (inaccessible au JavaScript, protège contre les failles XSS) et `SameSite=Lax`.
3. **Hachage des mots de passe (BCrypt) :**
   - `PasswordEncoder` avec algorithme **BCrypt** incluant un sel aléatoire (Salt).
   - Aucun mot de passe n'est jamais stocké en clair.
4. **Chaîne de filtres (`SecurityFilterChain`) :**
   - Routes publiques (`/api/auth/register`, `/api/auth/login`, `/uploads/**`).
   - Routes protégées nécessitant une session active (`/api/users/**`, `/api/profile/**`).

---

### Gestion & Stockage de Fichiers (Uploads / Multipart)

- **Multipart Request (`multipart/form-data`) :**
  - Permet d'envoyer simultanément des métadonnées (texte, JSON) et des flux binaires (images).
  - Prise en charge côté Spring par `MultipartFile`.
- **Service dédié (`FileStorageService`) :**
  - Nettoyage et sécurisation du nom de fichier (génération d'un UUID unique : `3fa85f64-..._avatar.png`).
  - Validation des types MIME autorisés (`image/jpeg`, `image/png`, `image/webp`, `image/gif`).
  - Écriture sur disque dans le répertoire `/uploads/avatars/`.
- **Distribution statique (`WebMvcConfig`) :**
  - Configuration d'un `ResourceHandler` pour servir publiquement les images sous l'URL `/uploads/**`.

---

### CORS (Cross-Origin Resource Sharing)

- **Problématique :** Le frontend (`http://localhost:3000`) et le backend (`http://localhost:8080`) sont sur des origines différentes (ports différents). Le navigateur bloque par défaut les requêtes cross-origin.
- **Solution (`CorsConfig`) :**
  - Autorise explicitement l'origine `http://localhost:3000`.
  - Active `allowCredentials(true)` indispensable pour que les cookies de session transitent entre les deux origines.
  - Spécifie les méthodes HTTP autorisées (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`).

---

## 3. Concepts Frontend (Next.js, React & TypeScript)

### App Router & Rendu Hybride (Client vs Server Components)

- **Next.js App Router (`app/`) :** Système de routage basé sur les dossiers et fichiers de Next.js.
- **Directive `"use client"` :**
  - Indique que le composant s'exécute côté navigateur (Client Component).
  - Requis dès qu'un composant utilise l'interactivité, des événements (`onClick`, `onChange`), des états (`useState`) ou des cycles de vie (`useEffect`).

---

### Typage Statique (TypeScript)

- **Bénéfices :** Détection des erreurs à la compilation, autocomplétion intelligente, documentation vivante du code.
- **Exemples d'interfaces :**
  ```typescript
  export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    nickname?: string;
    avatarUrl?: string;
    aboutMe?: string;
    isPublic: boolean;
  }
  ```

---

### Gestion d'État Global (React Context API)

- **`AuthContext` :**
  - Centralise l'état d'authentification (`user`, `loading`) accessible partout dans l'arborescence des composants sans prop drilling.
  - Fournit les actions globales : `login()`, `register()`, `logout()`, `refreshUser()`.
  - Initialise la session dès le premier chargement en appelant `/api/auth/me`.

---

### Routage Dynamique (Dynamic Routing)

- **Structure de dossier `app/profile/[id]/page.tsx` :**
  - Le segment `[id]` capture dynamiquement le paramètre d'URL (`/profile/1`, `/profile/42`, `/profile/me`).
  - Récupéré via `use(params)` ou les props de page.

---

### Hooks React Fondamentaux

| Hook | Rôle dans l'application |
|---|---|
| `useState` | Gère l'état local réactif (ex: texte recherché, formulaire, liste des résultats, chargement). |
| `useEffect` | Gère les effets de bord asynchrones (requêtes API, abonnements aux écouteurs d'événements DOM, timers). |
| `useRef` | Maintient une référence directe vers un nœud DOM (ex: conteneur de la barre de recherche, input file caché). |
| `useCallback` | Mémorise les fonctions pour éviter les recréations inutiles lors des re-rendus. |
| `useContext` | Consomme un contexte React (`useAuth()`). |

---

### Debouncing (Optimisation des Requêtes)

- **Problème :** Sans debounce, chaque touche tapée dans la barre de recherche déclenche immédiatement une requête HTTP vers le serveur (ex: taper "Mohamed" ferait 7 requêtes consécutives).
- **Solution mise en place (`UserSearchBar.tsx`) :**
  - On temporise l'envoi de la requête de **300ms**.
  - Si l'utilisateur tape une nouvelle lettre avant 300ms, le timer précédent est annulé (`clearTimeout`).
  - La requête n'est envoyée que lorsque l'utilisateur s'arrête brièvement de taper.
- **Résultat :** Réduction drastique de la charge serveur et fluidité maximale.

---

### Upload de Fichiers & Prévisualisation Instantanée (Blob / Object URL)

- **Sélection locale (`<input type="file" accept="image/*">`) :** Permet à l'utilisateur de choisir une image sur son disque ou depuis sa galerie mobile.
- **Prévisualisation instantanée (`URL.createObjectURL(file)`) :**
  - Génère une URL mémoire temporaire (`blob:http://localhost:3000/...`) pointant vers le fichier local.
  - L'utilisateur voit instantanément sa photo avant même d'avoir cliqué sur "S'inscrire".
  - Nettoyage mémoire via `URL.revokeObjectURL(previewUrl)` pour éviter les fuites de mémoire.
- **Envoi `FormData` :**
  - Encodage sous forme de formulaire binaire (`multipart/form-data`) avec `formData.append("avatar", file)`.

---

### Gestion des Événements DOM & Références (useRef & Click Outside)

- **Fermeture automatique au clic extérieur :**
  - Un écouteur global `document.addEventListener("mousedown", handleClickOutside)` surveille les clics.
  - Grâce à `containerRef.current.contains(e.target)`, le composant sait si le clic a eu lieu à l'intérieur ou à l'extérieur du menu déroulant.
  - Nettoyage rigoureux dans la fonction de retour de `useEffect` pour éviter les fuites d'écouteurs.

---

### Design Responsive & Dark Mode (Tailwind CSS)

- **Approche *Utility-First* :** Classes CSS utilitaires directes (`flex`, `p-4`, `rounded-full`, `hover:bg-zinc-100`).
- **Support natif du Dark Mode :** Classes préfixées `dark:bg-zinc-900`, `dark:text-zinc-100` réagissant automatiquement au thème du système.
- **Responsive design :** Adaptation mobile et bureau (`sm:flex-row`, `max-w-md mx-auto`).

---

## 4. Concepts Base de Données & Modélisation Métier

### Modèle Relationnel & Clés Étrangères

- **Table `users` :** Profil, identifiants, hash du mot de passe, biographie, statut public/privé, URL de l'avatar.
- **Table `follows` :** Modélise la relation plusieurs-à-plusieurs (Many-to-Many) entre utilisateurs :
  - `follower_id` : L'utilisateur qui suit.
  - `followed_id` : L'utilisateur qui est suivi.
  - `status` : Statut du lien (`PENDING` ou `ACCEPTED`).
  - Contrainte unique `(follower_id, followed_id)` empêchant les doublons.

---

### Système de Followers (Public vs Privé, En attente vs Accepté)

L'application implémente la logique de confidentialité des réseaux sociaux modernes (ex: Instagram / Twitter) :

1. **Si le profil cible est PUBLIC :**
   - Demande automatiquement validée avec statut `ACCEPTED`.
   - L'utilisateur accède immédiatement aux abonnements et publications.
2. **Si le profil cible est PRIVÉ :**
   - Demande créée avec statut `PENDING`.
   - Nécessite l'approbation du titulaire du compte.
   - Les informations privées restent masquées tant que la demande n'est pas acceptée.

---

### Indexation & Performances

- Création d'index SQL dédiés (`V13__create_indexes.sql`) sur les colonnes fréquemment filtrées et jointes :
  - `idx_users_email`
  - `idx_users_nickname`
  - `idx_follows_follower` & `idx_follows_followed`
- Permet des recherches en temps quasi-instantané (\(O(\log N)\) au lieu de \(O(N)\)).

---

## 5. Concepts DevOps & Déploiement (Docker)

### Conteneurisation Multi-Services (Docker Compose)

- **Isolation totale :** Aucune dépendance système (pas besoin d'installer Java, Maven, Node.js ou SQLite sur l'ordinateur hôte).
- **Orchestration avec `docker-compose.yml` :**
  - Service `backend` : Construit l'application Spring Boot et expose le port `8080`.
  - Service `frontend` : Construit l'application Next.js et expose le port `3000`.
  - Réseau interne Docker permettant aux conteneurs de communiquer entre eux de manière sécurisée.

---

### Volumes Persistants (Data Persistence)

- **Problématique :** Par défaut, les conteneurs Docker sont stateless (les données sont perdues à l'arrêt du conteneur).
- **Solution :** Utilisation de volumes nommés Docker :
  - `db-data` : Persistance du fichier de base de données SQLite.
  - `uploads_data` : Persistance des photos de profil et médias téléversés.

---

## 6. Récapitulatif des Bonnes Pratiques Appliquées

1. **Sécurité Défensive :**
   - Protection contre les injections SQL (requêtes JPQL paramétrées).
   - Protection XSS (Cookies HttpOnly pour les sessions, échappement React).
   - Protection contre les mots de passe compromis (hachage BCrypt avec sel).
2. **Expérience Utilisateur (UX) Réactive :**
   - Debounce sur les recherches pour économiser la bande passante et le processeur.
   - Prévisualisation instantanée côté client des images avant upload.
   - Retours visuels clairs (spinners de chargement, gestion d'erreurs, modales fluides).
3. **Architecture Propre & Maintenable (Clean Architecture) :**
   - Séparation stricte des couches (Controller, Service, Repository, DTO).
   - Rétrocompatibilité préservée (endpoints supportant à la fois JSON et FormData).
   - Typage fort de bout en bout (Java et TypeScript).

