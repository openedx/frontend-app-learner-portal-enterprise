============================================================
3. Move from static builds (Gatsby) to client-side React app
============================================================

******
Status
******

Accepted

*******
Context
*******

Currently, the Enterprise and Programs learner portals are created using Gatsby, a static site generator based on React. Gatsby works by sourcing data (e.g., from external APIs) and creates static web pages (i.e., HTML, CSS, JavaScript) during the build process. This contrasts from a standard React application (or "microfrontend") where data is fetched client-side, or after the app has already been loaded in the browser. The Enterprise and Programs learner portals both utilize a custom Gatsby plugin to fetch the necessary data about learner portal configurations from the ``portal-designer`` service (i.e., ``gatsby-source-portal-designer``).

**Note:** The Enterprise learner portal no longer sources its data from ``portal-designer``; instead, the data that the Enterprise learner portal depends on is now defined within the LMS (via ``edx-enterprise``). See `this ADR <0002-no-longer-rely-on-portal-designer.rst>`_ for more details.

Statically-built sites with Gatsby offer the following benefits over a client-side React app:

* **SEO.** Web crawlers can more easily parse the HTML source of a static site to understand what a given page is about, as opposed to a client-side app where the HTML is created via JavaScript on the fly.
* **Faster page load times.** Data is gathered during the build process and subsequently injected into the static pages; there's no need to fetch data client-side. Additionally, Gatsby prefetches pages when using its internal router, making page transitions quick.

Despite these primary benefits, using Gatsby comes with a few tradeoffs that influence whether it is the right choice for the Enterprise learner portal moving forward. At the time Gatsby was introduced, the Enterprise learner portal was essentially a single dashboard page for enterprise learners to see their current, upcoming, and completed course enrollments associated with their Enterprise. This page also contains basic branding specific to the Enterprise (i.e., logo, colors, etc.). However, as we build out a more robust learner experience within the Enterprise learner portal, we plan to add additional pages such as a search/filter course discovery experience and course detail pages. Each of these pages will persist the Enterprise Customer's logo, name, and branding.

Taking the course detail pages as an example, let's assume a worst-case scenario where we have 500 Enterprise Customers, each with a course catalog that grants access to all edX content (i.e., ~2500 courses). In this scenario, because each course detail page has branding that is unique to each individual Enterprise Customer, we would potentially need to build 1,250,000 static pages to support the course catalogs of those 500 Enterprise Customers. This would lead to long build times that would slow down development, testing, and rolling out production bug fixes.

An argument might be made that we could implement a hybrid approach, where we only build each course page once and dynamically fetch the Enterprise Customer's data (e.g., logo, name, branding) client-side. However, at that point, we would not really be taking full advantage of Gatsby as a static site generator. Resources online point to scenarios such as this, where most of an application uses dynamic data, as rationale for not using Gatsby (see References).

Additionally, as a statically-built site, whenever data is updated (e.g., a different logo is uploaded for an Enterprise Customer), a rebuild of the Enterprise learner portal would need to occur in order to pull in the data changes. This presents a potential scalability issue in terms of how we would be able support 500+ Enterprise Customers; we would likely need to build a mechanism that triggers a rebuild and redeploy of the Enterprise learner portal for any change to the data that the Enterprise learner portal depends on. By moving away from Gatsby and its static build process, any changes to the data by internal admins (e.g., the ECS team) will appear instantaneously within the Enterprise learner portal, without any engineering intervention. This is not as much of an issue for the Programs learner portal, as there are a more finite number of Programs when compared to the number of Enterprise Customers.

********
Decision
********

While it would be great if the Enterprise learner portal could take advantage of the benefits for using Gatsby (e.g., faster page loads), it does not make as much sense given the tradeoffs mentioned above. This is because the Enterprise learner portal relies mostly on dynamic data in such a way that would not allow us to realize the advantage of a statically rendered app. Additionally, the Enterprise learner portal does not have a requirement for supporting SEO best practices since it is used by existing customers (presumably with direct access to the URL) as opposed to a marketing site that will be crawled by search engine bots.

That said, we will be migrating the Enterprise learner portal off of Gatsby and its multi-site build process / infrastructure. Instead, the Enterprise learner portal will become a standard client-side React application (microfrontend) that utilizes many of the recent advancements in the frontend ecosystem at edX (e.g., ``@edx/frontend-build``, ``@edx/frontend-platform``). In addition, the Enterprise learner portal will no longer rely on the shared UI components in ``@edx/frontend-learner-portal-base``.

************
Consequences
************

* Rather than sourcing the necessary configuration data during the build process, data for the Enterprise learner portal will be fetched client-side as needed from the browser.
    * That said, we will want to be intentional about how we do client-side data fetching to reduce the amount of perceived loading time for the user.
    * Additionally, any updates to the data by internal admins (e.g., the ECS team) will propogate immediately instead of needing to trigger a rebuild/redeploy.
* The Enterprise learner portal will no longer use multi-site build process / infrastructure. Rather, the Enterprise learner portal will use the same build process and infrastructure as other standard microfrontends at edX.
* The Enterprise learner portal will begin using ``@edx/frontend-build`` and ``@edx/frontend-platform`` to be in line with other microfrontends at edX and reduce common boilerplate.
* Ownership of the ``gatsby-source-portal-designer`` Gatsby plugin and the ``@edx/frontend-learner-portal-base`` NPM package will be transitioned to the Programs engineering team(s).

**********
References
**********

* https://www.gatsbyjs.org/
* https://github.com/edx/gatsby-source-portal-designer
* https://github.com/edx/frontend-learner-portal-base
* https://dev.to/maniekm/when-not-to-use-gatsbyjs-oic
* https://blog.jakoblind.no/gatsby-vs-next/
* https://github.com/edx/frontend-platform
* https://github.com/edx/frontend-build
