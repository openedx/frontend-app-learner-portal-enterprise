# How Search Works in the Learner Portal

This document explains the business logic that determines what search results learners see when executing an Algolia query via the search page.

> **Note on Coupon Codes:** Coupon codes have been decommissioned as a subsidy type. While some legacy code references remain in the codebase (behind feature flags), they are no longer actively used in production. This document focuses on the active subsidy types: **Subscription Licenses** and **Learner Credit**.

## Table of Contents
- [Overview](#overview)
- [The Six Filter Layers](#the-six-filter-layers)
- [Browse & Request Catalogs](#browse--request-catalogs)
- [Search Flow Diagram](#search-flow-diagram)
- [Key Files & Functions](#key-files--functions)
- [Example Scenarios](#example-scenarios)
- [Feature Flags](#feature-flags)

---

## Overview

Search results are filtered through **six progressive layers** that determine which content a learner can see:

1. **Enterprise Catalog Filtering** - Only show content from accessible catalogs
2. **Secured Algolia API Key** - Enterprise-specific authorization
3. **Catalog Query UUID Filter** - Algolia filter string construction
4. **Access Control Gating** - User-level restrictions
5. **Content Type Filtering** - Enable/disable content types
6. **Language + Metadata Filtering** - Locale-based filtering

The core principle: **Learners see courses from catalogs they either have funding for OR can request funding for**.

---

## The Six Filter Layers

### 1. Enterprise Catalog Filtering

**Purpose:** Aggregate all catalog UUIDs the learner has access to via subsidies.

**Key Files:**
- `src/components/app/data/hooks/useSearchCatalogs.js:15-35`
- `src/components/app/data/utils.js:675-706` (`getSearchCatalogs()`)

**Logic:**
```javascript
// Collect catalog UUIDs from all subsidy types:
const catalogUUIDs = new Set();

// 1. Redeemable learner credit policies
redeemablePolicies.forEach(policy => catalogUUIDs.add(policy.catalogUuid));

// 2. Active subscription license
if (subscriptionLicense?.status === 'activated' &&
    subscriptionLicense?.subscriptionPlan.isCurrent) {
  catalogUUIDs.add(subscriptionLicense.subscriptionPlan.enterpriseCatalogUuid);
}

// 3. Enterprise offers (deprecated, if feature enabled)
if (features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS) {
  currentEnterpriseOffers.forEach(offer =>
    catalogUUIDs.add(offer.enterpriseCatalogUuid)
  );
}

// 4. Browse & request catalogs (see section below)
catalogsForSubsidyRequests.forEach(catalog => catalogUUIDs.add(catalog));
```

---

### 2. Secured Algolia API Key

**Purpose:** Use enterprise-specific secured Algolia key that restricts queries to authorized catalog query UUIDs.

**Key File:** `src/components/app/data/hooks/useAlgoliaSearch.ts:89-227`

**Implementation:**
- Calls BFF endpoint to get secured Algolia API key
- Receives `catalogUuidsToCatalogQueryUuids` mapping (maps catalog UUIDs to query UUIDs)
- Falls back to public search key if secured key unavailable

```typescript
// Determine whether to use secured key
const shouldUseSecuredKey =
  isCatalogQueryFiltersEnabled &&  // Feature flag
  isIndexSupported &&               // Not jobs index
  securedAlgoliaMetadata?.key;      // Key exists
```

---

### 3. Catalog Query UUID Filter

**Purpose:** Build Algolia filter string that restricts to catalog query UUIDs from layer 1.

**Key Files:**
- `src/components/app/data/hooks/useDefaultSearchFilters.ts:55-107`
- `src/components/AlgoliaFilterBuilder/AlgoliaFilterBuilder.ts:131-140`

**Filter Construction:**
```javascript
const filterBuilder = new AlgoliaFilterBuilder()
  .filterByCatalogQueryUuids(searchCatalogs, catalogUuidsToCatalogQueryUuids)
  .filterByMetadataLanguage(getSupportedLocale())
  .excludeVideoContentIfFeatureDisabled();

// Results in Algolia filter:
// "(enterprise_catalog_query_uuids:q1 OR enterprise_catalog_query_uuids:q2)
//  AND metadata_language:en
//  AND NOT content_type:video"
```

**Filter Builder Methods:**
- `filterByCatalogQueryUuids()` - Creates OR filter for catalog queries
- `filterByMetadataLanguage()` - Filters by locale (en/es)
- `excludeVideoContentIfFeatureDisabled()` - Excludes videos if feature disabled

---

### 4. Access Control Gating

**Purpose:** Apply user-level restrictions based on learner's access level.

**Key File:** `src/components/search/Search.jsx:57-105`

#### Assignments-Only Learner Check
**Hook:** `useIsAssignmentsOnlyLearner()` (`src/components/app/data/hooks/useIsAssignmentsOnlyLearner.js:8-38`)

**Business Rule:** If learner has ONLY content assignments (no active subsidies), show "assignments-only" empty state.

**Logic:** `src/components/app/data/utils.js:106-137`
```javascript
// Returns true if:
// - Has allocated assignments
// - But NO active licenses, enterprise offers, or learner credit
```

#### Content Highlights Only Check
**Hook:** `useCanOnlyViewHighlights()` (`src/components/app/data/hooks/useContentHighlightsConfiguration.js:25-34`)

**Business Rule:** If enabled, restrict to curated content highlights instead of full search.

#### Valid License/Subscription Check
**Hook:** `useHasValidLicenseOrSubscriptionRequestsEnabled()`

**Business Rule:** Must have valid license, subscription request enabled, or subsidy to access search.

---

### 5. Content Type Filtering

**Purpose:** Enable/disable entire content types based on features and user entitlements.

**Key File:** `src/components/search/Search.jsx:100-104, 207-220`

**Video Content Special Case:**
```javascript
const enableVideos =
  !canOnlyViewHighlights &&                         // Not restricted to highlights
  config.FEATURE_ENABLE_VIDEO_CATALOG &&            // Feature flag enabled
  hasValidLicenseOrSubscriptionRequestsEnabled;     // Has valid entitlement
```

**Content Type Filters:**
- **Programs:** `config.ENABLE_PROGRAMS` flag
- **Pathways:** `config.ENABLE_PATHWAYS` flag
- **Videos:** Combined checks above

**Applied via:** `useContentTypeFilter()` (`src/components/app/data/hooks/useContentTypeFilter.ts:57-65`)
```javascript
// Builds separate filter for each content type:
// "content_type:course AND [base filters]"
// "content_type:program AND [base filters]"
```

---

### 6. Language + Metadata Filtering

**Purpose:** Filter by user's locale to show appropriate content.

**Implementation:** `src/components/AlgoliaFilterBuilder/AlgoliaFilterBuilder.ts:197-202`
```javascript
filterByMetadataLanguage(locale) {
  // Creates filter: metadata_language:en
  return this.andRaw(`metadata_language:${locale}`);
}
```

---

## Browse & Request Catalogs

### What Are Browse & Request Catalogs?

Browse & Request enables learners to see and request access to courses they don't currently have funding for.

**Key Distinction:**

| **Active Subsidy Catalogs** | **Browse & Request Catalogs** |
|----------------------------|------------------------------|
| Learner has funding NOW | Learner can REQUEST funding |
| "Enroll" button | "Request Access" button |
| Immediate enrollment | Admin approval required |
| Based on current entitlement | Based on future potential |

### Configuration

**API Endpoint:** `GET /api/v1/customer-configurations/{enterpriseUUID}/`

**Configuration Object:**
```javascript
{
  subsidyRequestsEnabled: boolean,  // Master switch
  subsidyType: 'license' | 'learner_credit'
}
```

**Key Files:**
- Hook: `src/components/app/data/hooks/useCatalogsForSubsidyRequests.js:13-27`
- Utility: `src/components/app/data/utils.js:650-673` (`getCatalogsForSubsidyRequests()`)
- API Service: `src/components/app/data/services/subsidies/browseAndRequest.ts:21-25`

### Catalog Determination Logic

```javascript
export function getCatalogsForSubsidyRequests({
  browseAndRequestConfiguration,
  customerAgreement,
}) {
  const catalogs = [];

  // Early exit if disabled
  if (!browseAndRequestConfiguration?.subsidyRequestsEnabled) {
    return catalogs;
  }

  // License request enabled
  if (browseAndRequestConfiguration.subsidyType === SUBSIDY_TYPE.LICENSE
      && customerAgreement) {
    // Add ALL subscription plan catalogs for the enterprise
    const catalogsFromSubscriptions = customerAgreement.availableSubscriptionCatalogs;
    catalogs.push(...catalogsFromSubscriptions);
  }

  // Note: Learner credit requests don't currently add catalogs via this function
  // Learner credit policy catalogs are added through the active subsidy flow

  return catalogs;
}
```

### Decision Tree

```
Is browse & request enabled?
  ├─ NO (subsidyRequestsEnabled: false)
  │   └─ Return [] (no browse catalogs)
  │
  └─ YES (subsidyRequestsEnabled: true)
      ├─ Which subsidy type can be requested?
      │
      ├─ LICENSE:
      │   ├─ Does customerAgreement exist?
      │   │   ├─ YES → Add customerAgreement.availableSubscriptionCatalogs
      │   │   └─ NO → Add nothing
      │   └─ Result: Learner can browse ALL subscription plan catalogs
      │
      └─ LEARNER_CREDIT:
          └─ Catalogs are NOT added via getCatalogsForSubsidyRequests()
              Learner credit requests allow learners to request budget allocation,
              but catalogs come from active learner credit policies, not B&R config
```

### Integration into Search

**File:** `src/components/app/data/utils.js:701-702`

```javascript
// Within getSearchCatalogs()...

// Add browse & request catalogs
// KEY INSIGHT: Added alongside active subsidies, enabling
// learners to see courses they could potentially request access to
catalogsForSubsidyRequests.forEach((catalog) => catalogUUIDs.add(catalog));
```

---

## Search Flow Diagram

```
User Visits Search Page
  ↓
[1] useSearchCatalogs() → Aggregate catalog UUIDs from all subsidies
  ↓                        (subscription, learner credit, browse & request)
  │
  ├─ useSubscriptions() → Active subscription license catalog
  ├─ useRedeemablePolicies() → Learner credit policy catalogs
  ├─ useEnterpriseOffers() → Enterprise offer catalogs (deprecated)
  └─ useCatalogsForSubsidyRequests() → Browse & request catalogs
      ├─ useBrowseAndRequestConfiguration() → Get enterprise config
      └─ useSubscriptions() → Get availableSubscriptionCatalogs
  ↓
[2] useSecuredAlgoliaMetadata() → Get secured API key from BFF
  ↓                                 + catalogUuid → queryUuid mapping
  │
[3] AlgoliaFilterBuilder → Build filter string:
  ↓                        "(query_uuid:A OR query_uuid:B) AND language:en"
  │
[4] Access Control Checks:
  ↓  ├─ isAssignmentsOnly? → Show empty state
  ↓  ├─ canOnlyViewHighlights? → Redirect to highlights
  ↓  └─ hasValidLicense? → Continue to search
  │
[5] Content Type Filters:
  ↓  ├─ enableVideos? → Show SearchVideo component
  ↓  ├─ ENABLE_PROGRAMS? → Show SearchProgram component
  ↓  └─ ENABLE_PATHWAYS? → Show SearchPathway component
  │
[6] Execute Algolia Query with combined filters
  ↓
Render SearchResults with filtered hits
```

---

## Key Files & Functions

### Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useSearchCatalogs()` | `src/components/app/data/hooks/useSearchCatalogs.js` | Aggregate all accessible catalog UUIDs |
| `useCatalogsForSubsidyRequests()` | `src/components/app/data/hooks/useCatalogsForSubsidyRequests.js` | Get browse & request catalogs |
| `useBrowseAndRequestConfiguration()` | `src/components/app/data/hooks/useBrowseAndRequest.ts:42-49` | Get enterprise B&R config |
| `useAlgoliaSearch()` | `src/components/app/data/hooks/useAlgoliaSearch.ts:170-227` | Initialize Algolia client with secured key |
| `useDefaultSearchFilters()` | `src/components/app/data/hooks/useDefaultSearchFilters.ts:55-107` | Build base Algolia filter string |
| `useContentTypeFilter()` | `src/components/app/data/hooks/useContentTypeFilter.ts:57-65` | Build content type filters |
| `useIsAssignmentsOnlyLearner()` | `src/components/app/data/hooks/useIsAssignmentsOnlyLearner.js:8-38` | Check if learner is assignments-only |
| `useCanOnlyViewHighlights()` | `src/components/app/data/hooks/useContentHighlightsConfiguration.js:25-34` | Check if restricted to highlights |

### Utilities

| Function | File | Lines | Purpose |
|----------|------|-------|---------|
| `getSearchCatalogs()` | `src/components/app/data/utils.js` | 675-706 | Aggregate catalogs from all sources |
| `getCatalogsForSubsidyRequests()` | `src/components/app/data/utils.js` | 650-673 | Determine browse & request catalogs |
| `AlgoliaFilterBuilder` | `src/components/AlgoliaFilterBuilder/AlgoliaFilterBuilder.ts` | 1-220 | Build Algolia filter strings |
| `filterByCatalogQueryUuids()` | `src/components/AlgoliaFilterBuilder/AlgoliaFilterBuilder.ts` | 131-140 | Create catalog query UUID filter |
| `filterByMetadataLanguage()` | `src/components/AlgoliaFilterBuilder/AlgoliaFilterBuilder.ts` | 197-202 | Create language filter |

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `SearchPage` | `src/components/search/SearchPage.jsx` | Search page entry point |
| `Search` | `src/components/search/Search.jsx` | Main search component with filter logic |
| `SearchCourse` | `src/components/search/SearchCourse.jsx` | Course search results (20 per page) |
| `SearchProgram` | `src/components/search/SearchProgram.jsx` | Program search results (4 per page) |
| `SearchPathway` | `src/components/search/SearchPathway.jsx` | Pathway search results (4 per page) |
| `SearchVideo` | `src/components/search/SearchVideo.jsx` | Video search results (20 per page) |

---

## Example Scenarios

### Scenario 1: Learner with Active Subscription Only

**Learner's Subsidies:**
- Active subscription license for `catalog-A`

**Browse & Request Config:**
- `subsidyRequestsEnabled: false`

**Search Catalogs:**
```javascript
['catalog-A']  // Only active subscription catalog
```

**Search Results:**
- Courses from `catalog-A` with "Enroll" button

---

### Scenario 2: Learner with Subscription + Browse & Request

**Learner's Subsidies:**
- Active subscription license for `catalog-A`

**Browse & Request Config:**
- `subsidyRequestsEnabled: true`
- `subsidyType: 'license'`
- `availableSubscriptionCatalogs: ['catalog-A', 'catalog-B', 'catalog-C']`

**Search Catalogs:**
```javascript
['catalog-A', 'catalog-B', 'catalog-C']
// catalog-A: has active license (enroll)
// catalog-B, catalog-C: browse & request (request license)
```

**Search Results:**
- Courses from `catalog-A` with "Enroll" button (has funding)
- Courses from `catalog-B` with "Request License" button
- Courses from `catalog-C` with "Request License" button

---

### Scenario 3: Assignments-Only Learner

**Learner's Subsidies:**
- Content assignments for 3 specific courses
- NO active subscription or learner credit

**Browse & Request Config:**
- Any configuration

**Result:**
- `useIsAssignmentsOnlyLearner()` returns `true`
- Search page shows "assignments-only" empty state
- Learner redirected to dashboard to view assignments
- **Search is NOT accessible**

**Code Reference:** `src/components/search/Search.jsx:128-135`

---

### Scenario 4: Multi-Source Catalog Access

**Learner's Subsidies:**
- Subscription license for `catalog-A`
- Learner credit policy for `catalog-B`

**Browse & Request Config:**
- `subsidyRequestsEnabled: true`
- `subsidyType: 'license'`
- `availableSubscriptionCatalogs: ['catalog-A', 'catalog-C']`

**Search Catalogs:**
```javascript
['catalog-A', 'catalog-B', 'catalog-C']
// catalog-A: has subscription + in B&R (enroll with subscription)
// catalog-B: has learner credit (enroll with learner credit)
// catalog-C: browse & request only (request license)
```

**Search Results:**
- All courses from all 3 catalogs appear in search
- `catalog-A`, `catalog-B`: "Enroll" button
- `catalog-C`: "Request License" button

---

## Feature Flags

### Core Search Feature Flags

| Flag | Default | Effect | Reference |
|------|---------|--------|-----------|
| `ALGOLIA_APP_ID` | (required) | Enables secured catalog filtering | `useAlgoliaSearch.ts:95` |
| `FEATURE_ENABLE_VIDEO_CATALOG` | false | Shows/hides video results | `Search.jsx:102` |
| `ENABLE_PROGRAMS` | true | Shows/hides program results | `Search.jsx:209` |
| `ENABLE_PATHWAYS` | true | Shows/hides pathway results | `Search.jsx:207` |
| `FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS` | false | Enables enterprise offers (deprecated) | `utils.js:697` |
| `FEATURE_CONTENT_HIGHLIGHTS` | false | Enables curated highlights mode | Various |
| `PROGRAM_TYPE_FACET` | false | Enables program type as facet filter | `utils.js:31` |

### Results Per Page Constants

**File:** `src/components/search/constants.js`

```javascript
NUM_RESULTS_COURSE = 20    // Line 12
NUM_RESULTS_PROGRAM = 4    // Line 9
NUM_RESULTS_PATHWAY = 4    // Line 10
NUM_RESULTS_VIDEO = 20     // Line 13
```

---

## Testing Search Logic

### Component Tests
- `src/components/search/tests/Search.test.jsx`
- `src/components/search/tests/SearchResults.test.jsx`

### Hook Tests
- `src/components/app/data/hooks/useSearchCatalogs.test.jsx`
- `src/components/app/data/hooks/useCatalogsForSubsidyRequests.test.jsx`
- `src/components/app/data/hooks/useBrowseAndRequest.test.tsx`

### Utility Tests
- `src/components/app/data/utils.test.js`

### Testing Patterns

```javascript
// Mock subsidy data
const mockSubscriptionLicense = {
  status: LICENSE_STATUS.ACTIVATED,
  subscriptionPlan: {
    isCurrent: true,
    enterpriseCatalogUuid: 'catalog-uuid-1',
  },
};

const mockRedeemablePolicies = [
  { catalogUuid: 'catalog-uuid-2' },
  { catalogUuid: 'catalog-uuid-3' },
];

// Mock browse & request config
const mockBrowseAndRequestConfiguration = {
  subsidyRequestsEnabled: true,
  subsidyType: 'license',
};

// Test catalog aggregation
const catalogs = getSearchCatalogs({
  redeemablePolicies: mockRedeemablePolicies,
  subscriptionLicense: mockSubscriptionLicense,
  currentEnterpriseOffers: [],
  catalogsForSubsidyRequests: ['catalog-uuid-4'],
});

// Assert
expect(catalogs).toEqual([
  'catalog-uuid-2',  // From learner credit
  'catalog-uuid-3',  // From learner credit
  'catalog-uuid-1',  // From subscription
  'catalog-uuid-4',  // From browse & request
]);
```

---

## Summary

### Key Takeaways

1. **Subsidy-Driven Access:** What a learner sees is determined by which subsidies (licenses, learner credit) give them access to which catalogs

2. **Browse & Request Expansion:** Learners can see courses they could potentially request access to, not just courses they currently have funding for

3. **Defense in Depth:** Multiple layers ensure security:
   - Secured Algolia API key (server-generated)
   - Catalog query UUID filtering (Algolia filter string)
   - Access control checks (client-side gates)

4. **Dynamic Configuration:** Search behavior adapts based on:
   - User's entitlements (what they're allowed to see)
   - Feature flags (what the enterprise has enabled)
   - Browse & request settings (what they can request)
   - Language preferences (metadata_language filter)

5. **Assignments Override:** Learners with only assignments see a different experience entirely (no search access)

### Search Catalog Sources

1. Redeemable learner credit policies → catalog UUIDs
2. Active subscription license → catalog UUID (if activated & current)
3. Enterprise offers → catalog UUIDs (deprecated, if feature enabled)
4. **Browse & request catalogs → catalog UUIDs (enables request-based access)**

### When in Doubt

Start with these hooks to understand search behavior:
- `useSearchCatalogs()` - What catalogs are included in search?
- `useCatalogsForSubsidyRequests()` - What can the learner request access to?
- `useDefaultSearchFilters()` - What Algolia filters are applied?
- `useIsAssignmentsOnlyLearner()` - Is search even accessible?

---

## Related Documentation

- [Subsidies & Course Redemption Guide](./subsidies.md) - Detailed subsidy system explanation
- [Architecture Overview](./architecture_overview.md) - Overall application structure
- [CLAUDE.md](../CLAUDE.md) - Development commands and patterns
