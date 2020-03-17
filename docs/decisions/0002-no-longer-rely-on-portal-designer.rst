========================================
2. No longer rely on ``portal-designer``
========================================

******
Status
******

Accepted

*******
Context
*******

The ``portal-designer`` (or ``designer`` for short) service is a Wagtail/Django-based content management system (CMS) that was created in order to provide basic configuration data on a site-by-site basis for the Programs and Enterprise learner portal frontend applications. 

For example, an individual Enterprise Customer (e.g., "Pied Piper") would have an associated site and "Enterprise Page" created in ``designer`` in order to configure the learner portal for that Enterprise. The configuration data for an individual Enterprise Customer consists of:

* Enterprise Customer uuid (from the ``EnterpriseCustomer`` model in ``edx-enterprise`` / LMS)
* Enterprise Customer name
* Learning coordinator email address (exposes to enterprise learners in the learner portal)
* Branding configuration
    * Logo image
    * Banner colors (background/border)

As mentioned above, ``designer`` is also used to configure the Programs learner portals for each Master's degree for a given university partner (i.e., site). However, the configuration data for Programs differs from the configuration data for an Enterprise. For example, the learner portal for a Program might be configured to show links to program-related documents, render static text in the sidebar of that program's learner portal, or use custom background images in the banner.

Additionally, the ``designer`` service provides an API that is called during the build process for the Programs and Enterprise learner portals in order to gather the necessary configuration data for each Program or Enterprise learner portal.

However, by configuring the Programs and Enterprise learner portals in the same ``designer`` service, we introduced a somewhat tight coupling between Programs and Enterprise, despite the configuration data being different for each learner portal. Further, as time goes on, the configuration for Enterprise and Programs learner portals will likely continue to diverge.

Requirements for a Full-Featured CMS
====================================

The ``designer`` service is a customizable CMS based on Wagtail that could support granting access for Enterprise Admins to update the learner portal configuration for their associated Enterprise Customer with a self-service approach. However, this is not an explicit requirement at this time. Instead, we aim to provide some lightweight customizations to the learner portal for specific Enterprise Customers; these customizations will initially be done by internal admins (e.g., the ECS team).

That said, it is possible we may need to provide a more self-service solution to our Enterprise Customers in the future, or when the learner portal customizations become more complex. In this case, we may begin using to ``designer`` at that time. For now, though, using ``designer`` to support the lightweight customizations we provide today is not necessary.

Even then, we could build a new page within the Enterprise Admin Dashboard to support self-service customizations to an Enterprise Customer's learner portal configuration instead of utilizing a full-featured CMS. This would also mean that an Enterprise Admin would not need to use any services/products beyond the Admin Dashboard. 

Data Duplication for Enterprise Customer Configuration
======================================================

By configuring the Enterprise learner portal data through ``designer``, we inevitably introduced data duplication between ``designer`` and the Enterprise Customer configuration that is done through Django admin in the LMS (via ``edx-enterprise``).

The Enterprise Customer configuration done in Django admin already includes the majority of data the Enterprise learner portal relies on: the Enterprise Customer's uuid, name, and logo image. The same data needs to be configured in the ``designer`` service for each Enterprise Customer, leading to the data duplication across ``designer`` and the LMS.

********
Decision
********

Due to the challenges outlined above, the Enterprise learner portal will no longer rely on the ``designer`` service. Instead, the configuration data for an Enterprise learner portal will be added to the Django admin page within the LMS (via ``edx-enterprise``):

* Branding configuration for the banner
    * Fields for the background and border HEX color values will be added to the ``EnterpriseCustomerBrandingConfiguration`` model.
* Learning coordinator email address
    * A field for this data will be added to the ``EnterpriseCustomer`` model.
* A field will be added to the ``EnterpriseCustomer`` model to specify which Enterprise Customers have the learner portal enabled.

These changes within ``edx-enterprise`` will remove our data dependency on ``designer`` and allow us to instead fetch the necessary data for the Enterprise learner portal through existing API endpoint(s) in ``edx-enterprise``.

************
Consequences
************

The decision to no longer rely on the ``designer`` service to fetch the configuration data about an Enterprise learner portal has the following consequences:

1. Engineers and other internal teams (e.g., ECS) that configure the metadata for Enterprise Customers will not need to configure data in two separate places.
2. There will no longer be data duplication between the Enterprise Customer metadata defined in the LMS (via ``edx-enterprise``) and ``designer``. Instead, the configured data in the LMS will become the "source of truth" for the Enterprise learner portal.
3. Configuration for the Enterprise learner portal will no longer be tightly coupled to the configuration for the Programs learner portal.
4. The Enterprise engineering team will transition ownership of ``designer`` to the Programs team.
5. A tech debt ticket will be added to the Enterprise engineering backlog to remove any models/views/etc. related to Enterprise from the ``designer`` service (ENT-2553).

**********
References
**********

* https://github.com/edx/portal-designer/
* https://github.com/edx/portal-designer/blob/master/docs/decisions/0001-new-designer-service.rst
