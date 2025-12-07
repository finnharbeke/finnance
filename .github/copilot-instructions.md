# Finnance AI Coding Guidelines

## Project Overview
Finnance is a full-stack financial transaction management app with a Flask/SQLAlchemy backend and React/TypeScript frontend. It tracks accounts, transactions, categories, and provides data visualization (Nivo charts). Multi-currency and multi-user support.

**Stack**: Python 3.10 (Flask, SQLAlchemy), TypeScript/React 18 (Mantine UI, Nivo), MariaDB/SQLite, Docker.

---

## Architecture Patterns

### Backend Structure (`backend/finnance/`)
- **Modular blueprints**: Each domain (accounts, transactions, categories, nivo, etc.) is a separate Flask blueprint under `/finnance/{domain}/{domain}.py`
- **Shared models**: `models.py` defines SQLAlchemy ORM entities with a custom `JSONModel` base class
- **Decorators for validation**: Use `@validate(schema)` for JSON schema validation (see `errors.py`)
- **Request wrappers**: `@nivo_wrapper` and `@is_expense_wrapper` standardize parameter extraction (example: `nivo.py` line 13-45)

### Data Flow & Key Models
1. **User** → owns **Accounts** (with Currency, color, order)
2. **Account** contains **Transactions** (date_issued, comment) → contains **Records** (amount, category, agent)
3. **Category** and **Agent** are hierarchical groupings for expense/income classification
4. **Currency** defines decimal precision for monetary values
5. **Nivo routes** aggregate Records/Transactions for visualization (sunburst, line, bars, etc.)

### Frontend Architecture (`frontend/src/`)
- **React Router**: Authenticated routes use `<AuthRoute>` wrapper; layout split between `AuthLayout` (sidebar) and `PublicLayout` (header only)
- **React Query**: Centralized `query.ts` with error handling via `handleAxiosError` and `queryClient` defaults
- **Mantine UI**: Core component library with custom theme in `theme.tsx`
- **Component organization**: `/components/{domain}/` mirrors backend structure; type definitions in `/types/`
- **Modal provider**: Context-based modal state in `contexts/ModalProvider.tsx`

---

## Critical Development Workflows

### Setup & Running

**Backend** (from `/backend`):
```bash
conda env create -n finnance --file environment.yml
conda activate finnance
flask run --debug  # SQLite by default; MariaDB via env vars in production
```

**Frontend** (from `/frontend`):
```bash
npm i
npm start  # Proxy to http://127.0.0.1:5000 (see package.json)
```

**Docker Compose** (production):
```bash
docker-compose up  # Requires .env with DB credentials
```

**Test credentials**: username `test`, password `123456` (hardcoded in README; update in production)

### Database
- **Dev**: SQLite (`app.db`) via `SQLALCHEMY_DATABASE_URI` in `config.py`
- **Prod**: MariaDB with env vars: `MARIADB_ROOT_PASSWORD`, `MARIADB_DATABASE`, `DB_HOST`
- **Auto-init**: `db.create_all()` called on app startup (`__init__.py` line 29)

### Debugging
- Flask debug mode: `flask run --debug` (auto-reload, interactive debugger)
- Frontend: `npm test` for unit tests; browser DevTools for React/query inspection
- Query caching: React Query caches by key (e.g., `["nivo", "categories", props]`)

---

## Project-Specific Conventions

### Backend Patterns

**1. JSON Serialization**
- Models inherit `JSONModel` with custom `json(deep=bool)` method
- `deep=True` includes related objects; `deep=False` shallow only
- Use `api()` method to return Flask response: `return model.api()`
- Example: `Account.json(deep=True)` includes nested Transactions and Records

**2. Request Parameter Handling**
- Query params extracted via decorators (not passed as args)
- Example (`nivo.py`):
  ```python
  @nivo.route("/sunburst")
  @login_required
  @nivo_wrapper  # extracts currency_id, min_date, max_date from request.args
  @is_expense_wrapper  # adds is_expense from request.args
  def sunburst(currency: Currency, is_expense: bool, min_date: datetime, max_date: datetime):
  ```

**3. Error Handling**
- Custom `APIError` with HTTPStatus and message (see `errors.py`)
- Validation errors caught by `@validate` decorator and returned as 400 Bad Request
- Example: `raise APIError(HTTPStatus.BAD_REQUEST, "invalid currency_id")`

**4. Database Queries**
- Use SQLAlchemy ORM; join patterns in `nivo.py` for aggregate queries
- Example: `Record.query.join(Transaction).filter_by(user_id=...).with_entities(func.sum(amount))`
- Multi-join pattern for hierarchical filtering (Records → Transactions → Categories)

### Frontend Patterns

**1. React Query Hooks**
- Custom hooks in `/types/{Domain}.ts` wrap `useQuery` with queryKey and queryFn
- Example (`types/Account.ts`):
  ```tsx
  export const useAccounts = () => useQuery({
      queryKey: ["accounts"],
      queryFn: () => getAxiosData(`/api/accounts`)
  });
  ```
- Error handling automatic via `queryClient` defaults

**2. Component Composition**
- **Page**: Fetches data via hooks, orchestrates layout
- **Domain component**: Renders data with Mantine + business logic (forms, modals)
- **OrderForm**: Reusable wrapper for sortable lists (see `OrderForm.tsx`)
  - Accepts `data` array, `cell` component, `orders` state, `onSubmit` callback

**3. Nivo Visualization Components** (e.g., `nivo/BalanceLine.tsx`)
- Use `NivoRequest` props: `{ currency_id, min_date, max_date }`
- Fetch via custom hook: `const query = useBalanceLineData(request)`
- Handle states: loading (show skeleton), error (show Placeholder), empty (show "no data found")
- Format data for Nivo (e.g., lines with id/color/data arrays)
- Include tooltip with `NivoTooltip` component

**4. Type Definitions**
- Place in `/types/{Domain}.ts` with interfaces and custom hooks
- Include API response types and useQuery/useMutation wrappers
- Example: `LineData` interface for chart data shape

**5. Form & Modal Patterns**
- Use Mantine Form (`@mantine/form`)
- Modal state via context: `useFinnanceModal()` from `ModalProvider`
- Mutations handled via `useMutation()` with `onSuccess`/`onError` callbacks

---

## Integration Points & Dependencies

### Backend → Frontend Communication
- **Base API**: `/api/*` routes (see `__init__.py` blueprint registration)
- **CORS enabled**: All origins for `/api/*` (see `__init__.py` line 18)
- **Error responses**: 400 (validation), 401 (auth), 500 (server)

### External Libraries
- **Mantine**: UI components, form handling, notifications, spotlight (command palette)
- **Nivo**: Chart rendering (ResponsiveLine, Sunburst, Bar, etc.)
- **React Query**: Server state caching and synchronization
- **Axios**: HTTP client with interceptors for error handling

### Query Key Naming Convention
Use hierarchical paths: `["domain", "action/type", "filters"]`
- Example: `["nivo", "categories", props]` for filtered nivo data
- Enables cache invalidation by path prefix

---

## Common Tasks

### Adding a New API Endpoint
1. Create route in `/backend/finnance/{domain}/{domain}.py`
2. Use decorators: `@login_required`, validation `@validate(schema)`, param extraction `@nivo_wrapper`
3. Return JSON via `jsonify()` or `model.api()`
4. Test error cases in handler

### Adding a Frontend Page
1. Create component in `/frontend/src/pages/{Page}.tsx`
2. Add route in `/routes/Router.tsx`
3. Create domain component in `/components/{domain}/`
4. Write custom hook in `/types/{Domain}.ts` for data fetching
5. Use Mantine components + React Query for state

### Adding a Nivo Chart
1. Backend: Create route in `backend/finnance/nivo/nivo.py` with `@nivo_wrapper`
2. Query aggregate data (Records/Transactions with joins/aggregations)
3. Frontend: Create component in `frontend/src/nivo/{Chart}.tsx`
4. Write `use{Chart}Data` hook; fetch via `getAxiosData`
5. Handle states (loading, error, empty); format data for Nivo
6. Add tab to `Monthly.tsx` or `Yearly.tsx` and wire in routes

---

## Gotchas & Best Practices

- **Decimal precision**: Always use `currency.decimals` when formatting amounts (see `BalanceLine.tsx` line 70)
- **User isolation**: Filter queries by `current_user.id` (security critical)
- **Date ranges**: Min/max dates from frontend as ISO strings; backend filters as `date_issued >= min_date` and `< max_date`
- **Null safety**: Check if aggregate query results are None before accessing `.sum` (see `nivo.py` line 343)
- **Component re-renders**: Use `useEffect` to sync query data to local state if mutations needed (see `BalanceLine.tsx` line 31)
- **Error messages**: User-facing validation errors in mutation callbacks; use `showNotification()` from Mantine
