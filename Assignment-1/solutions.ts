// Problem-1: 
function filterEvenNumbers(num : number[]):number[]{

    const evenNumber:number[]= num.filter(num => num % 2 === 0);

    return evenNumber;
}


//Problem-2:

function reverseString(initialString : string ): string{

    return initialString.split("").reverse().join("");
}


//Problem-3: 
type StringOrNumber = string | number;

function checkType(inputString: StringOrNumber) : string{
    if(typeof inputString === 'number'){
        return "Number";
    }
    else{
        return "String";
    }
}

//Problem-4:
const user = {
    id : 1,
    name: 'Farhan Islam',
    age: 22,
    height: 176

}
function getProperty<user,Key extends keyof user> (obj:user,key:Key){
    return obj[key];
}

//Problem-5
interface Book {
  title: string;
  author: string;
  publishedYear: number;
}

interface BookWithReadStatus extends Book {
  isRead: boolean;
}

function toggleReadStatus(book: Book): BookWithReadStatus {
  return {
    ...book,
    isRead: true,
  };
}
const myBook = { title: "TypeScript Guide", author: "Jane Doe", publishedYear: 2024 };

//Problem-6
class Person{
    name: string;
    age: number;
    constructor(name: string, age: number){
        this.name = name;
        this.age = age;
    }
}

class Student extends Person{
    grade: string;

    constructor(name : string, age: number, grade: string){
        super(name,age);
        this.grade=grade;
    }
    getDetails(): string{
        return `Name: ${this.name}, Age: ${this.age}, Grade: ${this.grade}`;
    }
}

//Problem-7:

function getIntersection(num1 : number[], num2 : number[]):number[]{

    const resultArray: number[] = num1.filter(num => num2.includes(num) );
    return resultArray;

}



