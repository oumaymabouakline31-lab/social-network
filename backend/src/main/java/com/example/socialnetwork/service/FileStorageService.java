package com.example.socialnetwork.service;

import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    // Dossier local où sont enregistrées les images
    private static final String UPLOAD_DIR = "uploads/avatars";

    // Types d'images autorisés (Sécurité)
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    );

    private final Path rootLocation = Paths.get(UPLOAD_DIR);

    /**
     * Crée le répertoire uploads/avatars au démarrage si nécessaire.
     */
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory: " + UPLOAD_DIR, e);
        }
    }

    /**
     * Valide et sauvegarde un fichier image d'avatar sur le disque.
     * @param file Le fichier MultipartFile envoyé par le frontend
     * @return L'URL relative publique de l'image (ex: /uploads/avatars/uuid.png)
     */
    public String storeAvatar(MultipartFile file) {
        System.out.println("tswirraaaaaaaaaaaaaaaaaaa:"+file);
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty or missing");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPEG, PNG, WEBP, and GIF images are allowed");
        }

        // Récupération sécurisée de l'extension
        String originalFilename = file.getOriginalFilename();
        String extension = ".png"; // extension par défaut
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            // Nettoyage de l'extension
            if (!extension.matches("^\\.[a-z0-9]+$")) {
                extension = ".png";
            }
        }

        // Génération d'un nom unique pour éviter les collisions et écrasements
        String uniqueFilename = UUID.randomUUID().toString() + extension;
        Path destinationFile = this.rootLocation.resolve(Paths.get(uniqueFilename)).normalize().toAbsolutePath();

        // Protection contre le Path Traversal
        if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot store file outside upload directory");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store image file", e);
        }

        // Retourne le chemin d'accès public
        return "/uploads/avatars/" + uniqueFilename;
    }
}

