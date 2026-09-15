# Commandes Git de base

## Configuration initiale

```bash
git init
```
Initialiser un dépôt Git local.

```bash
git clone <url>
```
Cloner un dépôt distant.

## Les changements

```bash
git status
```
Afficher l'état des fichiers modifiés.

```bash
git add <fichier>
```
Ajouter un fichier à l'index (staging area).

```bash
git add .
```
Ajouter tous les fichiers modifiés.

```bash
git commit -m "message"
```
Valider les changements avec un message.

```bash
git diff
```
Afficher les différences non staged.

```bash
git diff --staged
```
Afficher les différences staged.

## L'historique

```bash
git log
```
Afficher l'historique des commits.

```bash
git log --oneline
```
Afficher l'historique en une ligne par commit.

```bash
git log --graph
```
Afficher l'historique sous forme de graphe.

```bash
git show <commit>
```
Afficher les détails d'un commit.

## Les branches

```bash
git branch
```
Lister les branches locales.

```bash
git branch <nom>
```
Créer une nouvelle branche.

```bash
git checkout <branche>
```
Basculer sur une branche.

```bash
git switch <branche>
```
Basculer sur une branche (commande moderne).

```bash
git switch -c <branche>
```
Créer et basculer sur une nouvelle branche.

```bash
git branch -d <branche>
```
Supprimer une branche fusionnée.

```bash
git merge <branche>
```
Fusionner une branche dans la branche actuelle.

## La synchronisation

```bash
git push
```
Envoyer les commits vers le dépôt distant.

```bash
git push -u origin <branche>
```
Envoyer et lier la branche au distant.

```bash
git pull
```
Récupérer et fusionner les changements distants.

```bash
git fetch
```
Récupérer les changements distants sans fusionner.

## Les annulations

```bash
git restore <fichier>
```
Annuler les modifications d'un fichier non staged.

```bash
git restore --staged <fichier>
```
Retirer un fichier de l'index.

```bash
git reset --soft <commit>
```
Annuler le dernier commit en gardant les changements.

```bash
git reset --hard <commit>
```
Annuler les changements et revenir à un commit (attention : irréversible).

```bash
git stash
```
Mettre de côté les changements en cours.

```bash
git stash pop
```
Récupérer les changements mis de côté.

```bash
git stash list
```
Afficher la liste des stashes.

## Alias utiles

Ajouter dans `~/.gitconfig` :

```ini
[alias]
    s = status
    co = checkout
    br = branch
    lg = log --oneline --graph --all
    unstage = restore --staged
    last = log -1 HEAD
```
