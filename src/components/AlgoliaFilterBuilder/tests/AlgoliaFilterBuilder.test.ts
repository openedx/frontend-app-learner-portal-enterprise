import AlgoliaFilterBuilder from '../AlgoliaFilterBuilder';
import { features } from '../../../config';

jest.mock('../../../config', () => ({
  ...jest.requireActual('../../../config'),
  features: {
    FEATURE_ENABLE_VIDEO_CATALOG: false,
  },
}));

describe('AlgoliaFilterBuilder', () => {
  it('builds a basic AND clause', () => {
    const result = new AlgoliaFilterBuilder().and('type', 'course').build();
    expect(result).toBe('type:course');
  });

  it('builds an OR clause with multiple values', () => {
    const result = new AlgoliaFilterBuilder().or('level', ['beginner', 'intermediate']).build();
    expect(result).toBe('(level:beginner OR level:intermediate)');
  });

  it('handles raw negation clauses', () => {
    const result = new AlgoliaFilterBuilder().andRaw('NOT content_type:video').build();
    expect(result).toBe('NOT content_type:video');
  });

  it('chains multiple filters correctly', () => {
    const result = new AlgoliaFilterBuilder()
      .and('type', 'course')
      .or('level', ['beginner', 'advanced'])
      .andRaw('NOT content_type:video')
      .build();

    expect(result).toBe('type:course AND (level:beginner OR level:advanced) AND NOT content_type:video');
  });

  it('skips empty values in or()', () => {
    const result = new AlgoliaFilterBuilder().or('level', []).build();
    expect(result).toBe('');
  });

  it('returns empty string when no filters are applied', () => {
    const result = new AlgoliaFilterBuilder().build();
    expect(result).toBe('');
  });

  it('builds filter with enterprise UUID only (no search catalogs)', () => {
    const result = new AlgoliaFilterBuilder()
      .filterByEnterpriseCustomerUuid('ent-123')
      .excludeVideoContentIfFeatureDisabled()
      .build();

    expect(result).toBe('enterprise_customer_uuids:ent-123 AND NOT content_type:video');
  });

  it('builds OR filter for multiple catalog UUIDs', () => {
    const result = new AlgoliaFilterBuilder()
      .filterByCatalogUuids(['cat1', 'cat2'])
      .excludeVideoContentIfFeatureDisabled()
      .build();

    expect(result).toBe('(enterprise_catalog_uuids:cat1 OR enterprise_catalog_uuids:cat2) AND NOT content_type:video');
  });

  it('builds OR filter from mapped catalog query UUIDs', () => {
    const searchCatalogs = ['cat1', 'cat2', 'catX'];
    const mapping = {
      cat1: 'q1',
      cat2: 'q2',
    };

    const result = new AlgoliaFilterBuilder()
      .filterByCatalogQueryUuids(searchCatalogs, mapping)
      .excludeVideoContentIfFeatureDisabled()
      .build();

    expect(result)
      .toBe(
        '(enterprise_catalog_query_uuids:q1 OR enterprise_catalog_query_uuids:q2) AND NOT content_type:video',
      );
  });

  it.each([true, false])(
    'builds correct filter when FEATURE_ENABLE_VIDEO_CATALOG is %s',
    (featureFlag) => {
      features.FEATURE_ENABLE_VIDEO_CATALOG = featureFlag;

      const result = new AlgoliaFilterBuilder()
        .filterByEnterpriseCustomerUuid('ent-123')
        .excludeVideoContentIfFeatureDisabled()
        .build();

      if (featureFlag) {
        expect(result).toBe('enterprise_customer_uuids:ent-123');
      } else {
        expect(result).toBe('enterprise_customer_uuids:ent-123 AND NOT content_type:video');
      }
    },
  );

  it('filters by metadata language if locale is provided', () => {
    const result = new AlgoliaFilterBuilder()
      .filterByMetadataLanguage('es')
      .build();
    expect(result).toBe('metadata_language:es');
  });

  it('skips metadata language filter if locale is empty', () => {
    const result = new AlgoliaFilterBuilder()
      .filterByMetadataLanguage('')
      .build();
    expect(result).toBe('');
  });
});
