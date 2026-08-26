# Commandes Docker Compose

## Démarrer les services

```bash
docker compose up -d
```

## Arrêter les services

```bash
docker compose down
```

## Reconstruire et démarrer

```bash
docker compose up --build -d
```

## Voir le statut des conteneurs

```bash
docker compose ps
```

## Voir les logs

```bash
docker compose logs -f
```

## Logs d'un service spécifique

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

## Arrêter et supprimer les volumes

```bash
docker compose down -v
```

## Exécuter une commande dans un conteneur

```bash
docker compose exec backend sh
docker compose exec frontend sh
```

## Redémarrer un service

```bash
docker compose restart backend
docker compose restart frontend
```

## Construire sans cache

```bash
docker compose build --no-cache
```
