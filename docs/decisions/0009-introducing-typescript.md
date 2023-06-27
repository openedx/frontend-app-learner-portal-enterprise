# Introducing TypeScript

## Status

Accepted

## Context

TypeScript is a strongly-typed superset of JavaScript that adds optional static type checking, class-based object-oriented programming, and other features to JavaScript.  

As we start to expand the scope of the data that Learner Portal uses, the limitations of plain Javascript are coming more into focus.  In order to support a changing landscape of course data, we would like to introduce TypeScript into the code base to facilitate the documentation and refactoring process.

Here are some of the advantages of TypeScript over JavaScript:

### Type safety
TypeScript helps catch errors at compile-time instead of runtime by adding type annotations to variables, functions, and classes. This can help prevent errors that might occur when dealing with large codebases.

### Better tooling support
TypeScript has better tooling support than JavaScript, with features like code navigation, auto-completion, and refactoring tools in popular code editors like Visual Studio Code.

### Improved code organization
TypeScript's class-based object-oriented programming model allows developers to organize code in a more structured and maintainable way.

### Easy adoption
TypeScript is a superset of JavaScript, which means that any valid JavaScript code is also valid TypeScript code. This makes it easy for developers to adopt TypeScript gradually, without needing to rewrite their entire codebase.

### Community support
TypeScript has a growing community of developers who contribute to its development, create libraries and tools, and provide support to other developers. This makes it easier for developers to learn and adopt TypeScript.

## Decision

We will prioritize using TypeScript in the following places:
* New code files
* Existing API endpoints (and their payloads)
* Components or Functions take a lot of parameters, or use parameters that are themselves complex objects

## Consequences

* Code that requires heavy contracts, whether that's functions/components with lots or parameters, or complex objects returned from backend API's, will become much more comprehensible and easier to work with in a modern programming IDE
* Because TypeScript is a superset of Javascript, the code does not need to be migrated all at once, but can be updated to TypeScript during the course of regular feature work.

## References

* https://www.typescriptlang.org/