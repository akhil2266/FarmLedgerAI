# API Documentation

Base URL (backend): `http://localhost:5000/api`
Base URL (AI service, internal only — not called by the frontend directly): `http://localhost:8000`

All backend endpoints (except `/auth/register`, `/auth/login`, `/auth/google`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`, `/health`) require:
```
Authorization: Bearer <accessToken>
```

All responses follow this envelope:
```json
{ "success": true, "message": "...", "data": { } }
```
Errors:
```json
{ "success": false, "message": "...", "errors": [ { "field": "email", "message": "..." } ] }
```

---

## Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register a new farmer or buyer. Body: `fullName, email, phone?, password, role?, state, district` |
| POST | `/login` | — | Body: `email, password` |
| POST | `/google` | — | Body: `idToken` (Google Sign-In ID token) |
| POST | `/refresh` | — | Body: `refreshToken` → returns new `accessToken` |
| POST | `/logout` | ✅ | Invalidates the stored refresh token |
| GET | `/me` | ✅ | Current user profile |
| PATCH | `/me` | ✅ | Update profile fields |
| POST | `/change-password` | ✅ | Body: `currentPassword, newPassword` |
| POST | `/forgot-password` | — | Body: `email` |
| POST | `/reset-password` | — | Body: `token, password` |

---

## Farms — `/api/farms`

| Method | Path | Description |
|---|---|---|
| POST | `/` | Create farm |
| GET | `/` | List current user's farms |
| GET | `/summary/stats` | Farm count + total acres |
| GET | `/:id` | Get one farm |
| PATCH | `/:id` | Update farm |
| DELETE | `/:id` | Soft-delete farm |
| GET | `/admin/all` | **Admin only.** All farms platform-wide |

---

## Crops — `/api/crops`

| Method | Path | Description |
|---|---|---|
| POST | `/` | Create crop cycle |
| GET | `/?farmId=&status=&season=&page=&limit=` | List crops (filterable) |
| GET | `/summary/crop-wise` | Profit aggregated per crop name |
| GET | `/:id` | Get one crop |
| PATCH | `/:id` | Update crop (status, actual yield, harvest date, etc.) |
| DELETE | `/:id` | Delete crop |

---

## Expenses — `/api/expenses` (multipart for create/update, field `receipt`)

| Method | Path | Description |
|---|---|---|
| POST | `/` | Create expense (optional receipt file) |
| GET | `/?farmId=&cropId=&category=&from=&to=&page=&limit=` | List expenses |
| GET | `/summary/breakdown?from=&to=` | Category-wise totals |
| GET | `/summary/monthly-trend?months=12` | Monthly totals |
| GET | `/:id` | Get one expense |
| PATCH | `/:id` | Update expense |
| DELETE | `/:id` | Delete expense |

---

## Sales — `/api/sales` (multipart for create/update, field `receipt` = invoice)

| Method | Path | Description |
|---|---|---|
| POST | `/` | Create sale |
| GET | `/?farmId=&cropId=&from=&to=&page=&limit=` | List sales |
| GET | `/summary/monthly-revenue?months=12` | Monthly revenue |
| GET | `/summary/yearly-revenue?years=5` | Yearly revenue |
| GET | `/:id` | Get one sale |
| PATCH | `/:id` | Update sale |
| DELETE | `/:id` | Delete sale |

---

## Dashboard — `/api/dashboard`

| Method | Path | Description |
|---|---|---|
| GET | `/overview` | KPI cards: total investment, revenue, net profit, ROI%, active farms/crops |
| GET | `/investment-trend?months=12` | Monthly expense series |
| GET | `/profit-trend?months=12` | Monthly revenue/expense/profit series |
| GET | `/expense-breakdown?from=&to=` | Category-wise pie chart data |
| GET | `/crop-wise-profit` | Profit per crop (bar chart) |
| GET | `/revenue?range=monthly\|yearly` | Revenue series |
| GET | `/roi-analysis` | ROI% per crop cycle (scatter chart) |

---

## AI — `/api/ai` (proxies to the FastAPI service, logs every result to MySQL)

| Method | Path | Description |
|---|---|---|
| POST | `/crop-recommendation` | Body: `farmId, nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall` |
| GET | `/crop-recommendation/history` | Past recommendations |
| POST | `/profit-prediction` | Body: `cropName, areaAcres, estimatedCost, soilType?, season?, state?` |
| GET | `/profit-prediction/history` | Past predictions |
| POST | `/price-prediction` | Body: `cropName, marketName?, state?, forecastHorizonDays?` |
| GET | `/price-prediction/history` | Past predictions |
| POST | `/disease-detection` | Multipart: `image` file, `cropName?` |
| GET | `/disease-detection/history` | Past detections |
| POST | `/financial-advisor` | No body — analyzes the caller's real expense/sale/crop data |
| GET | `/financial-advisor?isRead=&page=&limit=` | List saved advice |
| PATCH | `/financial-advisor/:id/read` | Mark advice as read |
| DELETE | `/financial-advisor/:id` | Dismiss advice |

---

## Notifications — `/api/notifications`

| Method | Path | Description |
|---|---|---|
| GET | `/?isRead=&page=&limit=` | List notifications |
| PATCH | `/read-all` | Mark all read |
| PATCH | `/:id/read` | Mark one read |
| DELETE | `/:id` | Delete notification |

---

## Government Schemes — `/api/schemes`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/?category=&state=&search=&page=&limit=` | ✅ | Browse schemes |
| GET | `/:id` | ✅ | Get one scheme |
| POST | `/` | Admin | Create scheme |
| PATCH | `/:id` | Admin | Update scheme |
| DELETE | `/:id` | Admin | Deactivate scheme |

---

## Weather — `/api/weather`

| Method | Path | Description |
|---|---|---|
| GET | `/farm/:farmId` | Current conditions + 7-day forecast (cached in MySQL, refreshed hourly) |

---

## Reports — `/api/reports`

| Method | Path | Description |
|---|---|---|
| POST | `/generate` | Body: `format (pdf\|excel), reportType?, dateFrom?, dateTo?` → returns `file_url` |
| GET | `/?page=&limit=` | List previously generated reports |

Generated files are served statically at `http://localhost:5000/uploads/reports/<filename>`.

---

## Marketplace — `/api/marketplace`

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/listings` | Farmer | Create a listing |
| GET | `/listings?cropName=&state=&district=&page=&limit=` | any | Browse active listings |
| GET | `/listings/mine` | Farmer | Own listings |
| PATCH | `/listings/:id/status` | Farmer | Update listing status |
| POST | `/orders` | Buyer | Place an order. Body: `listingId, quantityKg, deliveryAddress?` |
| GET | `/orders/mine` | Buyer | Own orders |
| GET | `/orders/incoming` | Farmer | Orders placed against your listings |
| PATCH | `/orders/:id/status` | Farmer or Buyer | Update order status |

---

## Admin — `/api/admin` (all routes require `role: admin`)

| Method | Path | Description |
|---|---|---|
| GET | `/overview` | Platform-wide KPIs |
| GET | `/growth-trend?months=12` | New user signups per month |
| GET | `/users?role=&search=&page=&limit=` | List all users |
| PATCH | `/users/:id/deactivate` | Deactivate a user |
| PATCH | `/users/:id/activate` | Reactivate a user |
| GET | `/audit-logs?page=&limit=` | Admin action audit trail |
| GET | `/farms` | All farms (alias of `/api/farms/admin/all`) |

---

## AI Service (FastAPI) — internal endpoints

Called only by the Node backend, authenticated via header `X-Internal-Api-Key: <AI_SERVICE_API_KEY>`.

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/crop-recommendation` | See schema in `ai/app/schemas/crop_recommendation.py` |
| POST | `/api/v1/profit-prediction` | See `ai/app/schemas/profit_prediction.py` |
| POST | `/api/v1/price-prediction` | See `ai/app/schemas/price_prediction.py` |
| POST | `/api/v1/disease-detection` | Multipart `file` + `crop_name` form field |
| POST | `/api/v1/financial-advisor` | See `ai/app/schemas/financial_advisor.py` |
| GET | `/health` | Service health check |

Interactive Swagger docs are auto-generated by FastAPI at `http://localhost:8000/docs` when the service is running.
