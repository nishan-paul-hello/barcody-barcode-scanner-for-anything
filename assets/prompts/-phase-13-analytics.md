# Phase 13: Analytics Dashboard - AI Implementation Prompts

> **5 Tasks**: Admin module, event tracking, database schema, charts & metrics, frontend integration
>
> **No Code Snippets** - Requirements-driven approach for intelligent implementation

---

## Task 13.1: Backend Admin Module

```
TASK: Create admin API module with role-based access control for analytics dashboard.

SYSTEM CONTEXT: Secure admin endpoints providing cross-user analytics and management capabilities. Only authorized admin email can access. Critical for monitoring application health, user behavior, and system performance.

REQUIREMENTS:

1. Module Setup: Create app-backend/src/modules/admin/ directory, create AdminModule
2. Admin Controller: Create AdminController with endpoints:
   - GET /api/v1/admin/analytics/overview - Total scans, users, active today
   - GET /api/v1/admin/analytics/trends - Daily scans trend with date range filter
   - GET /api/v1/admin/analytics/barcode-types - Barcode type distribution
   - GET /api/v1/admin/analytics/devices - Device breakdown (web, mobile, OS)
   - GET /api/v1/admin/users - User list with pagination
   - GET /api/v1/admin/scans - All scans across users with filters
3. Admin Service: Create AdminService with database queries:
   - Analytics aggregation queries (COUNT, GROUP BY, date ranges)
   - User management queries with pagination
   - Cross-user scan queries with filters
   - Efficient query optimization
4. Admin Guard: Create AdminGuard to restrict access:
   - Check JWT token validity
   - Extract email from JWT payload
   - Compare with ADMIN_EMAIL environment variable
   - Reject with 403 Forbidden if email doesn't match
   - Allow access only to exact admin email
5. DTOs: Create data transfer objects:
   - AnalyticsFilterDto (startDate, endDate, filters)
   - PaginationDto (page, limit, sortBy, sortOrder)
   - AnalyticsOverviewDto (response structure)
   - TrendDataDto (response structure)
   - UserListDto, ScanListDto
6. Environment Configuration: Add ADMIN_EMAIL to .env files
7. Guard Application: Apply @UseGuards(JwtAuthGuard, AdminGuard) to all admin endpoints
8. Error Handling: Proper error responses for unauthorized access, invalid queries

CONSTRAINTS:
- Only single admin email can access
- Efficient aggregation queries (no N+1 problems)
- Secure guard implementation
- Fast response times
- Proper pagination for large datasets

INTEGRATION POINTS:
- JWT auth from Task 3.6
- Analytics database from Task 13.3
- Dashboard UI from Task 13.4
- User entity from Task 3.1

TESTING REQUIREMENTS:
1. Admin email can access all endpoints
2. Non-admin email receives 403 Forbidden
3. Unauthenticated requests receive 401 Unauthorized
4. All analytics queries return correct data
5. Pagination works correctly
6. Filters apply properly
7. Date range filtering works
8. Performance acceptable for large datasets

ACCEPTANCE CRITERIA:
- ✅ AdminModule created
- ✅ All endpoints functional
- ✅ AdminGuard enforces access control
- ✅ Queries efficient and correct
- ✅ DTOs properly typed
- ✅ Pagination working
- ✅ Error handling comprehensive

QUALITY STANDARDS:
- Follow NestJS module best practices
- Secure access control
- Efficient database queries
- Proper error handling
- Clean, maintainable code
- Comprehensive logging

DELIVERABLES:
- AdminModule implementation
- AdminController with all endpoints
- AdminService with queries
- AdminGuard implementation
- All DTOs
- Environment configuration

SUCCESS METRIC: Admin endpoints accessible only to authorized email with efficient queries and proper access control.
```

---

## Task 13.2: Analytics Backend - Event Tracking

```
TASK: Implement analytics event tracking with privacy-preserving user ID hashing.

SYSTEM CONTEXT: Track user behavior for product improvement while protecting privacy. Use SHA-256 hashing to anonymize user IDs before saving to local database (analytics_events table). Enables behavioral analysis without compromising user privacy.

REQUIREMENTS:

1. Analytics Module: Create AnalyticsModule in app-backend
2. Event Endpoint: Implement POST /analytics/event:
   - Accept event data (event_type, user_id, metadata, timestamp)
   - Validate event structure
   - Process event asynchronously
3. Event Processor: Create event processing service:
   - Queue events for batch processing
   - Process in background
   - Handle processing failures
4. User ID Hashing: Implement SHA-256 hashing:
   - Use crypto module for SHA-256
   - Add global pepper from ANALYTICS_HASH_SECRET env var
   - Hash format: SHA-256(userId + ANALYTICS_HASH_SECRET)
   - Ensure consistent hashing across all events
   - Same user ID always produces same hash
5. Supabase Integration: Send events to Supabase:
   - Configure Supabase client
   - Send hashed events to analytics table
   - Handle Supabase errors gracefully
   - Retry failed sends
6. Event Types: Support event types:
   - scan_created, scan_deleted
   - user_login, user_logout
   - export_generated
   - error_occurred
   - page_view, screen_view
7. Environment Configuration: Add ANALYTICS_HASH_SECRET, SUPABASE_URL, SUPABASE_KEY
8. Error Handling: Handle hashing errors, Supabase errors, validation errors

CONSTRAINTS:
- Privacy-preserving hashing required
- Consistent hashes across events
- Secure secret storage
- Asynchronous processing
- No blocking of main requests

INTEGRATION POINTS:
- Supabase analytics platform
- Frontend tracking from Task 13.5
- User entity from Task 3.1

TESTING REQUIREMENTS:
1. Events tracked correctly
2. User IDs hashed consistently
3. Same user ID produces same hash
4. Different user IDs produce different hashes
5. Events sent to Supabase successfully
6. Failed sends retry correctly
7. Asynchronous processing works
8. No performance impact on main requests

ACCEPTANCE CRITERIA:
- ✅ AnalyticsModule created
- ✅ Event endpoint functional
- ✅ User ID hashing implemented
- ✅ Consistent hashing verified
- ✅ Supabase integration working
- ✅ Async processing functional
- ✅ Error handling robust

QUALITY STANDARDS:
- Privacy-first design
- Secure hashing implementation
- Efficient async processing
- Proper error handling
- Clean code structure

DELIVERABLES:
- AnalyticsModule
- Event endpoint
- Event processor
- Hashing logic
- Supabase integration
- Environment configuration

SUCCESS METRIC: Analytics events tracked with privacy-preserving user ID hashing and reliable Supabase delivery.
```

---

## Task 13.3: Analytics Database Schema

```
TASK: Create analytics tables in local PostgreSQL database with optimized schema and indexes.

SYSTEM CONTEXT: Local analytics storage for admin dashboard queries. Separate analytics schema for organization. Stores aggregated data for fast dashboard queries without hitting main tables.

REQUIREMENTS:

1. Analytics Schema: Create analytics schema:
   - CREATE SCHEMA IF NOT EXISTS analytics;
   - Separate from public schema
2. Usage Stats Table: CREATE TABLE analytics.usage_stats:
   - date DATE PRIMARY KEY
   - total_scans INTEGER
   - active_users INTEGER
   - new_users INTEGER
   - created_at TIMESTAMP DEFAULT NOW()
3. Scan Metrics Table: CREATE TABLE analytics.scan_metrics:
   - id SERIAL PRIMARY KEY
   - date DATE NOT NULL
   - barcode_type VARCHAR(50)
   - success_count INTEGER
   - error_count INTEGER
   - avg_scan_time FLOAT
   - created_at TIMESTAMP DEFAULT NOW()
4. Error Stats Table: CREATE TABLE analytics.error_stats:
   - id SERIAL PRIMARY KEY
   - date DATE NOT NULL
   - error_type VARCHAR(100)
   - count INTEGER
   - device_type VARCHAR(50)
   - created_at TIMESTAMP DEFAULT NOW()
5. User Behavior Table: CREATE TABLE analytics.user_behavior:
   - id SERIAL PRIMARY KEY
   - hashed_user_id VARCHAR(64) NOT NULL
   - session_length INTEGER
   - scan_frequency FLOAT
   - retention_day INTEGER
   - created_at TIMESTAMP DEFAULT NOW()
6. Device Stats Table: CREATE TABLE analytics.device_stats:
   - id SERIAL PRIMARY KEY
   - device_model VARCHAR(100)
   - os_version VARCHAR(50)
   - camera_specs TEXT
   - scan_count INTEGER
   - avg_fps FLOAT
   - created_at TIMESTAMP DEFAULT NOW()
7. API Metrics Table: CREATE TABLE analytics.api_metrics:
   - id SERIAL PRIMARY KEY
   - endpoint VARCHAR(200)
   - method VARCHAR(10)
   - response_time INTEGER
   - status_code INTEGER
   - timestamp TIMESTAMP DEFAULT NOW()
8. Indexes: Create performance indexes:
   - CREATE INDEX idx_usage_stats_date ON analytics.usage_stats(date DESC)
   - CREATE INDEX idx_scan_metrics_date_type ON analytics.scan_metrics(date DESC, barcode_type)
   - CREATE INDEX idx_error_stats_date ON analytics.error_stats(date DESC)
   - CREATE INDEX idx_user_behavior_hashed_id ON analytics.user_behavior(hashed_user_id)
   - CREATE INDEX idx_api_metrics_timestamp ON analytics.api_metrics(timestamp DESC)
9. TypeORM Migration: Generate migration for analytics schema
10. Migration Testing: Test migration runs successfully

CONSTRAINTS:
- Efficient schema design
- Proper indexes for fast queries
- Normalized structure
- Support for time-series queries
- Handle large datasets

INTEGRATION POINTS:
- Admin queries from Task 13.1
- Analytics aggregation jobs
- Event tracking from Task 13.2

TESTING REQUIREMENTS:
1. Migration runs successfully
2. All tables created in analytics schema
3. Indexes created correctly
4. Data can be inserted
5. Queries are fast
6. Indexes used by queries
7. Migration can rollback

ACCEPTANCE CRITERIA:
- ✅ Analytics schema created
- ✅ All 6 tables functional
- ✅ All indexes working
- ✅ Migration successful
- ✅ Fast query performance
- ✅ Rollback tested

QUALITY STANDARDS:
- Normalized database design
- Proper indexing strategy
- Clean migration code
- Comprehensive testing

DELIVERABLES:
- Analytics schema
- 6 table definitions
- Performance indexes
- TypeORM migration
- Migration tests

SUCCESS METRIC: Analytics database ready with optimized schema enabling fast dashboard queries.
```

---

## Task 13.4: Admin Dashboard - Charts & Metrics

```
TASK: Create interactive analytics dashboard with charts and real-time metrics.

SYSTEM CONTEXT: Visual analytics dashboard for admin monitoring. Displays key metrics, trends, and insights. Real-time updates for live monitoring.

REQUIREMENTS:

1. Dependencies: Install recharts for charts, @tanstack/react-query for data fetching
2. API Hooks: Create React Query hooks:
   - useAnalyticsOverview() - Fetches GET /api/v1/admin/analytics/overview
   - useAnalyticsTrends(dateRange) - Fetches GET /api/v1/admin/analytics/trends
   - useBarcodeTypes() - Fetches GET /api/v1/admin/analytics/barcode-types
   - useDeviceBreakdown() - Fetches GET /api/v1/admin/analytics/devices
   - All hooks with proper stale times and caching
3. Dashboard Layout: Create dashboard page with grid layout:
   - Header with title and date range selector
   - Overview cards section
   - Charts section with multiple charts
   - Responsive grid layout
4. Overview Cards: Implement metric cards:
   - Total Users card (count, growth percentage)
   - Total Scans card (count, growth percentage)
   - Active Today card (count, comparison to yesterday)
   - Success Rate card (percentage, trend indicator)
   - Cards with icons and color coding
5. Line Charts: Add trend charts:
   - Scans Over Time (daily scans for selected date range)
   - X-axis: dates, Y-axis: counts
   - Tooltips on hover
   - Responsive sizing
6. Pie Charts: Add distribution charts:
   - Barcode Types Distribution (QR, EAN, UPC, etc.)
   - Device Breakdown (Web, iOS, Android)
   - Color-coded segments
   - Percentage labels
7. Retention Cohort: Create retention cohort table:
   - Rows: Cohort date (user start week/month)
   - Columns: Retention period (Week 0, 1, 2...)
   - Cells: Retention percentage
7. Date Range Selector: Implement date range filter:
   - Predefined ranges (Last 7 days, Last 30 days, Last 90 days)
   - Custom date range picker
   - Apply to all charts
   - Update URL params

9. Loading States: Show skeleton loaders during data fetch
10. Error Handling: Display error messages with retry option

CONSTRAINTS:
- Responsive design (desktop and tablet)
- Fast rendering
- Real-time updates without flickering
- Clear visualizations
- Accessible charts

INTEGRATION POINTS:
- Admin API from Task 13.1
- React Query from Task 4.12
- Auth from Task 4.13

TESTING REQUIREMENTS:
1. All charts render with real data
2. Date range filter works
3. Real-time updates functional
4. Loading states display
5. Error handling works
6. Responsive on all screen sizes
7. Tooltips display correctly
8. Data refreshes automatically

ACCEPTANCE CRITERIA:
- ✅ Dashboard layout created
- ✅ All API hooks functional
- ✅ Overview cards display
- ✅ Line charts render
- ✅ Pie charts render
- ✅ Date range selector works

- ✅ Responsive design

QUALITY STANDARDS:
- Clean, modern UI design
- Efficient data fetching
- Smooth UX
- Accessible components
- Professional visualizations

DELIVERABLES:
- Dashboard page component
- API hooks
- Overview cards
- Chart components
- Date range selector
- Real-time update logic

SUCCESS METRIC: Interactive analytics dashboard with real-time charts providing clear insights into application metrics.
```

---

## Task 13.5: Frontend Analytics Integration - Web

```
TASK: Add analytics tracking to web app for user behavior monitoring.

SYSTEM CONTEXT: Track user interactions for product improvement. Send events to app-backend analytics endpoint. Respect user privacy while gathering insights.

REQUIREMENTS:

1. Analytics Service: Create lib/analytics.service.ts
   - Singleton service for event tracking
   - Type-safe event definitions
   - Async event queue management

2. Page View Tracking: Track page views
   - Use useEffect in root layout
   - Track on route changes
   - Send page_view event with URL
   - Include referrer information

3. Scan Event Tracking: Track scan events
   - Track scan_created (success, barcode type)
   - Track scan_failed (error type)
   - Track scan_deleted
   - Include scan metadata

4. User Action Tracking: Track user actions
   - Track export_generated (format)
   - Track search_performed (query)
   - Track filter_applied (filter type)
   - Track settings_changed

5. Event Sending: Send events to POST /analytics/event
   - Include event_type, metadata, timestamp
   - User ID from auth store
   - Async sending (don't block UI)
   - Batch events when possible

6. Error Handling: Handle failed event sends gracefully
   - Retry logic with exponential backoff
   - Silent failures (log but don't alert user)
   - Drop events after max retries

CONSTRAINTS:
- Privacy-respecting (no PII)
- Minimal performance impact (<5ms overhead)
- Async event sending
- No blocking of user actions
- TypeScript strict mode

INTEGRATION POINTS:
- Analytics app-backend from Task 13.2
- Auth store from Task 4.2
- React Router for navigation tracking

TESTING REQUIREMENTS:
1. Events sent to app-backend correctly
2. Correct event data structure
3. User ID included when authenticated
4. Privacy respected (no PII in events)
5. No performance impact on UI
6. Failed sends don't crash app
7. Page views tracked on navigation
8. User actions tracked correctly

ACCEPTANCE CRITERIA:
- ✅ Web analytics service created
- ✅ Page views tracked automatically
- ✅ Scan events tracked
- ✅ User actions tracked
- ✅ Events sent to app-backend asynchronously
- ✅ Privacy respected (no PII)
- ✅ Error handling implemented
- ✅ Tests passing

QUALITY STANDARDS:
- Privacy-first design
- Minimal performance impact
- Clean service architecture
- Proper error handling
- Type-safe event definitions
- Async operations only

DELIVERABLES:
- lib/analytics.service.ts
- Event type definitions
- Page view tracking in layout
- Event tracking in components
- Privacy safeguards
- Unit tests for analytics service

SUCCESS METRIC: User behavior tracked efficiently on web with privacy protection and reliable event delivery without impacting user experience.
```

---

## Task 13.6: Frontend Analytics Integration - Mobile

```
TASK: Add analytics tracking to mobile app for user behavior monitoring.

SYSTEM CONTEXT: Track user interactions for product improvement. Send events to app-backend analytics endpoint. Respect user privacy while gathering insights. Support offline usage.

REQUIREMENTS:

1. Analytics Service: Create services/analytics.service.ts
   - Singleton service for event tracking
   - Type-safe event definitions
   - Offline queue management
   - Background event processing

2. Screen View Tracking: Track screen views
   - Use React Navigation listener
   - Track on screen focus
   - Send screen_view event with screen name
   - Include navigation parameters (sanitized)

3. Scan Event Tracking: Track scan events
   - Track scan_created (success, barcode type)
   - Track scan_failed (error type)
   - Track scan_deleted
   - Include scan metadata

4. Session Tracking: Track session metrics
   - Session start/end timestamps
   - Session length calculation
   - App foreground/background events
   - Session ID generation

5. Device Info Tracking: Track anonymized device info
   - OS version (iOS 16, Android 13)
   - Device model (anonymized, e.g., "iPhone", "Android Phone")
   - App version
   - Screen dimensions (for UI optimization)

6. Event Sending: Send to POST /analytics/event
   - Include event_type, metadata, timestamp
   - User ID from auth store
   - Async sending (don't block UI)
   - Batch events for efficiency

7. Offline Queueing: Queue events when offline
   - Store events in AsyncStorage
   - Send queued events when online
   - Network state monitoring
   - Queue size limits

CONSTRAINTS:
- Privacy-respecting (no PII)
- Minimal battery impact
- Async event sending
- Offline support required
- No blocking of user actions
- Minimal storage usage

INTEGRATION POINTS:
- Analytics app-backend from Task 13.2
- Auth store from Task 4.7
- React Navigation for screen tracking
- NetInfo for connectivity status

TESTING REQUIREMENTS:
1. Events sent to app-backend from mobile
2. Correct event data structure
3. User ID included when authenticated
4. Privacy respected (no PII)
5. Offline queueing works correctly
6. Queued events sent when online
7. No performance/battery impact
8. Failed sends don't crash app
9. Session tracking accurate
10. Device info anonymized

ACCEPTANCE CRITERIA:
- ✅ Mobile analytics service created
- ✅ Screen views tracked automatically
- ✅ Scan events tracked
- ✅ Session tracking implemented
- ✅ Device info tracked (anonymized)
- ✅ Events sent to app-backend asynchronously
- ✅ Offline support with queueing
- ✅ Privacy respected (no PII)
- ✅ Tests passing

QUALITY STANDARDS:
- Privacy-first design
- Minimal battery/performance impact
- Clean service architecture
- Proper error handling
- Type-safe event definitions
- Async operations only
- Efficient offline queue

DELIVERABLES:
- services/analytics.service.ts
- Event type definitions
- Screen view tracking integration
- Session tracking logic
- Offline event queue
- Device info collection (anonymized)
- Privacy safeguards
- Unit tests for analytics service

SUCCESS METRIC: User behavior tracked efficiently on mobile with privacy protection, reliable offline support, and event delivery without impacting battery life or user experience.
```

---

END OF PHASE 13
