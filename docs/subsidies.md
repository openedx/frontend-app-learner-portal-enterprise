# Subsidies & Course Redemption Guide

Welcome! This doc explains how subsidies work in the enterprise learner portal. A subsidy is essentially a way for a company to help pay for (or fully cover) courses for their employees.

## What Are Subsidies?

Imagine your company wants to encourage employees to take courses. They have two main options:

1. **Subscription Licenses** - "We bought 50 seats for this course, one per employee"
2. **Learner Credit** - "Each employee has a $1000 budget to spend on any courses they want"

Both approaches accomplish the same goal (helping employees take courses), but they work differently. This doc explains how each works and what happens when a learner has both.

### Why Multiple Subsidy Types?

Different companies have different needs:
- **Subscription Licenses** work well for large-scale training (everyone needs the same course)
- **Learner Credit** works well for flexible development (employees choose their own courses)

---

## The Two Subsidy Types

### Subscription Licenses

A **subscription license** is a bulk seat purchase for a specific course (or group of courses).

**How it works:**
- Company purchases a subscription plan (e.g., 50 seats)
- The subscription is tied to a specific **catalog** of courses
- Each learner can use one seat per course
- License must be **activated** to be used
- Each learner gets at most one active license

**Key characteristics:**
- All-or-nothing: either the course is covered, or it's not (no partial payment)
- Assigned by the company, not requested by the learner
- Can't be used for courses outside the subscription's catalog
- Can expire or be revoked

**In the code:**
- `subscriptionLicense` object has `status` (ACTIVATED/DEACTIVATED) and `subscriptionPlan` (has `isCurrent`, `enterpriseCatalogUuid`)
- Checked in `useSubscriptions` hook (src/components/app/data/hooks/useSubscriptions.ts)

---

### Learner Credit

**Learner credit** is a budget pool that learners draw from when they enroll in courses.

**How it works:**
- Company creates a "policy" with a total budget (e.g., $100,000 for all employees)
- Each learner has an allocation from that budget
- When a learner enrolls in a course, the course price is deducted from their credit
- If they don't have enough credit, enrollment is denied (unless they request more)

**Two ways learner credit is allocated:**

1. **Auto-applied policies** - Credit is automatically available to all learners
   - No request needed
   - Learner just enrolls and the cost is deducted

2. **Request-based policies** - Learners must request access (see Browse & Request section below)
   - Company admin must approve
   - Once approved, learner can enroll

**Special case: Content Assignments**
- The company can assign specific courses to specific learners
- This is like pre-approved learner credit for that one course
- Learners can see "assigned courses" separate from general browsing

**In the code:**
- Redeemable policies fetched via `useRedeemablePolicies` hook
- Checked in `useCanUpgradeWithLearnerCredit` hook (src/components/app/data/hooks/useCanUpgradeWithLearnerCredit.js)

---

## When Both Subsidies Exist: The Priority Order

What if a learner has both a subscription license AND learner credit for the same course?

**The answer: Subscription License always wins.**

Here's the decision logic:

```
┌─────────────────────────────────┐
│ Can I use a subscription license?│
│ (activated + current + in        │
│  course's catalog)              │
└────────┬────────────────────────┘
         │
    YES ↓           NO ↓
    ┌────────┐      ┌──────────────┐
    │ USE    │      │ Use Learner  │
    │LICENSE │      │ Credit       │
    └────────┘      └──────────────┘
```

**Why this priority?**
- License is "free" (company already paid), so use it first
- Learner credit is more limited (fixed budget), so preserve it

**In the code:** See `src/components/app/data/hooks/useCourseRedemptionEligibility.ts:128-129`

```typescript
const isSubscriptionLicenseApplicable = determineSubscriptionLicenseApplicable(
  subscriptionLicense,
  catalogsWithCourse,
);
const hasSubsidyPrioritizedOverLearnerCredit = isSubscriptionLicenseApplicable;
```

This boolean determines which subsidy type is checked for redemption eligibility.

---

## How Redemption Works

When a learner visits a course detail page, the app needs to figure out:
1. Can they enroll?
2. Which subsidy will be used?
3. What's the cost after subsidy?
4. Are there any restrictions?

### The Redemption Eligibility Check

The main hook for this is **`useCourseRedemptionEligibility`** (src/components/app/data/hooks/useCourseRedemptionEligibility.ts).

Here's what it does:

```
1. Get course metadata (price, course runs, restrictions)
2. Get learner's subscriptions
3. Get learner's redeemable policies (learner credit)
4. Determine priority (license or credit?)
5. Check "can redeem" for the prioritized subsidy
   ├─ Is course in the subsidy's catalog?
   ├─ Is there enough budget/available seats?
   ├─ Is the course run restricted?
   └─ Has the learner already successfully enrolled?
6. Return redemption eligibility details
```

### The "Can Redeem" API Call

For each course run, the backend answers: "Can this learner redeem this course with this subsidy?"

This is a query called `queryCanRedeem` that hits the enterprise-access API. The response includes:

```javascript
{
  contentKey: "course-v1:...",
  canRedeem: true,           // Can they enroll with this subsidy?
  redeemableSubsidyAccessPolicy: {...},  // Policy details
  hasSuccessfulRedemption: false,  // Already enrolled before?
  displayReason: "Not eligible",   // Why they can't enroll (if applicable)
  listPrice: { usd: 299 }
}
```

### Course Runs and Restrictions

Courses can have multiple "runs" (instances). For example:
- Python 101 - Session A (starts Jan)
- Python 101 - Session B (starts Mar)

Each run can have different restrictions:

**Unrestricted runs** - Anyone can enroll (if they have any subsidy)
**Enterprise-restricted runs** - Only people with enterprise subsidies can enroll
**Other restricted runs** - Completely hidden from learners

The code filters these: `src/components/app/data/hooks/useCourseRedemptionEligibility.ts:41-55`

```typescript
const availableCourseRuns = courseRunsForRedemption.filter((courseRunMetadata) => {
  if (!courseRunMetadata.restrictionType) {
    return true;  // Unrestricted, always show
  }
  if (courseRunMetadata.restrictionType !== ENTERPRISE_RESTRICTION_TYPE) {
    return false;  // Other restrictions, hide completely
  }
  // Enterprise-restricted: only show if learner can redeem
  const canRedeemRunData = canRedeemData.find(r => r.contentKey === courseRunMetadata.key);
  return !!canRedeemRunData?.canRedeem || !!canRedeemRunData?.hasSuccessfulRedemption;
});
```

### Displaying to the Learner

Once the app knows the redemption status, it can show:
- ✅ "Enroll for free (covered by your subscription)"
- ✅ "Enroll for free (covered by your learner credit)"
- ❌ "Enroll ($299) - You don't have a subsidy for this"
- ❌ "This course is not available to you"

---

## Browse and Request Flows

Not every learner has a subsidy available. The **Browse and Request** feature lets them request one.

### What is Browse and Request?

It's a flow where:
1. Learner finds a course they want
2. They don't have an applicable subsidy
3. They submit a **request** for one
4. A company admin reviews and approves/denies
5. If approved, the learner can now enroll

### The Two Request Types

**Subscription License Request:**
- Learner asks: "Can I get a seat for this course?"
- Admin says: "Yes, here's your license" or "No"
- Stored in database as a `LicenseRequest`

**Learner Credit Request:**
- Learner asks: "Can I get some budget to take courses?"
- Admin says: "Yes, here's $X credit" or "No"
- Stored in database as a `LearnerCreditRequest`

### Enterprise Configuration

Not every enterprise supports both request types. The configuration is fetched via:
- `useBrowseAndRequestConfiguration()` hook (src/components/app/data/hooks/useBrowseAndRequest.ts:42-49)

This tells the app:
- Is license requesting enabled?
- Is learner credit requesting enabled?
- What's the help text/contact info for requests?

### Request States

A request goes through states:

```
PENDING (submitted, waiting for approval)
    ↓
┌─────────────────┐
│ APPROVED │ DENIED
│    ↓     │
│ APPROVED_NOT_USED (approved but learner didn't use it)
│    ↓
│ APPROVED_AND_USED
```

The hooks that fetch these requests:
- `useSubscriptionLicenseRequests()` - All license requests for this learner
- `useLearnerCreditRequests()` - All learner credit requests for this learner

Both are in src/components/app/data/hooks/useBrowseAndRequest.ts

---

## Detailed Walkthroughs

### Redemption Flow: Learner Already Has a Subsidy

Let's walk through what happens when Sarah visits a course detail page:

```
1. Sarah navigates to /acme-corp/course/cs101
   ↓
2. Route loader runs and prefetches data:
   - Course metadata (price, description, runs)
   - Sarah's subscriptions
   - Sarah's redeemable policies
   - Enterprise catalogs
   ↓
3. useCourseRedemptionEligibility hook runs:
   a) Is Sarah's subscription license applicable?
      - License activated? ✓
      - License current? ✓
      - Course in subscription catalog? ✓
      → YES, use subscription license

   b) Can Sarah redeem with her subscription?
      - Call queryCanRedeem API
      - Returns: { canRedeem: true, policy: {...} }

   c) Filter course runs:
      - Show unrestricted runs
      - Show enterprise-restricted runs she can redeem
      - Hide everything else
   ↓
4. Component renders:
   - Course title, description, reviews
   - Available course runs (filtered)
   - Price: FREE ← (subscription covers it)
   - "Enroll" button
   ↓
5. Sarah clicks "Enroll"
   ↓
6. submitRedemptionRequest API is called:
   POST /api/policy/{policy_uuid}/redeem/
   Body: { lms_user_id: 123, content_key: "course-v1:..." }
   ↓
7. Backend response:
   { transaction_status_url: "https://...", ... }
   ↓
8. App polls transaction_status_url to check enrollment status
   ↓
9. ✓ Enrollment successful!
   Sarah sees "You're enrolled" on the course page
```

**Code to find this flow:**
- Hook: `src/components/app/data/hooks/useCourseRedemptionEligibility.ts`
- Redemption API: `src/components/stateful-enroll/data/service.ts:35-48` (submitRedemptionRequest)
- Main component flow: Look for courses that use `useCourseRedemptionEligibility`

---

### Request Flow: Learner Doesn't Have a Subsidy

Now let's say Marcus visits a course but has no applicable subsidy:

```
1. Marcus navigates to /acme-corp/course/ds201
   ↓
2. Route loader runs and prefetches data
   ↓
3. useCourseRedemptionEligibility hook runs:
   a) Does Marcus have a subscription license?
      - No license or license not applicable
      → Check learner credit

   b) Does Marcus have learner credit policies?
      - No auto-applied policies available
      → Marcus can't enroll directly
   ↓
4. Browse and Request component renders instead:
   - "You don't have access to this course"
   - "Request a subscription license" button
   - "Request learner credit" button
   ↓
5. Marcus clicks "Request learner credit"
   ↓
6. useLearnerCreditRequests hook fetches existing requests
   ↓
7. If no pending request, Marcus fills out request form:
   - Reason for request (optional)
   - Preferred start date (optional)
   ↓
8. Form submission calls backend:
   POST /api/learner-credit-requests/
   Body: { enterprise_id: "...", user_email: "marcus@..." }
   ↓
9. Backend creates request with status: REQUESTED
   ↓
10. Admin sees request in dashboard:
    - Approves (assigns credit) or Denies
    ↓
11. If approved:
    - Marcus gets email: "Your request was approved"
    - Now Marcus's learner credit appears in his policy list
    - Marcus can enroll in the course
```

**Code to find this flow:**
- Browse and Request hooks: `src/components/app/data/hooks/useBrowseAndRequest.ts`
- Request fetching:
  - License requests: `src/components/app/data/hooks/useBrowseAndRequest.ts:55-72`
  - Learner credit requests: `src/components/app/data/hooks/useBrowseAndRequest.ts:102-119`

---

## Edge Cases & Special Scenarios

These are tricky situations the code handles:

### 1. Multiple Active Licenses (Same Plan)

**Scenario:** A learner somehow has two active licenses from the same plan.

**What happens:** Only one is used. The code picks the first activated license it finds.

**Reference:** `src/components/app/data/hooks/useCourseRedemptionEligibility.ts:107-108`
```typescript
const {
  // @ts-expect-error
  data: { subscriptionLicense },
} = useSubscriptions();
```

The `useSubscriptions()` hook returns a single `subscriptionLicense` object, not an array. If multiple exist, the backend returns only one (usually the most recently activated).

---

### 2. Expired Subsidies

**Scenario:** A subscription license or learner credit policy has an expiration date that has passed.

**License expiration:** `src/components/app/data/utils.js:1076-1082`
```typescript
export function determineSubscriptionLicenseApplicable(subscriptionLicense, catalogsWithCourse) {
  return (
    subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED
    && subscriptionLicense?.subscriptionPlan.isCurrent  // ← Must be current
    && catalogsWithCourse.includes(subscriptionLicense?.subscriptionPlan.enterpriseCatalogUuid)
  );
}
```

The `isCurrent` check verifies the license hasn't expired. If expired, `isCurrent` is false, and the license is not applicable.

**Policy expiration:** Each learner credit policy has a `subsidyExpirationDate`. The backend's "can redeem" check includes this in the response. If policy is expired, `canRedeem` returns false.

---

### 3. Assignment-Only Learners

**Scenario:** A learner has ONLY content assignments available (specific courses assigned to them), but NO:
- Active subscription license
- Auto-applied learner credit
- Approved license/credit requests
- Enterprise offers

**What happens:** These learners see only their assigned courses and can't browse/request. The UI hides the general course catalog.

**Reference:** `src/components/app/data/utils.js:106-137`
```typescript
export function determineLearnerHasContentAssignmentsOnly({
  subscriptionPlan,
  subscriptionLicense,
  licenseRequests,
  couponCodesCount,
  couponCodeRequests,
  redeemableLearnerCreditPolicies,
  hasCurrentEnterpriseOffers,
}) {
  const hasAssignments = hasAllocatedOrAcceptedAssignments(redeemableLearnerCreditPolicies);
  if (!hasAssignments) {
    return false;  // Has other subsidies or assignments
  }

  // Check for other subsidies...
  // If none found, return true (assignments-only learner)
  return true;
}
```

---

### 4. Restricted Course Runs

**Scenario:** A course has multiple runs. Some are unrestricted, some are enterprise-restricted, some are completely restricted.

**What happens:** The code filters based on subsidy type:
- **Unrestricted runs:** Always shown
- **Enterprise-restricted runs:** Only shown if learner has enterprise subsidy + can redeem
- **Other restrictions:** Always hidden

**Reference:** `src/components/app/data/hooks/useCourseRedemptionEligibility.ts:31-89`
```typescript
export function transformCourseRedemptionEligibility({
  courseMetadata,
  canRedeemData,
  courseRunKey,
  courseRunsForRedemption,
}) {
  // NOTE: The filtering here controls visibility of runs based on restriction type
  const availableCourseRuns = courseRunsForRedemption.filter((courseRunMetadata) => {
    if (!courseRunMetadata.restrictionType) {
      return true;  // No restriction
    }
    if (courseRunMetadata.restrictionType !== ENTERPRISE_RESTRICTION_TYPE) {
      return false;  // Other restrictions (corporate, etc)
    }
    // Enterprise restricted: check if learner can redeem
    const canRedeemRunData = canRedeemData.find(r => r.contentKey === courseRunMetadata.key);
    return !!canRedeemRunData?.canRedeem || !!canRedeemRunData?.hasSuccessfulRedemption;
  });

  return {
    availableCourseRuns,
    // ... other data
  };
}
```

---

### 5. Late Enrollment Buffer

**Scenario:** A course run has already started or is about to end. Should learners still be able to enroll?

**What happens:** The app checks a configurable **late enrollment buffer** (number of days after start date learners can still enroll).

**Reference:** `src/components/app/data/hooks/useCourseMetadata.ts:30, 44-48`
```typescript
const lateEnrollmentBufferDays = useLateEnrollmentBufferDays();

return useSuspenseQuery<CourseMetadata, Error, TData>(
  queryOptions({
    ...queryCourseMetadata(courseKey),
    select: (data) => {
      const availableCourseRuns = getAvailableCourseRuns({
        course: data,
        lateEnrollmentBufferDays,  // ← Passed to filter runs
        courseRunKey,
      });
```

The `getAvailableCourseRuns` utility (in `src/components/app/data/utils.js`) filters out runs that:
- Haven't started yet AND are not within `LATE_ENROLLMENTS_BUFFER_DAYS`
- Have already ended

---

### 6. Catalog Matching

**Scenario:** A course belongs to multiple enterprise catalogs. A learner's subscription covers only some of them.

**What happens:** The code checks if the course exists in ANY of the catalogs the learner's subsidy covers.

**Reference:** `src/components/app/data/utils.js:1069-1074`
```typescript
export function findCouponCodeForCourse(couponCodes, catalogList = []) {
  return couponCodes.find((couponCode) =>
    catalogList?.includes(couponCode.catalog)  // ← Course in this catalog?
    && hasValidStartExpirationDates({
      startDate: couponCode.couponStartDate,
      endDate: couponCode.couponEndDate,
    })
  );
}
```

Same logic applies to subscription licenses: `src/components/app/data/utils.js:1076-1082`
```typescript
export function determineSubscriptionLicenseApplicable(subscriptionLicense, catalogsWithCourse) {
  return (
    subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED
    && subscriptionLicense?.subscriptionPlan.isCurrent
    && catalogsWithCourse.includes(subscriptionLicense?.subscriptionPlan.enterpriseCatalogUuid)
    // ↑ Must be in the subscription's catalog
  );
}
```

The `catalogsWithCourse` array comes from a separate API call (`useEnterpriseCustomerContainsContent`) that checks which enterprise catalogs contain this course.

---

## Code Reference Guide

### Key Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useSubscriptions` | `src/components/app/data/hooks/useSubscriptions.ts` | Get learner's active subscription license |
| `useRedeemablePolicies` | `src/components/app/data/hooks/useRedeemablePolicies.ts` | Get learner's credit policies |
| `useCourseRedemptionEligibility` | `src/components/app/data/hooks/useCourseRedemptionEligibility.ts` | Check if course can be redeemed + determine which subsidy |
| `useCanUpgradeWithLearnerCredit` | `src/components/app/data/hooks/useCanUpgradeWithLearnerCredit.js` | Quick check for learner credit eligibility |
| `useBrowseAndRequest` | `src/components/app/data/hooks/useBrowseAndRequest.ts` | Get all browse & request data (config + requests) |
| `useBrowseAndRequestConfiguration` | `src/components/app/data/hooks/useBrowseAndRequest.ts:42-49` | Get what request types are enabled |
| `useSubscriptionLicenseRequests` | `src/components/app/data/hooks/useBrowseAndRequest.ts:55-72` | Get all license requests for learner |
| `useLearnerCreditRequests` | `src/components/app/data/hooks/useBrowseAndRequest.ts:102-119` | Get all learner credit requests for learner |

### Key Utility Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `determineSubscriptionLicenseApplicable` | `src/components/app/data/utils.js:1076-1082` | Is subscription license active & in course catalog? |
| `findCouponCodeForCourse` | `src/components/app/data/utils.js:1069-1074` | (Deprecated) Find matching coupon code |
| `determineEnterpriseCustomerUserForDisplay` | `src/components/app/data/utils.js:145-176` | Which enterprise user should we display? |
| `transformCourseRedemptionEligibility` | `src/components/app/data/hooks/useCourseRedemptionEligibility.ts:31-89` | Transform redemption data, filter runs |
| `determineLearnerHasContentAssignmentsOnly` | `src/components/app/data/utils.js:106-137` | Is learner assignment-only? |

### Key API Services

| Function | Location | Purpose |
|----------|----------|---------|
| `submitRedemptionRequest` | `src/components/stateful-enroll/data/service.ts:35-48` | Submit "enroll with subsidy" request |
| `retrieveTransactionStatus` | `src/components/stateful-enroll/data/service.ts:16-21` | Check enrollment transaction status |
| `queryCanRedeem` | `src/components/app/data/queries/queries.ts` | Query key for "can this learner redeem?" |

### How to Check Subsidy Eligibility in Your Component

```typescript
import useCourseRedemptionEligibility from '../data/hooks/useCourseRedemptionEligibility';

function MyCourseComponent() {
  const {
    data: {
      isPolicyRedemptionEnabled,
      redeemableSubsidyAccessPolicy,
      availableCourseRuns,
      listPrice,
    },
  } = useCourseRedemptionEligibility();

  if (!isPolicyRedemptionEnabled) {
    return <div>You don't have a subsidy for this course</div>;
  }

  return (
    <div>
      <p>Price: ${listPrice} (covered by your subsidy)</p>
      <p>Policy: {redeemableSubsidyAccessPolicy.displayName}</p>
    </div>
  );
}
```

### How to Test Subsidy Logic

Look at the test files for reference:
- `src/components/app/data/hooks/useCourseRedemptionEligibility.test.jsx`
- `src/components/app/data/hooks/useBrowseAndRequest.test.tsx`
- `src/components/app/data/utils.test.js`

These tests show how to:
- Mock subscription licenses
- Mock redeemable policies
- Mock "can redeem" API responses
- Test component behavior with different subsidy scenarios

---

## Summary

**Key takeaways:**

1. **Two active subsidy types:** Subscription License (company-assigned) and Learner Credit (budget-based)
2. **Priority order:** Subscription License > Learner Credit (use license first if available)
3. **Redemption:** App checks `useCourseRedemptionEligibility` to determine if learner can enroll and with which subsidy
4. **Browse & Request:** If learner lacks a subsidy, they can request one (license or credit)
5. **Edge cases:** Expired subsidies, course restrictions, late enrollment, catalog matching, and assignment-only learners are all handled by the redemption eligibility logic

When in doubt, start with `useCourseRedemptionEligibility` — it orchestrates all the subsidy logic for a course!
