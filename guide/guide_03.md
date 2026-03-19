
/**
 * @file: [File Name]
 * @purpose: [1-2 sentences on what this file does and why it exists]
 * @business_rules: [Key logic constraints, e.g., "only premium users access this"]
 * @tech_stack: [Language, Version, Frameworks, Key Libraries]
 * @dependencies: [Major external service or module links]
 * @coding_standards: [Naming conventions, preferred patterns]
 * @ai_directives: [Special instructions like "never use library X", "always add error handling"]
 */


 /*
Package [Name] - [Short Description]

INTENT: 
- [High-level goal, e.g., "Manages the lifecycle of worker pools for stream processing"]
- [Technical rationale, e.g., "Uses non-blocking channels to prevent deadlock in high-throughput scenarios"]

CONTEXT:
- Domain: [e.g., Infrastructure / Billing / Auth]
- External Deps: [e.g., google.golang.org/grpc, ://github.com]
- Concurrency: [e.g., Thread-safe; uses Mutex for state protection]

AI DIRECTIVES:
- Standard: Follow Effective Go (golang.org/doc/effective_go)
- Error Handling: Use 'fmt.Errorf("context: %w", err)' for wrapping; no panics.
- Testing: Ensure all exported functions have table-driven tests.
- Style: Prefer pointer receivers for structs; use functional options for config.
*/


Here is an example for a Domain Service (the Core):

/*
PACKAGE: [Name] (Core Domain Layer)

ARCHITECTURE ROLE: 
- This is the "Inside" of the hexagon. 
- Contains pure business logic and defines Ports (Interfaces).

STRICT CONSTRAINTS:
- No dependencies on "Outside" layers (Adapters, DBs, HTTP, or external APIs).
- Must only use Go standard library and internal Domain models.
- Communication with external systems must happen via Ports (interfaces defined here).

AI DIRECTIVES:
- Logic: Keep business rules here; do not mix with transport logic (JSON/Protobuf).
- Domain Errors: Define custom error types (e.g., ErrUserNotFound) to be translated by Adapters.
- Ports: Use 'type [Name]Store interface' for persistence abstraction.
*/


1. The Domain Model (Entities/Value Objects)
This is the heart of the hexagon. AI tends to add too much "utility" code here. The header ensures these stay "anaemic" or strictly focused on state validation.

```
/*
PACKAGE: [Name] (Core Domain Models)

ARCHITECTURE ROLE: 
- Pure business entities and Value Objects.
- Contains NO logic related to DBs, APIs, or Use Cases.

CONSTRAINTS:
- No side effects. Methods should be pure functions.
- Validation: Enforce business invariants (e.g., "Age > 18").
- Structs: No 'json' or 'db' tags (keep it transport/storage agnostic).

AI DIRECTIVES:
- Use Constructor functions: NewUser(...) (User, error).
- Favour Value Objects (e.g., type Email string) over primitives.
*/
```


Here is the template for a Secondary Adapter (e.g., a PostgreSQL Repository):

```
/*
PACKAGE: [Name] (Infrastructure / Adapter Layer)

ARCHITECTURE ROLE: 
- Implements the [PortName] interface defined in the Domain.
- Handles technical implementation for: [e.g., PostgreSQL persistence].

STRICT CONSTRAINTS:
- No business logic; only mapping and execution.
- Maps Domain models <-> Infrastructure models (DB structs).
- Translates implementation errors (e.g., pgx.ErrNoRows) to Domain errors.

AI DIRECTIVES:
- Dependency: Import the Domain package for interfaces and models.
- Mapping: Use a dedicated 'toDomain' / 'fromDomain' helper for data conversion.
- SQL: Use 'sqlc' or 'pgx' patterns; ensure context timeouts are respected.
*/
```


---

2. The Application Layer (Use Cases / Interactors)
This is the orchestration layer. It sits between the Primary Adapter (HTTP) and the Domain. AI often tries to put business logic here, but this layer should only coordinate.

```
/*
PACKAGE: [Name] (Application Layer / Use Cases)

ARCHITECTURE ROLE: 
- Orchestrates Domain Entities and Ports.
- Translates input data into Domain calls.

CONSTRAINTS:
- No Business Rules (those live in the Domain).
- No Infrastructure details (SQL/JSON).
- Transaction Management: This is where atomic units of work start.

AI DIRECTIVES:
- Use dependency injection for all Ports.
- Keep functions "thin"—fetch from Port -> call Domain -> save to Port.
- Logging & Telemetry: Best place for middleware/observability logic.
*/
```

3. The "Dependency Injection" (Main/Wiring)

This is the "Outer Rim" where you actually plug the Adapters into the Core. AI often struggles with the wiring of multiple interfaces.

```
/*
PACKAGE: main (Composition Root)

ARCHITECTURE ROLE: 
- Wires together Adapters and the Core.
- Entry point for the application.

AI DIRECTIVES:
- Initialize all Infrastructure (DB pools, HTTP clients) first.
- Inject concrete Adapters into Application Services.
- Handle graceful shutdown (SIGTERM/SIGINT).
*/
```


The TUI Adapter (Primary Adapter)
This layer should only handle keyboard/mouse input and rendering. It should call the Application Layer to do any real work.

/*
PACKAGE: [Name] (TUI / Primary Adapter)

ARCHITECTURE ROLE: 
- Entry point for user interaction via Terminal.
- Implements the 'tea.Model' interface (Bubble Tea).
- Translates TUI messages into calls to the Application Layer.

STRICT CONSTRAINTS:
- View Logic Only: No business rules or DB calls.
- Pure Mapping: Map Application results to UI State (bubbles/styles).
- Decoupling: Use Command (tea.Cmd) to trigger Application Use Cases.

AI DIRECTIVES:
- Framework: Use '://github.com' and 'lipgloss'.
- State Management: Keep the model "skinny"; delegate logic to the Domain.
- Rendering: Ensure the 'View()' method is a pure function of the Model.
- Components: Break UI into small, testable sub-models if complexity grows.
*/