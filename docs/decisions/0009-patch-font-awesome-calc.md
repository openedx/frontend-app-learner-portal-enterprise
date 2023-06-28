# 0009. Patch the `font-awesome` NPM package to resolve deprecation warnings

## Context

This micro-frontend relies on `font-awesome` for some icons, either via class names or component-based with imported icons. `font-awesome` is technically deprecated throughout the Open edX platform in favor of relying on the icon set
provided by `@edx/paragon/icons`. That said, `font-awesome` is still used in some places throughout this repository.

While upgrading `@edx/frontend-build` to the latest version (v12.8.57), it was observed that `sass-loader` was upgraded from v12 to v13, which throws Dart Sass `@warn` messages as official Webpack warnings. The warnings are about the need to use `calc()` in some CSS calculations used throughout the `font-awesome` SCSS. These warnings began manifesting as full screen Webpack overlays on the application even though there is no actual error, which will cause confusion and frustration for developers working with this micro-frontend.

`sass-loader` provides an option `warnRuleAsWarning` that may be set to `false` to revert to the previous v12 behavior of only showing the `@warn` messages as console warnings instead of Webpack warnings.

## Decision

Instead of modifying the Webpack configuration to change the default behavior of `sass-loader`'s `warnRuleAsWarning` option, we will instead patch `font-awesome` to resolve the deprecation warnings `sass-loader` outputs by wrapping its previous uses of `/` for division with `calc(...)`, where appropriate. For example:

**Before**

```scss
.#{$fa-css-prefix}-li {
    top: (2em / 14);
}
```

**After**

```scss
.#{$fa-css-prefix}-li {
    top: calc(2em / 14);
}
```

By doing so, we will no longer see any deprecation warnings related to `font-awesome`, either as Webpack warnings or console warnings.

We are already on the latest version of the `font-awesome` library (v4.7.0), which was last published 7 years ago. Font Awesome has since moved away from `font-awesome` in favor of `@fortawesome/react-fontawesome`. However, given our use of Font Awesome is deprecated and should be replaced with icons from `@edx/paragon/icons` anyways, the effort to migrate from `font-awesome` to `@fortawesome/react-fontawesome` is not justified.

### Creating the patch

In order to create the patch of `font-awesome`, the deprecation warnings were resolved by modifying the appropriate files in the `node_modules/font-awesome` directory and then running:

```shell
npx patch-package font-awesome
```

This command generates a patch file that is automatically applied when running `npm install`, essentially persisting the temporary changes in the `node_modules` directory (i.e., even if the `node_modules` directory gets deleted and re-created).

## Alternatives Considered

* Disable the `warnRuleAsWarning` option in `sass-loader`. This approach would prevent the deprecation warnings from showing as the full screen error overlay; however, the deprecation warnings will continue to show as console warnings when running `npm start` and `npm run build`.
* Migrate from `font-awesome` to `@fortawesome/react-fontawesome`. This approach was discarded as we should generally be moving away from Font Awesome in favor of `@edx/paragon/icons`.
* Move away from `font-awesome` in favor of icons from `@edx/paragon/icons` as part of the changes introduced at the time of this writing. This approach was discarded as the undertaking to identify suitable replacements for all `font-awesome` icons in use throughout this repository is not in scope due to the potential cross-functional collaboration needed with the design team to assist in finding those suitable icon replacements.
