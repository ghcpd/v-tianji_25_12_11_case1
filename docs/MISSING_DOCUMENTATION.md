Missing Documentation Detection
=================================
Title: Missing Documentation Detection
Description: This document lists missing documentation items across the project that impact maintainability and onboarding. Each entry indicates the target symbol or module, the issue, a short code context, the impact, suggested documentation text, and placement recommendation.

Formatting for entries:
- Target: file path + symbol
- Issue: concise description of what is missing
- Context: a short code excerpt or description of the relevant code
- Impact: why the missing doc matters
- Suggested Documentation: short paragraph of suggested content
- Placement: where to add the suggested documentation (file and location)

---

1) Target: [src/App.tsx](src/App.tsx) — `App`
Issue: No module-level doc for application routes and context providers
Context: `TaskProvider` wraps `BrowserRouter` and `Layout`, and routes are defined for `/`, `/task/:id`, `/project/:projectId`.
Impact: Designers and engineers may duplicate provider logic or misunderstand the routes and context reach.
Suggested Documentation: Add a short module-level comment: "App is the entry React component that wires global `TaskProvider` and router to `Layout`. This component registers routes `/`, `/task/:id`, `/project/:projectId` and should contain only contextual/global top-level providers." Also document server-rendering constraints, if any.
Placement: Top of `src/App.tsx` (above imports or above the `App` function declaration).

---

2) Target: [src/main.tsx](src/main.tsx) — module entry
Issue: Missing documentation on bootstrap, mounting, and strict mode usage
Context: Uses `ReactDOM.createRoot(document.getElementById('root')!)` and `React.StrictMode`.
Impact: New contributors may not realize `index.html` root id required for the app and may modify mount points incorrectly.
Suggested Documentation: "Main app bootstrap for client side that mounts `App` into element id `root`. Runs `React.StrictMode` for development checks. Modify only when changing mount behavior or adding providers.
Placement: Top of `src/main.tsx`.

---

3) Target: [src/store/TaskStore.tsx](src/store/TaskStore.tsx) — module & `TaskState` interface
Issue: No comments describing the store's API, data semantics or intended usage of exported hook `useTasks` and `TaskProvider`.
Context: `TaskState` includes `tasks`, `projects`, `filters`, and methods such as `addTask`, `updateTask`, `getFilteredTasks` and `getTaskStatistics`.
Impact: Unclear contract for parameters and return values; unknown side effects like default values set when adding a task, how `filters` behave, and race conditions regarding concurrency.
Suggested Documentation: Add header and TSDoc explanations: the store uses Zustand to provide a centralized task list; each method should include argument types, whether dates remain `Date` or string, how default values are derived (`generateId`, `estimateCompletion`), and how `getFilteredTasks` processes search queries and filters.
Placement: At the top of `src/store/TaskStore.tsx`, add JSDoc comments to `TaskState` and each exported-provider function.

---

4) Target: [src/store/TaskStore.tsx](src/store/TaskStore.tsx) — `getFilteredTasks` filter logic
Issue: No comment explaining search scope, case-sensitivity, and filter precedence
Context: Function matches `status`, `priority`, `projectId`, and `searchQuery` against `title`, `description` and `tags` (case-insensitive due to `.toLowerCase()`).
Impact: Developers altering the logic may unintentionally change behavior; unit tests may not cover expected precedence.
Suggested Documentation: "Describe in detail how filters are applied: `status` and `priority` filter by exact match; `projectId` filters by equality; `searchQuery` is case-insensitive and checks `title`, `description`, and `tags` for substring matches. The function short-circuits on mismatches from the first check, improving performance."
Placement: Immediately above `getFilteredTasks` implementation within `src/store/TaskStore.tsx`.

---

5) Target: [src/types/index.ts](src/types/index.ts) — types and fields
Issue: No TSDoc for domain model types: `Task`, `Project`, `FilterState`, `TaskFormData`, and unions `TaskStatus`, `Priority`.
Context: Types define fields such as `complexity?: number` (range implied in UI) and `dueDate?: Date`, but `TaskForm` uses `dueDate` as string.
Impact: Unclear conversions between forms and domain models (string ↔ Date), type mismatches during API transforms, and incorrect assumptions about optional fields.
Suggested Documentation: Add descriptions for each type, e.g., "`Task.complexity` represents relative effort from 1-10. `dueDate` is stored as Date; `TaskFormData.dueDate` is a string (form ISO date)." Also mention any invariants (createdAt/updatedAt presence, default values).
Placement: Add above each type in `src/types/index.ts`.

---

6) Target: [src/utils/helpers.ts](src/utils/helpers.ts) — all exported utilities
Issue: No function-level documentation describing behaviors, non-obvious logic and side-effects (e.g., randomness in `estimateCompletion`).
Context and Impact: Key functions:
- `generateId()` — creates a timestamp-based ID with appended random string. No comment on its scope or collisions.
- `calculatePriority(dueDate, complexity)` — returns Priority using urgencyScore = daysUntilDue * complexity; thresholds are 2, 7, 14 which may be domain-specific and not obvious.
- `estimateCompletion(complexity)` — uses random `variance` to produce non-deterministic examples.
- `sortTasks(tasks, sortBy)` — sorts by 'priority', 'date', 'title', 'complexity' using weight mapping.
- `debounce`/`throttle` — NodeJS.Timeout typing and browser semantics; not explained how to cancel or how it behaves across renders.
Suggested Documentation: Add TSDoc on each function with a summary, parameter descriptions, return types, and precise behavior (e.g., `calculatePriority` uses daysUntilDue * complexity; `estimateCompletion` is not deterministic; the debounce function returns a function that does not support immediate invocation but clears and sets new timeouts each invocation).
Placement: Add JSDoc comments directly above each exported function in `src/utils/helpers.ts`.

---

7) Target: [src/utils/api.ts](src/utils/api.ts) — exported API client functions
Issue: No function-level documentation describing API behavior, transforms, expectations, and the interceptors' side effects.
Context: Interceptors: request interceptor reads `localStorage.authToken` and sets `Authorization` header; response interceptor clears local token and `window.location.href = '/login'` on 401. Transform functions convert `Date` strings into Date objects and vice versa for the API.
Impact: Unclear that API transforms convert ISO date strings into `Date` objects and that a 401 will redirect the app to `/login`. Developers might not expect the redirect, or that `createTask/updateTask` must send ISO strings for dates.
Suggested Documentation: Add doc strings for `apiClient` describing default base URL precedence `VITE_API_URL`, interceptors' side effects, and for each exported function: the endpoint, payload shape, returned shape, and pre/post conversion details for date fields. Also note that 401 handler happens globally and will redirect to `/login`.
Placement: Top of `src/utils/api.ts`, and on each exported function.

---

8) Target: `src/components/`: Layout.tsx, TaskForm.tsx, TaskCard.tsx, TaskFilter.tsx
Issue: Components lack inline documentation describing props, side effects, and invariants.
Context and Impact:
- `Layout` uses `useTasks` and `getTaskStatistics`, but doesn't document assumptions about availability of `TaskProvider`.
- `TaskCard` wraps the card inside a `Link` to `/task/:id`, prevents clicks from propagating for checkbox etc., and asks for a deletion confirmation; this needs to be documented so future UX changes don't break event handling.
- `TaskForm` expects `onSubmit` to receive `TaskFormData` where `dueDate` is a string; validation uses `validateTaskData`.
- `TaskFilter` uses `debounce` for search input and sets filters by calling `useTasks().setFilter`.
Suggested Documentation: Add a brief header at the top of each component file describing: what props are expected and their contract (shape and optional behavior), side effects (e.g., `TaskCard` prevents event propagation), and any UX decisions (confirmations, resets, form behavior). Note `TaskForm` date format expectations.
Placement: Add component-level comments in each component file (`src/components/*.tsx`) and TSDoc-based comments for `interface` props.

---

9) Target: `src/pages/`: Dashboard.tsx, TaskDetail.tsx, ProjectView.tsx
Issue: Missing high-level documentation of page responsibilities, the shape of local state (e.g., `showForm`, `sortBy`), and UX-specific behavior (e.g., `handleSubmit` transform logic).
Context and Impact: Each page implements the view logic that transforms TaskForm data into store calls. The data conversions (e.g., mapping string `dueDate` to Date and updating store fields) are not documented.
Suggested Documentation: Add a header for each page describing responsibilities and example lifecycle scenarios (where data is pulled from the store and which components it uses). For `TaskDetail` mention that `handleUpdate` maps strings to `Date` and that `TaskForm` `initialData` expects a string date (format: `YYYY-MM-DD`).
Placement: Add comments at the top of each page file.

---

10) Target: [vite.config.ts](vite.config.ts)
Issue: No documentation about dev server configuration or default port, nor mention of env variables used by the app.
Context: File sets `server.port = 3000` and uses plugin `@vitejs/plugin-react`.
Impact: Developers may be confused why the dev server runs on 3000, or not realize how to override it.
Suggested Documentation: Add a brief comment describing default dev server port, how to override `VITE_PORT` if desired, and where to configure `VITE_API_URL` environment variable used by the API client.
Placement: Top of `vite.config.ts`.

---

11) Target: [src/pages/TaskDetail.tsx](src/pages/TaskDetail.tsx) — Inline `getPriorityColor` function
Issue: Duplicate function that mirrors utility `getPriorityColor` from helpers (one in `getPriorityColor` local to TaskDetail; other in `utils/helpers`), and no docs about priority color mapping.
Context: `getPriorityColor` local map duplicates helpers; no doc about color semantics or where to centralize color map.
Impact: Inconsistent priority-color mappings across the codebase if one is updated and not the other.
Suggested Documentation: Add a comment directing to use the shared helper or centralize the color map. Document the mapping and color hex codes.
Placement: Move `getPriorityColor` to `helpers.ts` (or remove duplicate) and document mapping at the function.

---

12) Target: `src/utils/helpers.ts` — `debounce` and `throttle` functions
Issue: No warnings or docs about `debounce` and `throttle` lifetime across React renders and memory leaks; `debounce` returns a function that cannot be cancelled.
Context: Implementation uses `let timeout: NodeJS.Timeout | null` and `setTimeout`.
Impact: Using these helpers in components without memoization or cleanup can result in memory leaks or unexpected behavior when the component unmounts or re-renders; developers may call `debounce` inside a render or event handler incorrectly.
Suggested Documentation: Explain that the helper should be memoized with `useMemo` or declared outside of render; mention the absence of `cancel` method and how to avoid leaks; document platform differences regarding `NodeJS.Timeout` vs `number` in browser env.
Placement: On the helper functions in `src/utils/helpers.ts`.

---

13) Target: src/components/TaskCard.tsx — prop behaviors and confirm/delete UX
Issue: No documentation describing how event handling is implemented (stopPropagation, confirm prompt) and the component's role of linking to detail page.
Context: Click on the `Link` wraps entire card; `onToggleComplete` and `onDelete` handlers use `e.stopPropagation` to avoid following the link when clicking controls.
Impact: Changing event handling may break navigation UX; future maintainers may not realize why `preventDefault`/`stopPropagation` is used and could accidentally remove it.
Suggested Documentation: Add a short doc comment on the component and `handleDelete`/`handleToggle` describing the rationale and intended UX.
Placement: At top of `src/components/TaskCard.tsx`, and on the `TaskCardProps` definition.

---

14) Target: src/components/TaskForm.tsx — `initialData` and form to model mapping
Issue: No documentation for `initialData` shape and `TaskFormData` vs `Task` conversions (string vs Date for `dueDate`).
Context: `initialData` is Partial<TaskFormData>, UI stores `dueDate` as string; other parts of the app expect `dueDate` as Date type in the model.
Impact: Developers might pass `dueDate` as a Date object, resulting in unexpected serialization and invalid form controls.
Suggested Documentation: Clarify that `TaskForm` expects `initialData.dueDate` as an ISO date string (`YYYY-MM-DD`) and that the `onSubmit` data is a `TaskFormData` type where `dueDate` is a string.
Placement: In `src/components/TaskForm.tsx` above the `TaskFormProps` interface and in the component header.

---

15) Target: src/components/TaskFilter.tsx — debounce search behavior and filter types
Issue: No documentation for expected search debounce behavior or `setFilter` type expectations; `setFilter` casts status to `any` in some places.
Context: `handleSearchChange` uses `debounce` with 300ms; `setFilter` receives partial filter objects.
Impact: If `debounce` changes or is used incorrectly, UX may be laggy or search may not respond; casting `status` to `any` hides type mismatches.
Suggested Documentation: Add explanation that `TaskFilter` uses debounced search to update the global filter with `setFilter` and the expected types for `status`, `priority`, and `projectId`. Also mention where to change debounce duration.
Placement: At the top of `src/components/TaskFilter.tsx` and the `handleSearchChange` definition.

---

16) Target: src/utils/api.ts — 401 handling & environment variable
Issue: The request and response interceptors' behavior is not documented (authorization and redirect on 401). The application expects `VITE_API_URL` or defaults to `http://localhost:3001/api`.
Context: Interceptors automatically set `Authorization` header from localStorage, and navigate to `/login` on 401.
Impact: This implicit global side-effect can cause unexpected UI behavior if someone else updates the login flow; other developers may not realize how to switch to a mock API or disable this behavior.
Suggested Documentation: Document that all requests automatically include `Authorization` if present; a 401 triggers client-side token removal and navigation to `/login`. Outline how to change `VITE_API_URL` and how to add token retrieval (e.g., from Redux or context).
Placement: At top of `src/utils/api.ts`, and comment above each interceptor.

---

17) Target: src/pages/Dashboard.tsx — `handleSubmit` transformation logic
Issue: No doc describing conversion from `TaskFormData` to the `Task` shape used by the store (`dueDate` string to Date conversion).
Context: `handleSubmit` creates a `Task` via `addTask` by mapping `dueDate` to `new Date(data.dueDate)`.
Impact: Developers who call `addTask` directly may not know to convert `dueDate` string to Date; inconsistent shapes between UI and store.
Suggested Documentation: Document conversions performed by the `Dashboard` and note that store expects `Date` types; recommend a helper or consistent transformation layer.
Placement: Above `handleSubmit` in `src/pages/Dashboard.tsx`.

---

18) Target: src/pages/ProjectView.tsx — progress and stat calculations
Issue: No doc describing how `progress` is calculated or how tasks are pulled for the current project.
Context: `progress` uses fraction `completedCount / totalCount`.
Impact: Designers or backend developers may be confused about whether `progress` considers overdue tasks, blocked tasks, or tasks not assigned to the project.
Suggested Documentation: Document that `progress` equals completed tasks divided by total tasks in the project, and that `getTasksByProject` filters by `projectId` only.
Placement: Above relevant calculations in `src/pages/ProjectView.tsx`.

---

19) Target: src/components/Layout.tsx — route link behavior and stats rendering
Issue: No documentation describing `getTaskStatistics` expectations or `isActive` path check behaviors.
Context: `Layout` uses `getTaskStatistics()` and checks `location.pathname` equality for `isActive`.
Impact: Unclear that `isActive` uses exact equality vs route match (no path matching library used), and that stats reflect global store states.
Suggested Documentation: Document that `isActive` uses exact path matching and recommend using `NavLink` from `react-router-dom` if route matching is needed; document `getTaskStatistics` fields and that layout displays only global stats.
Placement: Above `Layout` component in `src/components/Layout.tsx`.

---

20) Target: src/pages/TaskDetail.tsx — `handleUpdate` mapping
Issue: No documentation noting that the `TaskForm` `initialData.dueDate` is constructed using `toISOString().split('T')[0]`.
Context: `TaskForm` `initialData.dueDate` is string `YYYY-MM-DD` which the UI expects.
Impact: A developer providing `initialData` directly or customizing the form may pass `Date` object rather than string, breaking input format.
Suggested Documentation: Document conversion behavior and the reason for `YYYY-MM-DD` formatting.
Placement: Above `TaskForm` usage in `src/pages/TaskDetail.tsx`.

---

21) Target: src/utils/helpers.ts — `validateTaskData` timezone handling
Issue: No documentation about timezone normalization used when validating due dates.
Context: `validateTaskData` checks `data.dueDate && new Date(data.dueDate) < new Date()`.
Impact: Date comparisons can break for users in some timezones; tests might fail around midnight.
Suggested Documentation: Explain that validation uses local time, mention how to normalize input (UTC vs local), and either normalize in the function or require callers to pass normalized values.
Placement: Above `validateTaskData` in `src/utils/helpers.ts`.

---

22) Target: src/utils/api.ts — 401 redirect path inconsistency
Issue: The API client redirects to `/login` on 401 but `App.tsx` does not have a `/login` route configured.
Context: Interceptor calls `window.location.href = '/login'` on 401.
Impact: Requests returning 401 may redirect to a route that doesn't exist in the application, resulting in blank page or missing UX around authentication flow.
Suggested Documentation: Document that the API client uses `/login` as the redirect on 401; also either add a `/login` route or document how to adapt the interceptor to the app's auth flow (e.g., use a context with an auth handler instead of direct redirect).
Placement: Comment above the response interceptor in `src/utils/api.ts` and in the README under "Authentication & API" section.

---

23) Target: src/store/TaskStore.tsx — `addTask` defaulting behavior
Issue: No documentation describing default values added for a new task (new `id`, `createdAt`, computed `priority` and `estimatedCompletion`).
Context: `addTask` uses `generateId()`, `new Date()`, `calculatePriority`, and `estimateCompletion` to fill missing fields.
Impact: Callers may pass incomplete fields and not realize the store will auto-populate them; this may lead to duplicated logic on the UI or inconsistent expectations when comparing persisted data with in-memory representation.
Suggested Documentation: Document defaulting rules: `id` uses `generateId()`, `createdAt` and `updatedAt` are set to current date, `priority` may be assigned by `calculatePriority` if not passed, and `estimatedCompletion` uses `estimateCompletion` if not provided. Also mention the types expected for date fields and any conversion that happens on `addTask`.
Placement: Above `addTask` method in `src/store/TaskStore.tsx`.


---

21) Target: src/utils/helpers.ts — `validateTaskData` edge cases
Issue: `validateTaskData` checks `dueDate` against `new Date()` without specifying timezone normalization.
Context: A server (or developer) may provide a dueDate parsed in UTC vs local timezone.
Impact: Validations may fail around midnight or for users in different timezones.
Suggested Documentation: Document expected timezone behavior and, if necessary, normalize input dates before checking `new Date()`.
Placement: Above `validateTaskData` implementation in `src/utils/helpers.ts`.

---

Recommended Next Steps
- Add README.md file to project root (see top-level entry) and link to docs for each module.
- Add TSDoc/JSdoc comments to all public API surfaces (store API, util functions, API methods, exported components) and include a short developer guide.
- Add a short `CONTRIBUTING.md` and `ARCHITECTURE.md` covering app flow, state management, and component tree or link to README.

End of report.
