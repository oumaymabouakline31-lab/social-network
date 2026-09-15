# 🎯 GUIDE DE PRÉPARATION À L'AUDIT TECHNIQUE (SOUTENANCE)

Ce guide est votre **fiche de révision et mémo stratégique** pour réussir votre audit ou passage devant les évaluateurs / examinateurs.

---

## 🧭 Sommaire

1. [Le Déroulement Type d'un Audit](#1-le-déroulement-type-dun-audit)
2. [Scénario Idéal de Démonstration (Live Demo en 5 minutes)](#2-scénario-idéal-de-démonstration-live-demo-en-5-minutes)
3. [Les 7 Questions Pièges Incontournables & Les Réponses Parfaites](#3-les-7-questions-pièges-incontournables--les-réponses-parfaites)
4. [La Carte Routière du Code (Quel fichier ouvrir selon la question)](#4-la-carte-routière-du-code-quel-fichier-ouvrir-selon-la-question)
5. [Vocabulaire Technique & Mots-Clés qui Font la Différence](#5-vocabulaire-technique--mots-clés-qui-font-la-différence)
6. [Attitude et Conseils le Jour J](#6-attitude-et-conseils-le-jour-j)

---

## 1. Le Déroulement Type d'un Audit

Un audit technique se découpe généralement en **3 phases** :

1. **La Démonstration Live (30%) :**
   Vous montrez que l'application tourne en direct, sans bug, et vous parcourez les fonctionnalités demandées.
2. **L'Explication Architecturale (30%) :**
   L'auditeur vous demande d'expliquer comment le Frontend et le Backend communiquent, comment les données sont stockées et sécurisées.
3. **La Revue de Code & Questions Techniques (40%) :**
   L'auditeur vous demande : *"Ouvre ton code, montre-moi la fonction qui fait ça et explique-moi pourquoi tu as écrit cette ligne."*

---

## 2. Scénario Idéal de Démonstration (Live Demo en 5 minutes)

Avant que l'auditeur ne commence à poser des questions, préparez votre environnement :
```bash
docker compose up
```
Ouvrez votre navigateur sur `http://localhost:3000` et gardez un deuxième onglet sur l'API ou l'inspecteur réseau (F12).

### Déroulé étape par étape :

- **Étape 1 : Page d'Accueil & Redirection**
  - Montrez la page d'accueil sans être connecté.
  - Cliquez sur **"Create Account"** (`/register`).

- **Étape 2 : Inscription avec Téléversement de Photo (Feature Clé)**
  - Cliquez sur le rond de photo / icône de galerie.
  - Choisissez une image sur votre ordinateur : **Montrez la prévisualisation instantanée en rond !**
  - Remplissez les champs : Nom, Prénom, Pseudo (`@monpseudo`), Date de naissance, Email, Mot de passe.
  - Validez le formulaire : redirection automatique vers la page d'accueil avec message de session active.
  - Allez sur **"Voir mon profil"** (`/profile/me`) : montrez que la photo est bien affichée et stockée.

- **Étape 3 : Recherche Dynamique d'Utilisateurs (Feature Clé)**
  - Revenez sur l'accueil.
  - Dans la barre de recherche **🔍 Rechercher un utilisateur...**, tapez les 2 premières lettres d'un autre compte.
  - Montrez l'autocomplétion qui s'ouvre avec la photo de profil, le nom complet et le pseudo.
  - Cliquez sur un utilisateur : redirection immédiate sur `/profile/[id]`.

- **Étape 4 : Système de Follow & Modale**
  - Montrez le bouton **"Suivre"**.
  - Cliquez dessus : si l'utilisateur est public, le statut passe immédiatement à **"Abonné"** (ou **"Demandé"** s'il est privé).
  - Cliquez sur le compteur d'abonnés : montrez la modale interactive listant les abonnés avec leurs photos.

---

## 3. Les 7 Questions Pièges Incontournables & Les Réponses Parfaites

### ❓ Question 1 : *"Pourquoi avez-vous utilisé des Cookies de Session et pas des tokens JWT ?"*
> **Votre réponse :**  
> *"Dans une application de réseau social, nous avons privilégié la sécurité maximale contre les failles XSS. Un token JWT stocké dans le `localStorage` est vulnérable si un script JavaScript malveillant s'exécute dans la page. À l'inverse, nous utilisons des cookies `HttpOnly` gérés par Spring Session JDBC : le cookie est inaccessible en JavaScript, envoyé automatiquement par le navigateur, et stocké de façon persistante en base de données. Même si le serveur redémarre, la session utilisateur n'est pas perdue."*

---

### ❓ Question 2 : *"Comment fonctionne l'upload d'avatar et où sont stockées les photos ?"*
> **Votre réponse :**  
> *"L'upload utilise le format `multipart/form-data`.  
> 1. Côté Frontend, le fichier est sélectionné via un `<input type="file">`, prévisualisé immédiatement avec `URL.createObjectURL(file)`, puis empaqueté dans un objet standard `FormData`.  
> 2. Côté Backend, `AuthController` reçoit le `MultipartFile`.  
> 3. Le `FileStorageService` valide le type MIME (JPEG, PNG, WebP), génère un nom unique avec un identifiant UUID pour éviter les collisions et les failles de traversal path, et écrit le fichier sur le disque dans `/uploads/avatars/`.  
> 4. Enfin, `WebMvcConfig` expose ce répertoire comme ressource statique, et l'URL relative est enregistrée dans l'entité `User` en base de données."*

---

### ❓ Question 3 : *"Qu'est-ce que le Debounce dans votre barre de recherche et pourquoi l'avoir mis ?"*
> **Votre réponse :**  
> *"Le Debounce est une technique d'optimisation frontend. Sans Debounce, si un utilisateur tape 'Mohamed', le frontend enverrait 7 requêtes HTTP consécutives (une par lettre), ce qui gaspille de la bande passante et surcharge la base de données.  
> Avec notre Debounce de 300 ms, nous utilisons un timer `setTimeout`. Si l'utilisateur tape une nouvelle lettre avant l'expiration des 300 ms, nous annulons le timer précédent avec `clearTimeout`. La requête réseau n'est déclenchée que lorsque l'utilisateur s'arrête brièvement de taper."*

---

### ❓ Question 4 : *"Comment avez-vous protégé votre recherche contre les injections SQL ?"*
> **Votre réponse :**  
> *"Nous n'utilisons aucune concaténation directe de chaîne SQL. Nous utilisons Spring Data JPA avec une requête JPQL paramétrée :  
> `@Query("SELECT u FROM User u WHERE LOWER(u.nickname) LIKE LOWER(CONCAT('%', :query, '%')) ...")`  
> Le paramètre `:query` est lié via `@Param("query")` sous forme de PreparedStatement sécurisé par Hibernate. L'injection SQL est donc techniquement impossible. De plus, `LOWER(...)` assure une recherche insensible à la casse."*

---

### ❓ Question 5 : *"Comment gérez-vous la confidentialité des profils (public vs privé) ?"*
> **Votre réponse :**  
> *"Chaque utilisateur possède un booléen `isPublic`.  
> Lors d'une demande de suivi (`FollowService`) :  
> - Si le profil est public, la relation est immédiatement créée avec le statut `ACCEPTED`.  
> - Si le profil est privé, elle est créée avec le statut `PENDING`.  
> Dans `ProfileController`, si le profil cible est privé et que l'utilisateur connecté n'a pas le statut `ACCEPTED`, l'API masque les informations sensibles (publications, abonnés détaillés)."*

---

### ❓ Question 6 : *"Pourquoi avoir utilisé Flyway pour la base de données ?"*
> **Votre réponse :**  
> *"Flyway assure le versioning et la traçabilité de notre schéma de base de données, à la manière de Git pour le code. Nous avons 13 scripts SQL ordonnés (`V1` à `V13`). À chaque démarrage de l'application, Flyway vérifie la table d'historique et applique automatiquement les nouvelles migrations. Cela évite les incohérences entre les environnements de développement et de production, et nous évite d'utiliser `ddl-auto: update` d'Hibernate qui n'est pas recommandé en production."*

---

### ❓ Question 7 : *"Comment communique le frontend sur le port 3000 avec le backend sur le port 8080 ?"*
> **Votre réponse :**  
> *"Il s'agit d'une communication Cross-Origin. Pour permettre le transit des cookies de session, deux conditions strictes ont été respectées :  
> 1. Côté Backend : `CorsConfig` autorise explicitement l'origine `http://localhost:3000` et active `setAllowCredentials(true)`.  
> 2. Côté Frontend : Tous les appels `fetch` incluent obligatoirement `credentials: "include"`, sinon le navigateur refuserait d'envoyer et de stocker les cookies."*

---

## 4. La Carte Routière du Code (Quel fichier ouvrir)

Gardez ces fichiers en tête si l'auditeur vous demande d'ouvrir votre éditeur de code :

| Sujet demandé par l'auditeur | Fichiers à ouvrir (Frontend & Backend) |
|---|---|
| **Inscription + Photo** | Frontend : `app/register/page.tsx` + `context/AuthContext.tsx`<br>Backend : `controller/AuthController.java` + `service/FileStorageService.java` |
| **Recherche d'utilisateurs** | Frontend : `components/UserSearchBar.tsx`<br>Backend : `controller/UserController.java` + `repository/UserRepository.java` |
| **Profil & Follow/Unfollow** | Frontend : `app/profile/[id]/page.tsx` + `components/FollowButton.tsx`<br>Backend : `controller/ProfileController.java` + `service/ProfileService.java` |
| **Sécurité & Cookies** | Backend : `config/SecurityConfig.java` + `config/CorsConfig.java` |
| **Base de Données & Migrations** | Backend : `resources/db/migration/sqlite/` + `entity/User.java` |

---

## 5. Vocabulaire Technique & Mots-Clés qui Font la Différence

Utilisez ces termes précis pendant votre présentation pour faire une excellente impression :

- **"Architecture en couches (N-Tiers)" :** Controller, Service, Repository, DTO, Entity.
- **"Découplage" :** Séparation nette entre le front-end React et l'API REST.
- **"Stateful Session" :** Gestion de session persistée via Spring Session JDBC en base SQLite.
- **"Debouncing" :** Temporisation d'événement asynchrone pour l'optimisation réseau.
- **"Type Safety" :** Typage fort de bout en bout grâce à Java et TypeScript.
- **"Immutabilité & Nettoyage mémoire" :** Révocation des Object URLs (`URL.revokeObjectURL`) pour éviter les fuites de mémoire dans le navigateur.
- **"Conteneurisation Multi-stage" :** Optimisation de la taille et de la sécurité des images Docker.

---

## 6. Attitude et Conseils le Jour J

1. **Parlez avec assurance :** Vous avez compris chaque brique du projet. Si l'auditeur pose une question, prenez 2 secondes pour respirer et structurez votre réponse en 2 ou 3 points.
2. **Montrez le code avec fierté :** N'hésitez pas à dire : *"Laissez-moi vous montrer dans le fichier X comment j'ai implémenté cela précisément."*
3. **Si vous ne savez pas une réponse théorique :** Ne paniquez jamais. Dites honnêtement : *"Sur ce point précis, j'ai privilégié l'approche X pour garantir la robustesse du projet, mais je sais que l'alternative Y existe et pourrait être explorée pour de futures évolutions."*
