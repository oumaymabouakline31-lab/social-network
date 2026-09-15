# Spring Boot: Code → Compile → Run Flow

## Complete Compilation & Runtime Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: WRITE CODE                                                       │
│                                                                             │
│  You write .java files in src/main/java/                                    │
│                                                                             │
│  src/main/java/com/example/socialnetwork/                                  │
│  ├── SocialNetworkApplication.java    ← @SpringBootApplication entry point │
│  ├── controller/                                                      │
│  │   ├── PostController.java           ← REST endpoints                  │
│  │   ├── CommentController.java                                           │
│  │   └── AuthController.java                                             │
│  ├── service/                                                         │
│  │   ├── PostService.java              ← Business logic                  │
│  │   └── CommentService.java                                             │
│  ├── repository/                                                      │
│  │   ├── PostRepository.java           ← Data access (JPA interfaces)   │
│  │   ├── UserRepository.java                                             │
│  │   ├── CommentRepository.java                                         │
│  │   ├── FollowRepository.java                                          │
│  │   └── PostAllowedViewerRepository.java                               │
│  ├── entity/                                                          │
│  │   ├── Post.java                     ← @Entity JPA mappings           │
│  │   ├── User.java                                                      │
│  │   ├── Comment.java                                                   │
│  │   ├── Follow.java                                                    │
│  │   ├── PostAllowedViewer.java                                         │
│  │   └── PostPrivacy.java                                               │
│  ├── dto/                                                             │
│  │   ├── CreatePostRequest.java                                        │
│  │   ├── PostResponse.java                                             │
│  │   └── ...                                                            │
│  └── config/                                                          │
│      ├── SecurityConfig.java             ← Spring Security config       │
│      └── CorsConfig.java                                               │
│                                                                             │
│  Also: src/main/resources/                                                  │
│  ├── application.properties (or .yml)    ← Runtime configuration         │
│  └── db/migration/                        ← Flyway SQL scripts           │
└───────────────────────────┬─────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: MAVEN RESOLVE (mvn compile / mvn package)                        │
│                                                                             │
│  ┌──────────────┐                                                          │
│  │   pom.xml     │──► Maven reads dependencies & plugins                   │
│  └──────┬───────┘                                                          │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────┐                           │
│  │  spring-boot-starter-parent (4.1.0)         │                           │
│  │  ├── Manages ALL dependency versions         │                           │
│  │  ├── Configures maven-compiler-plugin        │                           │
│  │  ├── Configures spring-boot-maven-plugin     │                           │
│  │  └── Sets Java 21 as default                 │                           │
│  └────────────┬────────────────────────────────┘                           │
│               │                                                             │
│               ▼                                                             │
│  ┌─────────────────────────────────────────────┐                           │
│  │  Dependency Resolution                       │                           │
│  │                                               │                           │
│  │  spring-boot-starter-webmvc ─┐                │                           │
│  │  spring-boot-starter-security ─┤               │                           │
│  │  spring-boot-starter-data-jpa ─┤  All pulled   │                           │
│  │  spring-boot-starter-websocket ─┤  from Maven  │                           │
│  │  spring-session-jdbc ──────────┤  Central /   │                           │
│  │  spring-boot-starter-flyway ───┤  local repo  │                           │
│  │  sqlite-jdbc (3.45.1.0) ──────┤               │                           │
│  │  hibernate-community-dialects ─┤               │                           │
│  │  lombok (1.18.42) ────────────┘               │                           │
│  │                                               │                           │
│  │  Result: ~/.m2/repository/ contains all JARs │                           │
│  └────────────┬────────────────────────────────┘                           │
│               │                                                             │
│               ▼                                                             │
│  ┌─────────────────────────────────────────────┐                           │
│  │  Classpath Construction                      │                           │
│  │                                               │                           │
│  │  All JARs resolved into a classpath:          │                           │
│  │  spring-boot-starter-webmvc.jar               │                           │
│  │  ├── spring-web.jar                           │                           │
│  │  ├── spring-webmvc.jar                        │                           │
│  │  ├── spring-boot.jar                          │                           │
│  │  ├── spring-boot-autoconfigure.jar            │                           │
│  │  ├── tomcat-embed-core.jar (embedded server)  │                           │
│  │  └── ... many transitive deps                 │                           │
│  │  hibernate-core.jar                           │                           │
│  │  spring-data-jpa.jar                          │                           │
│  │  sqlite-jdbc.jar                              │                           │
│  │  lombok.jar                                   │                           │
│  └────────────┬────────────────────────────────┘                           │
└───────────────┬─────────────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: COMPILATION (javac + Annotation Processors)                      │
│                                                                             │
│  ┌─────────────────────────────────────────────┐                           │
│  │  Step 3a: Annotation Processing (Lombok)     │                           │
│  │                                               │                           │
│  │  pom.xml configures:                          │                           │
│  │  <annotationProcessorPaths>                   │                           │
│  │    <path>lombok:1.18.42</path>                │                           │
│  │  </annotationProcessorPaths>                  │                           │
│  │                                               │                           │
│  │  Lombok processes annotations FIRST:          │                           │
│  │                                               │                           │
│  │  @Getter / @Setter    → generates getFoo()    │                           │
│  │  @Data                 → generates all methods │                           │
│  │  @Builder              → generates builder     │                           │
│  │  @NoArgsConstructor   → generates constructor │                           │
│  │                                               │                           │
│  │  Example from entity/Post.java:               │                           │
│  │  ┌───────────────────────────────────┐        │                           │
│  │  │ @Data @Builder @Entity            │        │                           │
│  │  │ public class Post {               │        │                           │
│  │  │   @Id @GeneratedValue             │        │                           │
│  │  │   private Long id;                │        │                           │
│  │  │   private String content;         │        │                           │
│  │  │ }                                 │        │                           │
│  │  │ ── Lombok generates ──►           │        │                           │
│  │  │ Long getId()                      │        │                           │
│  │  │ void setId(Long id)              │        │                           │
│  │  │ Post builder() pattern           │        │                           │
│  │  │ equals(), hashCode(), toString() │        │                           │
│  │  └───────────────────────────────────┘        │                           │
│  └────────────┬────────────────────────────────┘                           │
│               │                                                             │
│               ▼                                                             │
│  ┌─────────────────────────────────────────────┐                           │
│  │  Step 3b: Java Compilation (javac)           │                           │
│  │                                               │                           │
│  │  Java 21 compiler processes all .java files   │                           │
│  │                                               │                           │
│  │  ┌──────────────┐   ┌──────────────────┐     │                           │
│  │  │ .java files   │──►│  javac compiler   │    │                           │
│  │  │ (source code) │   │                   │    │                           │
│  │  └──────────────┘   │  - Type checking   │    │                           │
│  │                      │  - Syntax checking │    │                           │
│  │  + Lombok generated  │  - Generics verify │    │                           │
│  │    source code       │  - Annotation check│    │                           │
│  │                      └────────┬──────────┘    │                           │
│  │                               │                │                           │
│  │                               ▼                │                           │
│  │                      ┌──────────────────┐     │                           │
│  │                      │   .class files    │     │                           │
│  │                      │  (bytecode)       │     │                           │
│  │                      └──────────────────┘     │                           │
│  │                                               │                           │
│  │  Target: target/classes/                       │                           │
│  │  ├── com/example/socialnetwork/               │                           │
│  │  │   ├── SocialNetworkApplication.class       │                           │
│  │  │   ├── controller/                           │                           │
│  │  │   ├── service/                              │                           │
│  │  │   ├── repository/                           │                           │
│  │  │   ├── entity/                               │                           │
│  │  │   ├── dto/                                  │                           │
│  │  │   └── config/                               │                           │
│  │  └── resources/                                │                           │
│  │      ├── application.properties               │                           │
│  │      └── db/migration/                         │                           │
│  └────────────┬────────────────────────────────┘                           │
└───────────────┬─────────────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: PACKAGE (mvn package)                                            │
│                                                                             │
│  ┌─────────────────────────────────────────────┐                           │
│  │  Spring Boot Maven Plugin kicks in           │                           │
│  │                                               │                           │
│  │  1. standard maven-jar-plugin creates:       │                           │
│  │     target/social-network-0.0.1-SNAPSHOT.jar  │                           │
│  │                                               │                           │
│  │  2. spring-boot-maven-plugin REPACKAGES it:   │                           │
│  │                                               │                           │
│  │  ┌────────────────────────────────────────┐   │                           │
│  │  │         Final JAR Structure             │   │                           │
│  │  │                                          │   │                           │
│  │  │  BOOT-INF/                              │   │                           │
│  │  │  ├── classes/                           │   │                           │
│  │  │  │   ├── com/example/socialnetwork/    │   │                           │
│  │  │  │   │   ├── SocialNetworkApplication. │   │                           │
│  │  │  │   │   ├── controller/               │   │                           │
│  │  │  │   │   ├── service/                  │   │                           │
│  │  │  │   │   ├── repository/               │   │                           │
│  │  │  │   │   ├── entity/                   │   │                           │
│  │  │  │   │   ├── dto/                      │   │                           │
│  │  │  │   │   └── config/                   │   │                           │
│  │  │  │   └── resources/                    │   │                           │
│  │  │  │       ├── application.properties    │   │                           │
│  │  │  │       └── db/migration/             │   │                           │
│  │  │  └── lib/                              │   │                           │
│  │  │      ├── spring-web-6.x.jar            │   │                           │
│  │  │      ├── spring-webmvc-6.x.jar         │   │                           │
│  │  │      ├── spring-boot-4.1.0.jar         │   │                           │
│  │  │      ├── spring-boot-autoconfigure.jar │   │                           │
│  │  │      ├── hibernate-core.jar            │   │                           │
│  │  │      ├── spring-data-jpa.jar           │   │                           │
│  │  │      ├── sqlite-jdbc.jar               │   │                           │
│  │  │      ├── tomcat-embed-core.jar         │   │                           │
│  │  │      ├── spring-security-core.jar      │   │                           │
│  │  │      └── ... (all dependency JARs)     │   │                           │
│  │  │                                          │   │                           │
│  │  │  org/springframework/boot/loader/       │   │                           │
│  │  │  ├── Launcher.class                     │   │                           │
│  │  │  ├── JarLauncher.class                  │   │                           │
│  │  │  ├── WarLauncher.class                  │   │                           │
│  │  │  └── ... (Spring Boot Loader)           │   │                           │
│  │  │                                          │   │                           │
│  │  │  META-INF/                               │   │                           │
│  │  │  ├── MANIFEST.MF                        │   │                           │
│  │  │  └── spring/                             │   │                           │
│  │  │      └── autoconfigure.imports          │   │                           │
│  │  └────────────────────────────────────────┘   │                           │
│  └────────────┬────────────────────────────────┘                           │
│               │                                                             │
│               ▼                                                             │
│  Result: java -jar target/social-network-0.0.1-SNAPSHOT.jar               │
└───────────────┬─────────────────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 5: RUNTIME STARTUP (java -jar ...)                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────┐                           │
│  │  Step 5a: Spring Boot Loader                 │                           │
│  │                                               │                           │
│  │  JarLauncher extracts nested JARs            │                           │
│  │  Sets up custom ClassLoader                  │                           │
│  │  Finds main class from MANIFEST.MF:          │                           │
│  │  Main-Class: org.springframework.boot.       │                           │
│  │              loader.JarLauncher               │                           │
│  │  Start-Class: com.example.socialnetwork.     │                           │
│  │               SocialNetworkApplication        │                           │
│  └────────────┬────────────────────────────────┘                           │
│               │                                                             │
│               ▼                                                             │
│  ┌─────────────────────────────────────────────┐                           │
│  │  Step 5b: SpringApplication.run()           │                           │
│  │                                               │                           │
│  │  SpringApplication.run(                      │                           │
│  │    SocialNetworkApplication.class, args);    │                           │
│  │                                               │                           │
│  │  1. Create ApplicationContext                │                           │
│  │     (AnnotationConfigServletWebServer...)     │                           │
│  │                                               │                           │
│  │  2. @SpringBootApplication triggers:         │                           │
│  │     ├── @SpringBootConfiguration             │                           │
│  │     │   (marks this as config class)         │                           │
│  │     ├── @EnableAutoConfiguration             │                           │
│  │     │   (reads META-INF/spring/              │                           │
│  │     │    autoconfigure.imports)              │                           │
│  │     └── @ComponentScan                       │                           │
│  │         (scans com.example.socialnetwork.*)  │                           │
│  └────────────┬────────────────────────────────┘                           │
│               │                                                             │
│               ▼                                                             │
│  ┌─────────────────────────────────────────────┐                           │
│  │  Step 5c: Auto-Configuration                 │                           │
│  │                                               │                           │
│  │  Spring Boot reads autoconfigure.imports and  │                           │
│  │  conditionally creates beans:                 │                           │
│  │                                               │                           │
│  │  DataSourceAutoConfig  ──► Creates DataSource │                           │
│  │  HibernateJpaAuto     ──► Creates EntityManagerFactory                   │
│  │  FlywayAutoConfig     ──► Runs DB migrations │                           │
│  │  SecurityFilterAuto   ──► SecurityFilterChain│                           │
│  │  WebMvcAutoConfig     ──► DispatcherServlet  │                           │
│  │  TomcatAutoConfig     ──► Embedded Tomcat    │                           │
│  │  WebSocketAutoConfig  ──► WebSocket handler  │                           │
│  │  SessionAutoConfig    ──► JDBC Session store │                           │
│  └────────────┬────────────────────────────────┘                           │
│               │                                                             │
│               ▼                                                             │
│  ┌─────────────────────────────────────────────┐                           │
│  │  Step 5d: Component Scanning ( YOUR CODE )   │                           │
│  │                                               │                           │
│  │  @RestController                              │                           │
│  │  ├── PostController      → bean created       │                           │
│  │  ├── CommentController   → bean created       │                           │
│  │  └── AuthController      → bean created       │                           │
│  │                                               │                           │
│  │  @Service                                      │                           │
│  │  ├── PostService         → bean created       │                           │
│  │  └── CommentService      → bean created       │                           │
│  │                                               │                           │
│  │  @Repository (Spring Data auto-implements)    │                           │
│  │  ├── PostRepository      → bean created       │                           │
│  │  │   (extends JpaRepository → Spring Data     │                           │
│  │  │    generates proxy implementation)          │                           │
│  │  ├── UserRepository      → bean created       │                           │
│  │  ├── CommentRepository   → bean created       │                           │
│  │  ├── FollowRepository    → bean created       │                           │
│  │  └── PostAllowedViewer.. → bean created       │                           │
│  │                                               │                           │
│  │  @Configuration                               │                           │
│  │  ├── SecurityConfig      → bean created       │                           │
│  │  └── CorsConfig          → bean created       │                           │
│  │                                               │                           │
│  │  @Entity (JPA entities → mapped to DB tables) │                           │
│  │  ├── Post, User, Comment, Follow,            │                           │
│  │  │   PostAllowedViewer, PostPrivacy           │                           │
│  └────────────┬────────────────────────────────┘                           │
│               │                                                             │
│               ▼                                                             │
│  ┌─────────────────────────────────────────────┐                           │
│  │  Step 5e: Dependency Injection Wiring         │                           │
│  │                                               │                           │
│  │  PostController                               │                           │
│  │    ├── @Autowired PostService                 │                           │
│  │    └── @Autowired SecurityConfig              │                           │
│  │                                               │                           │
│  │  PostService                                  │                           │
│  │    ├── @Autowired PostRepository              │                           │
│  │    └── @Autowired UserRepository              │                           │
│  │                                               │                           │
│  │  CommentService                               │                           │
│  │    ├── @Autowired CommentRepository           │                           │
│  │    └── @Autowired UserRepository              │                           │
│  │                                               │                           │
│  │  PostRepository ──► Hibernate ──► SQLite DB   │                           │
│  │  (generated proxy)   (ORM)       (datasource) │                           │
│  └────────────┬────────────────────────────────┘                           │
│               │                                                             │
│               ▼                                                             │
│  ┌─────────────────────────────────────────────┐                           │
│  │  Step 5f: Server Ready!                       │                           │
│  │                                               │                           │
│  │  Embedded Tomcat starts on port 8080          │                           │
│  │  Flyway runs migrations → tables created      │                           │
│  │  Spring Data repos → SQL proxies ready        │                           │
│  │                                               │                           │
│  │  ╔═══════════════════════════════════════╗    │                           │
│  │  ║  Started SocialNetworkApplication     ║    │                           │
│  │  ║  in X seconds (process: 12345)        ║    │                           │
│  │  ╚═══════════════════════════════════════╝    │                           │
│  └─────────────────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 6: REQUEST FLOW (at runtime)                                        │
│                                                                             │
│  HTTP Request                                                               │
│  ──────────►                                                                │
│                                                                             │
│  ┌──────────────┐    ┌────────────────┐    ┌──────────────────┐            │
│  │  Client      │───►│  Tomcat        │───►│  Dispatcher      │            │
│  │  (Browser/   │    │  (port 8080)   │    │  Servlet         │            │
│  │   Postman)   │    └────────────────┘    └────────┬─────────┘            │
│  └──────────────┘                                    │                      │
│                                          ┌───────────┘                      │
│                                          ▼                                  │
│                              ┌───────────────────────┐                      │
│                              │  Security Filter Chain │                      │
│                              │  (SecurityConfig)      │                      │
│                              └───────────┬───────────┘                      │
│                                          │                                  │
│                                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐                   │
│  │  @RequestMapping / @GetMapping / @PostMapping        │                   │
│  │                                                      │                   │
│  │  PostController                                      │                   │
│  │  ├── @GetMapping("/api/posts")                       │                   │
│  │  │   → getAllPosts()                                  │                   │
│  │  │   → PostService.getAllPosts()                     │                   │
│  │  │   → PostRepository.findAll()                      │                   │
│  │  │   → Hibernate SQL → SQLite DB                     │                   │
│  │  │   → Returns List<Post>                            │                   │
│  │  │   → Wrapped in PostResponse DTOs                  │                   │
│  │  │                                                   │                   │
│  │  ├── @PostMapping("/api/posts")                      │                   │
│  │  │   → createPost(CreatePostRequest)                 │                   │
│  │  │   → PostService.createPost()                      │                   │
│  │  │   → PostRepository.save()                         │                   │
│  │  │   → Hibernate SQL INSERT → SQLite                 │                   │
│  │  │                                                   │                   │
│  │  └── @DeleteMapping("/api/posts/{id}")               │                   │
│  │      → deletePost(id)                                │                   │
│  │      → PostService.deletePost()                      │                   │
│  │      → PostRepository.deleteById()                   │                   │
│  │      → Hibernate SQL DELETE → SQLite                 │                   │
│  └──────────────────────────────────────────────────────┘                   │
│                                          │                                  │
│                                          ▼                                  │
│                              ┌───────────────────────┐                      │
│                              │  Response Body (JSON)  │                      │
│                              │  ← Jackson serializes  │                      │
│                              │    Java objects → JSON  │                      │
│                              └───────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Summary Table

| Phase | What Happens | Tool/Command |
|-------|-------------|--------------|
| **1. Write Code** | `.java` files + `pom.xml` + resources | IDE |
| **2. Resolve** | Maven downloads dependencies from Maven Central | `mvn compile` |
| **3. Compile** | Lombok generates boilerplate → `javac` compiles `.java` → `.class` | `maven-compiler-plugin` |
| **4. Package** | `spring-boot-maven-plugin` repackages JAR with embedded server | `mvn package` |
| **5. Run** | Spring Boot Loader → Auto-config → Component scan → DI wiring → Server start | `java -jar` |
| **6. Request** | HTTP → Tomcat → Filters → Controller → Service → Repository → Hibernate → SQLite → Response | Runtime |

## Key Insights

- **spring-boot-starter-parent**: Manages ALL dependency versions so you don't have to
- **Lombok**: Reduces boilerplate via annotation processing at compile time (generates getters, setters, builders, etc.)
- **spring-boot-maven-plugin**: Creates a "fat JAR" that bundles all dependencies + embedded Tomcat so you can run the entire app with a single `java -jar` command
- **Auto-Configuration**: Spring Boot reads `autoconfigure.imports` and conditionally creates beans (DataSource, EntityManager, DispatcherServlet, etc.) based on which dependencies are on the classpath
- **Spring Data JPA**: Automatically generates repository proxy implementations at runtime — you write interfaces, Spring Data writes the SQL
- **Embedded Server**: No external Tomcat/Jetty needed — it's bundled inside the JAR
