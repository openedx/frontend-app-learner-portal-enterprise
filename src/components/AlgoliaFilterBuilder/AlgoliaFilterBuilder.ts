import { features } from '../../config';

/**
 * A fluent builder for constructing structured Algolia-compatible filter strings.
 *
 * This class helps compose complex query filters using `AND`, `OR`, negation (`andRaw`),
 * and conditional logic like `filterByCatalogUuids()` or `excludeVideoContentIfFeatureDisabled()`.
 *
 * Useful for dynamic, user-driven search UIs where filters must be assembled programmatically.
 *
 * Example:
 * ```ts
 * const filter = new AlgoliaFilterBuilder()
 *   .and('type', 'course')
 *   .or('level', ['beginner', 'intermediate'])
 *   .andRaw('NOT content_type:video')
 *   .filterByCatalogUuids(['c1', 'c2'])
 *   .build();
 *
 * // Result:
 * // "type:course AND (level:beginner OR level:intermediate) AND NOT
 * // content_type:video AND (enterprise_catalog_uuids:c1 OR enterprise_catalog_uuids:c2)"
 * ```
 *
 * Available methods:
 * - `.and(attribute, value)`
 * - `.or(attribute, values[])`
 * - `.andRaw(clause)`
 * - `.filterByCatalogQueryUuids(...)`
 * - `.filterByCatalogUuids(...)`
 * - `.filterByEnterpriseCustomerUuid(...)`
 * - `.excludeVideoContentIfFeatureDisabled()`
 * - `.build()`
 */
export default class AlgoliaFilterBuilder {
  private filters: string[] = [];

  /**
   * Adds an AND clause with a single `attribute:value` pair.
   *
   * @param attribute - The name of the attribute to filter on.
   * @param value - The value the attribute must match.
   * @returns The current AlgoliaFilterBuilder instance for chaining.
   *
   * @example
   *   new AlgoliaFilterBuilder().and('type', 'course').build()
   *   // → "type:course"
   */
  and(attribute: string, value: string) {
    if (attribute && value) {
      this.filters.push(`${attribute}:${value}`);
    }
    return this;
  }

  /**
   * Adds an OR group for a single attribute with multiple values.
   *
   * @param attribute - The name of the attribute to filter on.
   * @param values - An array of values for which to construct the OR clause.
   * @returns The current AlgoliaFilterBuilder instance for chaining.
   *
   * @example
   *   new AlgoliaFilterBuilder().or('level', ['beginner', 'intermediate']).build()
   *   // → "(level:beginner OR level:intermediate)"
   */
  or(attribute: string, values: string[]) {
    const validValues = values.filter(Boolean);
    if (attribute && validValues.length > 0) {
      const clause = validValues.map(v => `${attribute}:${v}`).join(' OR ');
      this.filters.push(`(${clause})`);
    }
    return this;
  }

  /**
   * Adds a custom raw clause (e.g., negations, ranges, or advanced syntax).
   *
   * @param clause - A raw filter clause to include as-is.
   * @returns The current AlgoliaFilterBuilder instance for chaining.
   *
   * @example
   *   new AlgoliaFilterBuilder().andRaw('NOT content_type:video').build()
   *   // → "NOT content_type:video"
   */
  andRaw(clause: string) {
    if (clause && clause.trim().length > 0) {
      this.filters.push(clause);
    }
    return this;
  }

  /**
   * Adds a filter using mapped catalog query UUIDs for the given search catalogs.
   *
   * @param searchCatalogs - Array of catalog UUIDs from the search context.
   * @param catalogUuidsToCatalogQueryUuids - Mapping from catalog UUID → query UUID.
   * @returns The current AlgoliaFilterBuilder instance for chaining.
   *
   * @example
   *   const catalogs = ['cat1', 'cat2'];
   *   const mapping = { cat1: 'q1', cat2: 'q2' };
   *   new AlgoliaFilterBuilder().filterByCatalogQueryUuids(catalogs, mapping).build()
   *   // → "(enterprise_catalog_query_uuids:q1 OR enterprise_catalog_query_uuids:q2)"
   */
  filterByCatalogQueryUuids(
    searchCatalogs: string[],
    catalogUuidsToCatalogQueryUuids: Record<string, string>,
  ) {
    const resolvedUuids = searchCatalogs
      .map(catalog => catalogUuidsToCatalogQueryUuids[catalog])
      .filter(Boolean);

    return this.or('enterprise_catalog_query_uuids', resolvedUuids);
  }

  /**
   * Conditionally excludes video content using the `FEATURE_ENABLE_VIDEO_CATALOG` flag.
   * Adds the clause `NOT content_type:video` if the feature is disabled.
   *
   * @returns The current AlgoliaFilterBuilder instance for chaining.
   *
   * @example
   *   new AlgoliaFilterBuilder().excludeVideoContentIfFeatureDisabled().build()
   *   // → "NOT content_type:video" (if feature flag is off)
   *   // → "" (if feature flag is on)
   */
  excludeVideoContentIfFeatureDisabled() {
    if (!features.FEATURE_ENABLE_VIDEO_CATALOG) {
      this.andRaw('NOT content_type:video');
    }
    return this;
  }

  /**
   * Adds a filter for a single enterprise customer UUID.
   *
   * @param uuid - The UUID of the enterprise customer.
   * @returns The current AlgoliaFilterBuilder instance for chaining.
   *
   * @example
   *   new AlgoliaFilterBuilder().filterByEnterpriseCustomerUuid('abc-123').build()
   *   // → "enterprise_customer_uuids:abc-123"
   */
  filterByEnterpriseCustomerUuid(uuid: string) {
    if (uuid) {
      this.and('enterprise_customer_uuids', uuid);
    }
    return this;
  }

  /**
   * Adds a filter for one or more catalog UUIDs.
   *
   * @param uuids - Array of catalog UUIDs to include.
   * @returns The current AlgoliaFilterBuilder instance for chaining.
   *
   * @example
   *   new AlgoliaFilterBuilder().filterByCatalogUuids(['c1', 'c2']).build()
   *   // → "(enterprise_catalog_uuids:c1 OR enterprise_catalog_uuids:c2)"
   */
  filterByCatalogUuids(uuids: string[]) {
    return this.or('enterprise_catalog_uuids', uuids);
  }

  /**
   * Builds and returns the final Algolia-compatible filter string.
   *
   * @returns A complete filter expression with `AND`-joined clauses.
   *
   * @example
   *   new AlgoliaFilterBuilder()
   *     .and('type', 'course')
   *     .or('level', ['beginner', 'intermediate'])
   *     .andRaw('NOT content_type:video')
   *     .build()
   *   // → "type:course AND (level:beginner OR level:intermediate) AND NOT content_type:video"
   */
  build() {
    return this.filters.join(' AND ');
  }
}
