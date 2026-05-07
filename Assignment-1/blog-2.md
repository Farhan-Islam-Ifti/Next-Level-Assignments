# Four Pillars of OOP in TypeScript

## Introduction

OOP means Object Oriented Programming. In TypeScript, we use class and object to keep code organized. The four pillars of OOP help to make big code a little easier to manage.

## Inheritance

Inheritance means one class can use things from another class. It helps to reduce writing same code again.

```ts
class Person {
  name = "Farhan";
}

class Student extends Person {
  grade = "A";
}
```

Here `Student` can use `name` from `Person`.

## Polymorphism

Polymorphism means same method can give different result in different class.

```ts
class Animal {
  sound() {
    return "sound";
  }
}

class Dog extends Animal {
  sound() {
    return "bark";
  }
}
```

Here both have `sound()`, but result is different.

## Abstraction

Abstraction means hiding extra details and showing only important part.

```ts
abstract class Shape {
  abstract area(): number;
}
```

Here we only say that every shape should have `area()` method.

## Encapsulation

Encapsulation means keeping data safe inside class.

```ts
class Account {
  private balance = 0;
}
```

Here `balance` cannot be accessed directly from outside.

## Conclusion

OOP helps to keep TypeScript code cleaner. Inheritance reduces repeated code, polymorphism makes code flexible, abstraction hides details, and encapsulation keeps data safe.
