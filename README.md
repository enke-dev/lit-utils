[![test and build](https://github.com/enke-dev/lit-utils/actions/workflows/main.yml/badge.svg)](https://github.com/enke-dev/lit-utils/actions/workflows/main.yml)

# Lit utils

A collection of utilities, directives and converters for working with Lit, a library for building web components.

The detailed documentation for now is inline in jsdocs. So just have a look at the source code.

## Installation

```bash
npm install -S @enke.dev/lit-utils
```

## Converters

Lit allows defining own attribute converters to handle custom data types.
Some converters are used more often, especially for attributes, that immitate standard non-primitive HTML attributes.

## Directives

Lit directives are a powerful way to extend the functionality of Lit templates. They allow you to create reusable pieces of logic.
Some repetetive patterns can be found as directives in this package.

## Types

Some useful types that are either used internally or moved from project to project before.

## Utils

Helpers for various occasions, like working with dates, form association, logging, or the `@lit-labs/router` package.
