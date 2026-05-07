# Why `any` Is Risky and `unknown` Is Safer

## Introduction

In TypeScript, `any` and `unknown` are used when we are not sure about a value type. But `any` is risky because it removes type checking. `unknown` is safer because it asks us to check first.

## Why `any` Is a Problem

When we use `any`, TypeScript does not check the variable properly.

```ts
let value: any = 50;

value.toUpperCase();
```

This can give error when running because number does not have `toUpperCase()`.

## Why `unknown` Is Better

With `unknown`, we need to check the type before using it.

```ts
let value: unknown = "Hello";

if (typeof value === "string") {
  value.toUpperCase();
}
```

This is safer because TypeScript knows the value is string inside the `if` block.

## Type Narrowing

Type narrowing means checking the type and then using the value.

```ts
function check(value: unknown): string {
  if (typeof value === "number") {
    return "Number";
  }

  return "Not number";
}
```

Here TypeScript understands the type after checking.

## Conclusion

`any` is easy but unsafe. `unknown` is better because it forces us to check the type first. This helps to avoid simple mistakes in TypeScript code.
