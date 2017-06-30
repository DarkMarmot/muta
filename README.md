# muta
component framework

## Overarching Goals

Facilitate large scale team dev in enterprise context by establishing clean, standardized protocol for disparate component communication/coordination.

### Single File Components

### Component Behavior Composition

* Attach abstract behaviors to entities (composition)
* Standard behavior lib
* Implies development of standardized interface for extending components

### Async Module Loading

* No build proc (ideally it's like a "client side build proc")
* Enable network fetch for libs on 3rd party domains

### Aliasing

* Abstraction layer for creating symoblic names for component paths
* Ability to shadow alias locally
* Network fetch for deps

## General Notes

* Component paths (urls) are super important
* Aliasing allows for flexible local scope, but brings the problem of global vars
