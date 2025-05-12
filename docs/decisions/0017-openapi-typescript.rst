17. Automate Generation of TypeScript Types from OpenAPI Schemas
================================================================

Status
******

Accepted (Apr 2025)

Context
*******

Maintaining accurate and up-to-date TypeScript types for server-provided data is critical for developer productivity and application correctness. Currently, this type information is either manually defined or inconsistently inferred, which increases the risk of drift between backend and frontend contracts. Our supported backend services expose OpenAPI schemas via ``drf-spectacular``, making it feasible to automate type generation.

Decision
********

We will use the `openapi-typescript <https://github.com/drwpow/openapi-typescript>`_ library to generate TypeScript type definitions directly from OpenAPI specs. A new NPM script named ``generate-openapi-types`` will:

* Fetch the OpenAPI schema from supported services.
* Convert each schema into a ``<service>.openapi.d.ts`` file.
* Optionally import these types into a global types file for broader use.

This script will run on a daily cron job via a GitHub Actions workflow; if it generates diff changes, it will automatically open a pull request for review and integration.

Consequences
************

* Reduces developer effort in maintaining types manually.
* Ensures frontend type definitions stay consistent with backend contracts.
* Introduces a build-time dependency on OpenAPI schema availability.
* Generated types will be readily available for use across the codebase.

Alternatives Considered
***********************

* **Manual typing**: Requires ongoing effort, is error-prone, and doesn't scale well with API surface changes.
* **Shared type definitions package**: In the future, we may extract the generated types into a centralized package for broader reuse across Enterprise MFEs, but for now we'll keep them scoped to the repo where they're needed.
