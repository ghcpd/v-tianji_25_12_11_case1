Title: Missing Documentation Detection

Description: Analyze the full project source code to identify all missing documentation, explain the impact, provide suggested documentation for each item, and write all structured results into a file.


Summary
-------
This report lists missing or incomplete documentation items that affect maintainability, onboarding, and developer understanding. Each entry includes: Target, Issue, Context (code excerpt), Impact, Suggested Documentation (a short paragraph you can paste), and Placement (where to add it).


1) Target: Project root - README.md (module)
Issue: No README or project-level documentation exists.

Context:
```
// project root files:
index.html
package.json
vite.config.ts
src/
```

Impact: New contributors lack basic setup instructions, development and build workflows, environment variables, architectural overview, and expectations (e.g., auth). Onboarding time and setup errors increase; CI/automation and contributors may have inconsistent environments.

Suggested Documentation:
Add a README.md that includes: quick project description, prerequisites (Node.js version), setup steps (npm install), dev command (npm run dev), build (npm run build), preview (npm run preview), required environment variables (VITE_API_URL), where the API auth token is expected (localStorage key 'authToken'), and links to architecture and API docs. Also include where to find and run tests (none currently) and contribution guidelines.

Placement: Create README.md at project root (c:\...\v-tianji_25_12_11_case1\README.md).


2) Target: Project root - ARCHITECTURE.md (module)
Issue: No high-level architecture or data-flow documentation.

Context:
```
// Observed technologies in codebase
- Vite (vite.config.ts)
- React (react, react-dom)
- react-router-dom (routes in src/App.tsx)
- zustand (src/store/TaskStore.tsx)
- axios (src/utils/api.ts)
- date-fns (src/utils/helpers.ts)
```

Impact: Developers cannot quickly reason about responsibilities, where to make changes, or how data flows (UI -> state -> API). This increases risk of architectural drift and incorrect modifications.

Suggested Documentation:
Add an ARCHITECTURE.md that explains the high-level architecture: UI layer (React + components/ pages), routing (react-router-dom; routes in src/App.tsx), state management (Zustand store in src/store/TaskStore.tsx exposed via TaskProvider/useTasks), API layer (axios client in src/utils/api.ts with VITE_API_URL and auth via localStorage 'authToken'), helpers (src/utils), types (src/types), and build tooling (Vite + TypeScript). Include a data-flow diagram (textual or ASCII) showing component -> store -> api interactions and where dates are serialized/deserialized.

Placement: Create docs/ARCHITECTURE.md or ARCHITECTURE.md at project root.


3) Target: src/types/index.ts - module
Issue: No module-level documentation describing domain model semantics and important type quirks (e.g., Task.dueDate is Date while TaskFormData.dueDate is string).

Context:
```ts
export interface Task {
  id: string
  title: string
  // ...
  dueDate?: Date
  // ...
}

export interface TaskFormData {
  title: string
  // ...
  dueDate: string
  // ...
}
```

Impact: Developers may be confused about when dates are Date objects vs. ISO string form values (form vs. model vs. API). This can cause bugs when mapping form data to state or API payloads.

Suggested Documentation:
Add a header comment at the top of src/types/index.ts that explains the domain model: describe Task fields and their semantics (e.g., dueDate is stored as a Date object in state and model; TaskFormData uses a date string because it is tied to HTML input type="date" — format YYYY-MM-DD). Note which types are consumed by the store, the API clients, and components. Call out unused or legacy types (TaskStatus is declared but not currently used) and whether removing or using them is intended.

Placement: Top of src/types/index.ts as a module comment block (3-6 lines).


4) Target: src/utils/helpers.ts - generateId()
Issue: No documentation for generateId() and its limitations (non-cryptographic, potential collisions, predictable component).

Context:
```ts
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
```

Impact: New developers may assume IDs are UUIDs or collision-resistant. Without documentation, misuse in distributed or persisted contexts may cause ID collisions or debugging overhead.

Suggested Documentation:
Add a JSDoc for generateId(): explain it returns a best-effort unique string based on timestamp + random suffix, that it is not a cryptographically secure UUID, and for systems requiring guaranteed uniqueness (e.g., server persistence or multi-client sync) a proper UUID or server-generated ID should be used.

Placement: Above generateId() in src/utils/helpers.ts as JSDoc.


5) Target: src/utils/helpers.ts - calculatePriority()
Issue: No explanation of the priority algorithm and the meaning of urgencyScore.

Context:
```ts
export function calculatePriority(dueDate?: Date, complexity: number = 1): Priority {
  if (!dueDate) return 'low'
  
  const daysUntilDue = differenceInDays(new Date(dueDate), new Date())
  const urgencyScore = daysUntilDue * complexity

  if (urgencyScore <= 2) return 'urgent'
  if (urgencyScore <= 7) return 'high'
  if (urgencyScore <= 14) return 'medium'
  return 'low'
}
```

Impact: The heuristic uses daysUntilDue * complexity producing smaller urgencyScore for near-due items (because daysUntilDue is small) — the formula and thresholds are non-obvious. Without doc, changing thresholds or complexity weighting could break expected behavior.

Suggested Documentation:
Add JSDoc describing the heuristic: compute days until due (differenceInDays), multiply by complexity to obtain an "urgencyScore" where lower values are higher urgency (close due date and/or high complexity). List threshold boundaries and rationale (<=2 urgent, <=7 high, <=14 medium). Note that negative days (past due) will produce negative urgencyScore and therefore 'urgent'.

Placement: Above calculatePriority() in src/utils/helpers.ts.


6) Target: src/utils/helpers.ts - estimateCompletion()
Issue: No documentation for estimateCompletion() randomness and meaning of returned Date.

Context:
```ts
export function estimateCompletion(complexity: number): Date {
  const baseDays = complexity * 2
  const variance = Math.floor(Math.random() * 3)
  return addDays(new Date(), baseDays + variance)
}
```

Impact: The function returns a randomized estimate for completion; without doc, callers may assume deterministic behavior and mistakenly rely on repeated calls producing same results. This affects reproducibility and testing.

Suggested Documentation:
Add JSDoc clarifying that estimateCompletion returns a noisy estimate of a completion date based on complexity (baseDays = complexity * 2) plus a small random variance of 0-2 days. State that the result is non-deterministic and intended for initial estimates only; for deterministic testing, mock or override this helper.

Placement: Above estimateCompletion() in src/utils/helpers.ts.


7) Target: src/utils/helpers.ts - formatRelativeDate()
Issue: No doc explaining how relative dates are determined (sign conventions and outputs like "In X days" vs "X days overdue").

Context:
```ts
export function formatRelativeDate(date: Date): string {
  const days = differenceInDays(date, new Date())
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days <= 7) return `In ${days} days`
  return formatTaskDate(date)
}
```

Impact: The sign of differenceInDays and exact returned strings are used in UI and tests; without docs, localization, edge cases (time zones), and how equality is computed are unclear.

Suggested Documentation:
Add JSDoc explaining that differenceInDays is computed relative to now, negative means past due and returns "X days overdue"; 0 returns "Today", 1 returns "Tomorrow", 2-7 returns "In X days", otherwise falls back to formatted date. Note timezone sensitivity and that testing should freeze time when validating behavior.

Placement: Above formatRelativeDate() in src/utils/helpers.ts.


8) Target: src/utils/helpers.ts - debounce() and throttle()
Issue: No documentation for behavior, returned function semantics, or NodeJS.Timeout typing which may not match browser timer types.

Context:
```ts
let timeout: NodeJS.Timeout | null = null
// ...
timeout = setTimeout(later, wait)
```

Impact: The use of NodeJS.Timeout in a browser context can cause TypeScript type mismatch or confusion. Lack of doc about leading/trailing invocation and cancellation makes it unclear for contributors to use correctly.

Suggested Documentation:
Add JSDoc for debounce() and throttle() describing: behavior (debounce delays invocation until wait ms after last call), returned function signature, how to cancel (none currently), and that timeout uses a platform timer. Recommend using window.setTimeout return type number for browser projects or provide a cross-env type. Optionally add a small example of usage and mention that throttle allows one call every limit ms.

Placement: Above debounce() and throttle() in src/utils/helpers.ts.


9) Target: src/utils/helpers.ts - sortTasks()
Issue: No documentation for sorting directions and expected sortBy values.

Context:
```ts
case 'priority':
  return sorted.sort((a, b) => 
    getPriorityWeight(b.priority) - getPriorityWeight(a.priority)
  )
case 'date':
  return sorted.sort((a, b) => {
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0
    return dateB - dateA
  })
```

Impact: The 'date' case sorts by descending timestamp (newest due first). This is non-obvious; new contributors may invert sort direction accidentally. Lack of doc may lead to inconsistent UX.

Suggested Documentation:
Add JSDoc describing supported sortBy values ('priority' | 'date' | 'title' | 'complexity'), sort directions (e.g., priority: highest first; date: latest/closest due first), and tie-breaking behavior. Note that date uses timestamp and that tasks without dueDate are treated as 0 (appear at end for descending order).

Placement: Above sortTasks() in src/utils/helpers.ts.


10) Target: src/utils/api.ts - module and exported functions (fetchTasks, createTask, updateTask, etc.)
Issue: No documentation on API client configuration, environment variable, request/response transforms, interceptors, and exported function contracts.

Context:
```ts
const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('authToken')
    window.location.href = '/login'
  }
  return Promise.reject(error)
})
```

Impact: Developers can't safely call createTask/updateTask without knowing expected shapes (dates must be serialized), or how auth and error handling works. The 401 redirect to '/login' is not obviously compatible with this app (no login route implemented) — this could cause silent redirects in unexpected environments.

Suggested Documentation:
Add module-level docs describing:
- How baseURL is selected (VITE_API_URL env var fallback)
- The auth token key used in localStorage ('authToken') and expected lifecycle
- 401 handling behavior (clear token and redirect to /login)
- Data transforms: outgoing functions transform Date -> ISO string; incoming responses convert date strings to Date objects (dueDate, createdAt, updatedAt, estimatedCompletion). Enumerate the function signatures and expected parameter shapes: createTask expects Omit<Task, 'id'|'createdAt'|'updatedAt'> (dueDate as Date), updateTask partial Task, etc. Mention errors are forwarded as rejected promises.

Placement: Top of src/utils/api.ts as module comment + JSDoc for each exported function.


11) Target: src/store/TaskStore.tsx - module and store API (TaskProvider, useTasks, addTask, updateTask, filters)
Issue: No documentation describing the store's responsibilities, lifecycle, data invariants (Task model), and behavior of core methods (particularly side effects like priority/estimatedCompletion assignment in addTask).

Context:
```ts
addTask: (taskData) => {
  const newTask: Task = {
    ...taskData,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    priority: taskData.priority || calculatePriority(taskData.dueDate, taskData.complexity || 1),
    estimatedCompletion: taskData.estimatedCompletion || estimateCompletion(taskData.complexity || 1)
  }
  set((state) => ({ tasks: [...state.tasks, newTask] }))
},

getFilteredTasks: () => {
  const { tasks, filters } = get()
  return tasks.filter((task) => {
    if (filters.status !== 'all' && task.completed !== (filters.status === 'completed')) {
      return false
    }
    // ...
  })
}
```

Impact: Without documentation, callers may be surprised that addTask will compute priority/estimatedCompletion when omitted. Tests and API integrations may pass strings for dueDate; types and runtime expectations are not explicit. The filter semantics (status mapping) and search logic are implicit.

Suggested Documentation:
Add module-level documentation describing the store as the single source of truth for tasks and projects, that it uses Zustand and exposes a React Context wrapper TaskProvider and a hook useTasks(). For each public method add concise JSDoc: addTask will create id/createdAt/updatedAt, derive priority if omitted using calculatePriority(dueDate, complexity) and set estimatedCompletion when omitted. updateTask merges changes and updates updatedAt. getFilteredTasks implements filters with semantics: status 'completed' means completed===true, 'pending' means false; searchQuery checks title, description, and tags (case-insensitive). Note that dueDate fields in tasks are Date objects.

Placement: Top of src/store/TaskStore.tsx and JSDoc above each exported function within the store.


12) Target: src/store/TaskStore.tsx - error condition in useTasks hook
Issue: The useTasks hook throws a runtime Error string when used outside TaskProvider but it lacks a recommended remediation message.

Context:
```ts
if (!context) {
  throw new Error('useTasks must be used within TaskProvider')
}
```

Impact: The thrown error is fine but adding a recommended remediation message (e.g., wrap app with TaskProvider in App.tsx) would help newcomers debug quickly.

Suggested Documentation:
Add a short JSDoc near useTasks explaining the required provider pattern and example usage (show wrapping App with <TaskProvider> in src/App.tsx).

Placement: Above useTasks export and in README example usage.


13) Target: src/components/TaskForm.tsx - component props, expected date string format, and validation behavior
Issue: No JSDoc describing onSubmit payload shape, expected dueDate format for initialData and returned form values, and how the component resets state after submit.

Context:
```tsx
interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void
  initialData?: Partial<TaskFormData>
  projects: Array<{ id: string; name: string }>
}

// handleSubmit maps validateTaskData and then calls onSubmit(formData)
```

Impact: Callers and future maintainers may be unsure what dueDate string format is (YYYY-MM-DD vs ISO), what fields are nullable, and that the component clears the form on success. This can cause mismatches in how Dashboard and TaskDetail map form data to Task model.

Suggested Documentation:
Add JSDoc above TaskForm component: describe props, shape of TaskFormData (title, description, priority, dueDate as YYYY-MM-DD string from <input type="date">), that onSubmit receives TaskFormData with dueDate as an empty string or YYYY-MM-DD, and the component runs validateTaskData() (list validation rules) and resets the form to empty default after successful submit.

Placement: Above the TaskForm component in src/components/TaskForm.tsx.


14) Target: src/components/TaskCard.tsx - component props and isOverdue logic
Issue: Missing documentation for TaskCard props and the isOverdue computation.

Context:
```tsx
const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
```

Impact: It’s not explicit that dueDate may be a Date or string; the comparison uses new Date(task.dueDate) which can mask type issues. Developers may be unsure whether timezone or time-of-day affects when a task is considered overdue.

Suggested Documentation:
Add JSDoc for TaskCard props and a short note for isOverdue: it evaluates true if dueDate exists, is strictly earlier than now, and task is not completed. Recommend standardizing dueDate as Date object in state and explain timezone implications for late/early classification.

Placement: Above TaskCard component in src/components/TaskCard.tsx.


15) Target: src/components/TaskFilter.tsx - module/component documentation
Issue: No docs for filter semantics, debounce usage, and possible accessibility notes.

Context:
```tsx
const { filters, projects, setFilter } = useTasks()

const handleSearchChange = debounce((value: string) => {
  setFilter({ searchQuery: value })
}, 300)
```

Impact: Ambiguity about debounce implementation details, filter default values, and whether filtering is client side only. New developers may modify debounce or filter logic without understanding UX trade-offs.

Suggested Documentation:
Add a small comment describing: this component reads filters and projects from useTasks() and updates the global store via setFilter; search input is debounced by 300ms to avoid rapid state updates; filter keys and accepted values: status ('all'|'pending'|'completed'), priority ('all'|Priority), projectId (string|null), searchQuery (string). Mention accessibility notes (label associations already present).

Placement: Above TaskFilter component in src/components/TaskFilter.tsx.


16) Target: src/components/Layout.tsx - module-level doc for nav and stats
Issue: No documentation describing where stats come from and nav assumptions.

Context:
```tsx
const { getTaskStatistics } = useTasks()
const stats = getTaskStatistics()

// nav shows Total, Pending, Completed, Overdue
```

Impact: It is unclear whether getTaskStatistics triggers expensive calculations, whether stats are cached, or how overdue is computed. This matters for performance tuning.

Suggested Documentation:
Add a short module comment: Layout renders top navigation and calls getTaskStatistics() from the store to display aggregated counts; getTaskStatistics computes totals based on in-memory tasks and compares dueDate to current time to mark overdue items. Note that getTaskStatistics is synchronous and derived from the store.

Placement: Above Layout component in src/components/Layout.tsx.


17) Target: src/pages/Dashboard.tsx - handleSubmit mapping & sort options
Issue: No documentation describing how TaskForm output is normalized to Task model and what sort options do.

Context:
```tsx
const handleSubmit = (data: any) => {
  addTask({
    title: data.title,
    description: data.description,
    completed: false,
    priority: data.priority,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    projectId: data.projectId || undefined,
    tags: data.tags,
    complexity: data.complexity,
    assignee: data.assignee || undefined
  })
}

const [sortBy, setSortBy] = useState<SortOption>('priority')
```

Impact: Mapping of dueDate from string to Date is implicit here. New contributors may not realize the dashboard converts format and that addTask expects a Date. Sort options semantics (priority default) are not documented.

Suggested Documentation:
Add an inline comment/JSDoc describing the normalization: TaskForm yields dueDate as YYYY-MM-DD string; Dashboard converts it to Date when calling addTask. Document default sort ('priority') and available SortOption values and their meaning/direction.

Placement: Above Dashboard component in src/pages/Dashboard.tsx.


18) Target: src/pages/TaskDetail.tsx - duplicated getPriorityColor and missing note
Issue: getPriorityColor is re-implemented locally in TaskDetail.tsx while utils/helpers.ts also exports getPriorityColor. No documentation explains why a local copy exists.

Context:
```tsx
// bottom of file
function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: '#6b7280',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444'
  }
  return colors[priority] || '#6b7280'
}
```

Impact: Duplicate logic can drift out of sync; minor color differences or logic changes in helpers.ts won't reflect here. This makes maintenance error-prone.

Suggested Documentation:
Either replace local function with import from src/utils/helpers.ts (preferred) or add a comment explaining why duplication was intentional (e.g., local override for theme-specific colors). If kept, add a JSDoc indicating this duplication and how to keep it synchronized with the helper.

Placement: Above the local getPriorityColor in src/pages/TaskDetail.tsx (or replace with import and document in helpers.ts).


19) Target: src/pages/ProjectView.tsx - progress calculation
Issue: No documentation for progress calculation semantics or rounding.

Context:
```tsx
const completedCount = sortedTasks.filter((t) => t.completed).length
const totalCount = sortedTasks.length
const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
```

Impact: The progress is a raw percentage; it’s not clear whether it should be rounded, truncated, or how partial completions or weightings (complexity) should affect progress.

Suggested Documentation:
Add an inline comment describing the progress metric as "simple task completion percentage (completed tasks / total tasks) * 100" and that it is rounded when displayed (Math.round used later). If a weighted progress by complexity is desired, document that current implementation is unweighted.

Placement: Above the calculation in src/pages/ProjectView.tsx.


20) Target: src/utils/api.ts - transformTaskToApi/FromApi corner cases (date conversion)
Issue: No documentation explaining how date fields are serialized and what fields are optional; also transformTaskToApi will call .toISOString() on undefined if not checked thoroughly.

Context:
```ts
function transformTaskToApi(task: any): any {
  return {
    ...task,
    dueDate: task.dueDate?.toISOString(),
    createdAt: task.createdAt?.toISOString(),
    updatedAt: task.updatedAt?.toISOString(),
    estimatedCompletion: task.estimatedCompletion?.toISOString()
  }
}
```

Impact: If callers pass strings instead of Date objects, .toISOString may fail at runtime. Lack of doc on expected input types may cause subtle bugs.

Suggested Documentation:
Document that transformTaskToApi expects Date objects for date fields and will convert them to ISO strings; callers must ensure data normalization before calling the API functions. Optionally add defensive conversion (e.g., if string, attempt to parse) or validate input with clear error messages.

Placement: Above transformTaskToApi() and transformTaskFromApi() in src/utils/api.ts.


21) Target: Public API surface list
Issue: No consolidated API docs for public exports — helpers, api, store, and component prop contracts.

Context:
- src/utils/api.ts exports fetchTasks, fetchTaskById, createTask, updateTask, deleteTask, fetchProjects, createProject
- src/utils/helpers.ts exports many utility functions
- src/store/TaskStore.tsx exports TaskProvider and useTasks and the store API
- components export default React components used in pages

Impact: Library-like public surfaces are undocumented; new consumers or integrators cannot easily discover function signatures, return types, or side effects.

Suggested Documentation:
Create a docs/API.md or add an "API" section in README that lists all public modules (src/utils/api.ts, src/utils/helpers.ts, src/store/TaskStore.tsx) with short signatures, descriptions, expected parameter shapes, return types, and notable side effects (e.g., API transforms dates, store modifies added tasks). Provide example usage snippets for each public function/hook.

Placement: docs/API.md and short cross-references in README.md.


22) Target: Environment and secrets - VITE_API_URL and authToken usage
Issue: No documentation describing required environment variables and auth token lifecycle.

Context:
```ts
baseURL: process.env.VITE_API_URL || 'http://localhost:3001/api'
// request interceptor uses localStorage.getItem('authToken')
// response interceptor on 401: localStorage.removeItem('authToken'); window.location.href = '/login'
```

Impact: Devs may not know how to run backend or how to populate auth tokens. The redirect to /login is surprising since the app doesn't implement a login page in the codebase, causing confusing redirects in development.

Suggested Documentation:
Add a section in README describing environment variables (VITE_API_URL) and authentication expectations: which localStorage key is read ('authToken'), expected token format (JWT Bearer), and recommended local development steps (e.g., stub a token in localStorage or run a mock API). Note the 401 behavior and how to change it if authentication flow differs.

Placement: README.md (Environment / Configuration section) and docs/ARCHITECTURE.md.


23) Target: Tests - missing test documentation and presence of no tests
Issue: No tests exist and there is no guidance on testing strategy or how to add unit/integration tests.

Context:
```
// repository contains no test/ or __tests__ directories; package.json has no test script
"scripts": { "dev": "vite", "build": "tsc && vite build", "preview": "vite preview" }
```

Impact: Lack of tests and guidance increases regression risk. New contributors may be uncertain how to validate changes or what the recommended testing stack is (Jest, React Testing Library, Cypress).

Suggested Documentation:
Add a Testing section in README that documents the current lack of tests, recommended frameworks (e.g., Jest + React Testing Library for unit tests, Cypress for E2E), and example commands to run tests once they are added. Optionally include a small starter test file example for a core pure function (e.g., calculatePriority).

Placement: README.md under "Testing" or docs/TESTING.md.


24) Target: Miscellaneous code comments - TODOs and explanation of edge-case handling
Issue: Several areas perform non-obvious conversions or decisions without inline comments (e.g., Dashboard & TaskDetail converting date strings, TaskStore filter logic treating 'all' vs specific statuses, API 401 flow). There are no "why" explanations.

Context:
- Dashboard: new Date(data.dueDate)
- TaskDetail: toISOString().split('T')[0] when constructing initialData for TaskForm
- TaskStore: filters.status check uses task.completed !== (filters.status === 'completed')

Impact: Lack of "why" commentary increases the chance future refactors break UX or semantics.

Suggested Documentation:
Add short inline comments near these lines explaining the reason for the conversion or the chosen logic (e.g., converting Date to YYYY-MM-DD for HTML date input, using boolean comparison for status mapping to keep filter simple). When code is intentionally simplified, note tradeoffs and where to extend (e.g., add 'in-progress' handling).

Placement: Inline comments next to the code occurrences in their respective files (Dashboard.tsx, TaskDetail.tsx, TaskStore.tsx).


Recommended next steps (practical)
------------------------------
1. Add README.md with sections: Overview, Quickstart, Environment Variables, Development, Build, Testing, Architecture links, API summary, Contributing, License.
2. Add docs/ARCHITECTURE.md summarizing data flow and stack.
3. Add docs/API.md with signatures and side effects for public modules (src/utils/api.ts, src/store/TaskStore.tsx, src/utils/helpers.ts).
4. Add JSDoc comments for all exported functions in utils and store (helpers, api, TaskStore). Prioritize calculatePriority, estimateCompletion, generateId, transformTaskToApi/fromApi, addTask, getFilteredTasks.
5. Replace duplicated getPriorityColor in TaskDetail.tsx with import from helpers (or document why duplicated).
6. Add small example tests for deterministic parts (calculatePriority, sortTasks) and document testing strategy in README.


Appendix: Quick copy-paste doc snippets
-------------------------------------
Below are short doc snippets you can paste into files. Use them as base text and adjust tone/style as needed.

- README.md header snippet:
```
# Task Manager

A lightweight task management SPA built with React, Vite, TypeScript, Zustand, and Axios. This repository contains the frontend app that manages tasks and projects and integrates with a REST API (configurable via VITE_API_URL).

## Quickstart
1. Install dependencies: npm install
2. Run dev server: npm run dev
3. Build: npm run build

## Environment
- VITE_API_URL: base URL for API (default: http://localhost:3001/api)
- The frontend reads an auth token from localStorage key `authToken` and attaches it as a Bearer token to API requests.
```

- Example JSDoc for calculatePriority (paste above function):
```
/**
 * Calculate a priority level based on due date and complexity.
 * The algorithm computes daysUntilDue * complexity to form an "urgencyScore".
 * Lower scores indicate higher urgency. Thresholds:
 * - urgencyScore <= 2 => 'urgent'
 * - urgencyScore <= 7 => 'high'
 * - urgencyScore <= 14 => 'medium'
 * - otherwise => 'low'
 * Note: negative daysUntilDue (past due) yields 'urgent'.
 */
```

- Example JSDoc for API client top (src/utils/api.ts):
```
/**
 * Axios API client wrapper for backend interactions.
 * - baseURL: controlled by VITE_API_URL env var (falls back to http://localhost:3001/api)
 * - Auth: reads JWT from localStorage key 'authToken' and attaches Authorization header
 * - 401 handling: the client clears authToken and redirects to /login by default
 * - All exported functions transform Date objects to ISO strings when sending to the API
 */
```


End of report.
