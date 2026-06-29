import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient, Role } from '../generated/prisma/client';
import bcrypt from 'bcrypt';

import {
  cloneSyntaxRules,
  SYNTAX_RULE_PRESETS,
} from '../src/constants/syntax-rules.constant';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type TestCaseSeed = {
  studyCaseId: number;
  description: string;
  input: Prisma.InputJsonValue;
  expected: Prisma.InputJsonValue;
  order: number;
  isPublished?: boolean;
};

function html(value: string) {
  return value.trim();
}

async function upsertTestCase(data: TestCaseSeed) {
  await prisma.testCase.upsert({
    where: {
      studyCaseId_order: {
        studyCaseId: data.studyCaseId,
        order: data.order,
      },
    },
    update: {
      description: data.description,
      input: data.input,
      expected: data.expected,
      isPublished: data.isPublished ?? true,
    },
    create: {
      studyCaseId: data.studyCaseId,
      description: data.description,
      input: data.input,
      expected: data.expected,
      order: data.order,
      isPublished: data.isPublished ?? true,
    },
  });
}

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mahirjs.local' },
    update: {
      name: 'Admin Mahir.js',
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@mahirjs.local',
      name: 'Admin Mahir.js',
      password: hashedPassword,
      role: Role.ADMIN,
      bio: 'Mahir.js content administrator.',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@mahirjs.local' },
    update: {
      name: 'Student Demo',
      role: Role.STUDENT,
    },
    create: {
      email: 'student@mahirjs.local',
      name: 'Student Demo',
      password: hashedPassword,
      role: Role.STUDENT,
      bio: 'Demo student account.',
    },
  });

  console.log('✅ Users seeded', {
    admin: admin.email,
    student: student.email,
    password: 'password123',
  });

  const conceptConditional = await prisma.concept.upsert({
    where: { slug: 'conditional' },
    update: {
      title: 'Conditional',
      description:
        'Learn how to make decisions in JavaScript using if, else, and switch statements.',
      order: 1,
      isPublished: true,
    },
    create: {
      slug: 'conditional',
      title: 'Conditional',
      description:
        'Learn how to make decisions in JavaScript using if, else, and switch statements.',
      order: 1,
      isPublished: true,
    },
  });

  const conceptLooping = await prisma.concept.upsert({
    where: { slug: 'looping' },
    update: {
      title: 'Looping',
      description:
        'Learn how to repeat actions in JavaScript using for and while loops.',
      order: 2,
      isPublished: true,
    },
    create: {
      slug: 'looping',
      title: 'Looping',
      description:
        'Learn how to repeat actions in JavaScript using for and while loops.',
      order: 2,
      isPublished: true,
    },
  });

  const conceptFunction = await prisma.concept.upsert({
    where: { slug: 'function' },
    update: {
      title: 'Function',
      description:
        'Learn how to write reusable JavaScript code using function declarations and arrow functions.',
      order: 3,
      isPublished: true,
    },
    create: {
      slug: 'function',
      title: 'Function',
      description:
        'Learn how to write reusable JavaScript code using function declarations and arrow functions.',
      order: 3,
      isPublished: true,
    },
  });

  console.log('✅ Concepts seeded');

  const materialIfElse = await prisma.material.upsert({
    where: {
      conceptId_order: {
        conceptId: conceptConditional.id,
        order: 1,
      },
    },
    update: {
      slug: 'if-else',
      title: 'If and Else',
      description:
        'Learn how to execute different blocks of code based on a condition.',
      content: html(`
        <p>The <strong>if</strong> statement is used when a program needs to make a decision.</p>
        <p>If the condition is true, JavaScript runs the first block. If the condition is false, JavaScript can run the <strong>else</strong> block.</p>
        <pre><code class="language-js">const age = 18;

if (age &gt;= 18) {
  console.log('Adult');
} else {
  console.log('Minor');
}</code></pre>
        <p>In this material, you will practice returning different values based on a condition.</p>
      `),
      order: 1,
      isPublished: true,
    },
    create: {
      conceptId: conceptConditional.id,
      slug: 'if-else',
      title: 'If and Else',
      description:
        'Learn how to execute different blocks of code based on a condition.',
      content: html(`
        <p>The <strong>if</strong> statement is used when a program needs to make a decision.</p>
        <p>If the condition is true, JavaScript runs the first block. If the condition is false, JavaScript can run the <strong>else</strong> block.</p>
        <pre><code class="language-js">const age = 18;

if (age &gt;= 18) {
  console.log('Adult');
} else {
  console.log('Minor');
}</code></pre>
        <p>In this material, you will practice returning different values based on a condition.</p>
      `),
      order: 1,
      isPublished: true,
    },
  });

  const materialSwitch = await prisma.material.upsert({
    where: {
      conceptId_order: {
        conceptId: conceptConditional.id,
        order: 2,
      },
    },
    update: {
      slug: 'switch-statement',
      title: 'Switch Statement',
      description:
        'Learn how to match a value against several possible cases using switch.',
      content: html(`
        <p>The <strong>switch</strong> statement is useful when you want to compare one value with many possible cases.</p>
        <pre><code class="language-js">const role = 'admin';

switch (role) {
  case 'admin':
    console.log('Dashboard access');
    break;
  case 'student':
    console.log('Learning access');
    break;
  default:
    console.log('Unknown role');
}</code></pre>
        <p>Use switch when your condition depends on specific values.</p>
      `),
      order: 2,
      isPublished: true,
    },
    create: {
      conceptId: conceptConditional.id,
      slug: 'switch-statement',
      title: 'Switch Statement',
      description:
        'Learn how to match a value against several possible cases using switch.',
      content: html(`
        <p>The <strong>switch</strong> statement is useful when you want to compare one value with many possible cases.</p>
        <pre><code class="language-js">const role = 'admin';

switch (role) {
  case 'admin':
    console.log('Dashboard access');
    break;
  case 'student':
    console.log('Learning access');
    break;
  default:
    console.log('Unknown role');
}</code></pre>
        <p>Use switch when your condition depends on specific values.</p>
      `),
      order: 2,
      isPublished: true,
    },
  });

  const materialForLoop = await prisma.material.upsert({
    where: {
      conceptId_order: {
        conceptId: conceptLooping.id,
        order: 1,
      },
    },
    update: {
      slug: 'for-loop',
      title: 'For Loop',
      description:
        'Learn how to repeat code a specific number of times using a for loop.',
      content: html(`
        <p>A <strong>for loop</strong> is commonly used when you know how many times the code should run.</p>
        <pre><code class="language-js">for (let i = 0; i &lt; 5; i++) {
  console.log(i);
}</code></pre>
        <p>A for loop usually has an initial value, a condition, and an update expression.</p>
      `),
      order: 1,
      isPublished: true,
    },
    create: {
      conceptId: conceptLooping.id,
      slug: 'for-loop',
      title: 'For Loop',
      description:
        'Learn how to repeat code a specific number of times using a for loop.',
      content: html(`
        <p>A <strong>for loop</strong> is commonly used when you know how many times the code should run.</p>
        <pre><code class="language-js">for (let i = 0; i &lt; 5; i++) {
  console.log(i);
}</code></pre>
        <p>A for loop usually has an initial value, a condition, and an update expression.</p>
      `),
      order: 1,
      isPublished: true,
    },
  });

  const materialWhileLoop = await prisma.material.upsert({
    where: {
      conceptId_order: {
        conceptId: conceptLooping.id,
        order: 2,
      },
    },
    update: {
      slug: 'while-loop',
      title: 'While Loop',
      description: 'Learn how to repeat code while a condition remains true.',
      content: html(`
        <p>A <strong>while loop</strong> repeats code as long as the condition is true.</p>
        <pre><code class="language-js">let count = 3;

while (count &gt; 0) {
  console.log(count);
  count--;
}</code></pre>
        <p>Be careful to update the condition, otherwise the loop may never stop.</p>
      `),
      order: 2,
      isPublished: true,
    },
    create: {
      conceptId: conceptLooping.id,
      slug: 'while-loop',
      title: 'While Loop',
      description: 'Learn how to repeat code while a condition remains true.',
      content: html(`
        <p>A <strong>while loop</strong> repeats code as long as the condition is true.</p>
        <pre><code class="language-js">let count = 3;

while (count &gt; 0) {
  console.log(count);
  count--;
}</code></pre>
        <p>Be careful to update the condition, otherwise the loop may never stop.</p>
      `),
      order: 2,
      isPublished: true,
    },
  });

  const materialFunctionBasics = await prisma.material.upsert({
    where: {
      conceptId_order: {
        conceptId: conceptFunction.id,
        order: 1,
      },
    },
    update: {
      slug: 'function-basics',
      title: 'Function Basics',
      description:
        'Learn how to declare and call reusable JavaScript functions.',
      content: html(`
        <p>A <strong>function</strong> is a reusable block of code that performs a specific task.</p>
        <pre><code class="language-js">function greet(name) {
  return 'Hello, ' + name + '!';
}

greet('Ani');</code></pre>
        <p>Functions can receive parameters and return values.</p>
      `),
      order: 1,
      isPublished: true,
    },
    create: {
      conceptId: conceptFunction.id,
      slug: 'function-basics',
      title: 'Function Basics',
      description:
        'Learn how to declare and call reusable JavaScript functions.',
      content: html(`
        <p>A <strong>function</strong> is a reusable block of code that performs a specific task.</p>
        <pre><code class="language-js">function greet(name) {
  return 'Hello, ' + name + '!';
}

greet('Ani');</code></pre>
        <p>Functions can receive parameters and return values.</p>
      `),
      order: 1,
      isPublished: true,
    },
  });

  const materialArrowFunction = await prisma.material.upsert({
    where: {
      conceptId_order: {
        conceptId: conceptFunction.id,
        order: 2,
      },
    },
    update: {
      slug: 'arrow-function',
      title: 'Arrow Function',
      description:
        'Learn a shorter function syntax using JavaScript arrow functions.',
      content: html(`
        <p>An <strong>arrow function</strong> is a concise way to write a function.</p>
        <pre><code class="language-js">const double = (n) =&gt; {
  return n * 2;
};</code></pre>
        <p>Arrow functions are commonly used in modern JavaScript.</p>
      `),
      order: 2,
      isPublished: true,
    },
    create: {
      conceptId: conceptFunction.id,
      slug: 'arrow-function',
      title: 'Arrow Function',
      description:
        'Learn a shorter function syntax using JavaScript arrow functions.',
      content: html(`
        <p>An <strong>arrow function</strong> is a concise way to write a function.</p>
        <pre><code class="language-js">const double = (n) =&gt; {
  return n * 2;
};</code></pre>
        <p>Arrow functions are commonly used in modern JavaScript.</p>
      `),
      order: 2,
      isPublished: true,
    },
  });

  console.log('✅ Materials seeded');

  const scCheckAdult = await prisma.studyCase.upsert({
    where: {
      materialId_order: {
        materialId: materialIfElse.id,
        order: 1,
      },
    },
    update: {
      slug: 'check-adult',
      title: 'Check Adult',
      description:
        'Use the available variable `age`. Return `true` if age is 18 or above, otherwise return `false`.',
      hint: 'Compare `age` with 18. Return true when the condition is true, otherwise return false.',
      starterCode: `if (/* write your condition here */) {
  return /* value */;
} else {
  return /* value */;
}`,
      functionName: 'isAdult',
      parameterNames: ['age'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.IF_BODY_ONLY),
      isPublished: true,
    },
    create: {
      materialId: materialIfElse.id,
      slug: 'check-adult',
      title: 'Check Adult',
      description:
        'Use the available variable `age`. Return `true` if age is 18 or above, otherwise return `false`.',
      hint: 'Compare `age` with 18. Return true when the condition is true, otherwise return false.',
      order: 1,
      starterCode: `if (/* write your condition here */) {
  return /* value */;
} else {
  return /* value */;
}`,
      functionName: 'isAdult',
      parameterNames: ['age'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.IF_BODY_ONLY),
      isPublished: true,
    },
  });

  const scMaxOfTwo = await prisma.studyCase.upsert({
    where: {
      materialId_order: {
        materialId: materialIfElse.id,
        order: 2,
      },
    },
    update: {
      slug: 'max-of-two-numbers',
      title: 'Max of Two Numbers',
      description:
        'Use the available variables `a` and `b`. Return the larger number.',
      hint: 'Use an if statement to compare `a` and `b`.',
      starterCode: `if (/* write your condition here */) {
  return /* value */;
} else {
  return /* value */;
}`,
      functionName: 'maxOfTwo',
      parameterNames: ['a', 'b'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.IF_BODY_ONLY),
      isPublished: true,
    },
    create: {
      materialId: materialIfElse.id,
      slug: 'max-of-two-numbers',
      title: 'Max of Two Numbers',
      description:
        'Use the available variables `a` and `b`. Return the larger number.',
      hint: 'Use an if statement to compare `a` and `b`.',
      order: 2,
      starterCode: `if (/* write your condition here */) {
  return /* value */;
} else {
  return /* value */;
}`,
      functionName: 'maxOfTwo',
      parameterNames: ['a', 'b'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.IF_BODY_ONLY),
      isPublished: true,
    },
  });

  const scDayName = await prisma.studyCase.upsert({
    where: {
      materialId_order: {
        materialId: materialSwitch.id,
        order: 1,
      },
    },
    update: {
      slug: 'day-name',
      title: 'Day Name',
      description:
        "Use the available variable `day`. Return the day name for numbers 1 to 7 and return 'Invalid' for other numbers.",
      hint: 'Use switch(day), then write cases from 1 to 7.',
      starterCode: `switch (day) {
  // write your cases here
  default:
    return 'Invalid';
}`,
      functionName: 'getDayName',
      parameterNames: ['day'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.SWITCH_BODY_ONLY),
      isPublished: true,
    },
    create: {
      materialId: materialSwitch.id,
      slug: 'day-name',
      title: 'Day Name',
      description:
        "Use the available variable `day`. Return the day name for numbers 1 to 7 and return 'Invalid' for other numbers.",
      hint: 'Use switch(day), then write cases from 1 to 7.',
      order: 1,
      starterCode: `switch (day) {
  // write your cases here
  default:
    return 'Invalid';
}`,
      functionName: 'getDayName',
      parameterNames: ['day'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.SWITCH_BODY_ONLY),
      isPublished: true,
    },
  });

  const scSumArray = await prisma.studyCase.upsert({
    where: {
      materialId_order: {
        materialId: materialForLoop.id,
        order: 1,
      },
    },
    update: {
      slug: 'sum-of-array',
      title: 'Sum of Array',
      description:
        'Use the available variable `numbers`. Return the total sum of all numbers in the array.',
      hint: 'Create a total variable, loop through numbers, add each number, then return total.',
      starterCode: `let total = 0;

for (let i = 0; i < numbers.length; i++) {
  // add each number to total
}

return total;`,
      functionName: 'sumArray',
      parameterNames: ['numbers'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.FOR_LOOP_BODY_ONLY),
      isPublished: true,
    },
    create: {
      materialId: materialForLoop.id,
      slug: 'sum-of-array',
      title: 'Sum of Array',
      description:
        'Use the available variable `numbers`. Return the total sum of all numbers in the array.',
      hint: 'Create a total variable, loop through numbers, add each number, then return total.',
      order: 1,
      starterCode: `let total = 0;

for (let i = 0; i < numbers.length; i++) {
  // add each number to total
}

return total;`,
      functionName: 'sumArray',
      parameterNames: ['numbers'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.FOR_LOOP_BODY_ONLY),
      isPublished: true,
    },
  });

  const scFizzBuzz = await prisma.studyCase.upsert({
    where: {
      materialId_order: {
        materialId: materialForLoop.id,
        order: 2,
      },
    },
    update: {
      slug: 'fizz-buzz',
      title: 'FizzBuzz',
      description:
        "Use the available variable `n`. Return an array from 1 to n. Replace multiples of 3 with 'Fizz', multiples of 5 with 'Buzz', and multiples of both with 'FizzBuzz'.",
      hint: 'Check multiples of both 3 and 5 first.',
      starterCode: `const result = [];

for (let i = 1; i <= n; i++) {
  // add Fizz, Buzz, FizzBuzz, or the number
}

return result;`,
      functionName: 'fizzBuzz',
      parameterNames: ['n'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.FOR_LOOP_BODY_ONLY),
      isPublished: true,
    },
    create: {
      materialId: materialForLoop.id,
      slug: 'fizz-buzz',
      title: 'FizzBuzz',
      description:
        "Use the available variable `n`. Return an array from 1 to n. Replace multiples of 3 with 'Fizz', multiples of 5 with 'Buzz', and multiples of both with 'FizzBuzz'.",
      hint: 'Check multiples of both 3 and 5 first.',
      order: 2,
      starterCode: `const result = [];

for (let i = 1; i <= n; i++) {
  // add Fizz, Buzz, FizzBuzz, or the number
}

return result;`,
      functionName: 'fizzBuzz',
      parameterNames: ['n'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.FOR_LOOP_BODY_ONLY),
      isPublished: true,
    },
  });

  const scCountdown = await prisma.studyCase.upsert({
    where: {
      materialId_order: {
        materialId: materialWhileLoop.id,
        order: 1,
      },
    },
    update: {
      slug: 'count-down',
      title: 'Countdown',
      description:
        'Use the available variable `n`. Return an array counting down from n to 1.',
      hint: 'While n is greater than 0, push n into the array and decrease n.',
      starterCode: `const result = [];

while (n > 0) {
  // add n to result
  // decrease n
}

return result;`,
      functionName: 'countdown',
      parameterNames: ['n'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.WHILE_LOOP_BODY_ONLY),
      isPublished: true,
    },
    create: {
      materialId: materialWhileLoop.id,
      slug: 'count-down',
      title: 'Countdown',
      description:
        'Use the available variable `n`. Return an array counting down from n to 1.',
      hint: 'While n is greater than 0, push n into the array and decrease n.',
      order: 1,
      starterCode: `const result = [];

while (n > 0) {
  // add n to result
  // decrease n
}

return result;`,
      functionName: 'countdown',
      parameterNames: ['n'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.WHILE_LOOP_BODY_ONLY),
      isPublished: true,
    },
  });

  const scGreet = await prisma.studyCase.upsert({
    where: {
      materialId_order: {
        materialId: materialFunctionBasics.id,
        order: 1,
      },
    },
    update: {
      slug: 'greet-user',
      title: 'Greet User',
      description:
        "Write a function `greet` that receives a `name` string and returns 'Hello, {name}!'.",
      hint: 'Declare a function named greet with one parameter called name.',
      starterCode: `function greet(name) {
  // return greeting here
}`,
      functionName: 'greet',
      parameterNames: ['name'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.FUNCTION_DECLARATION),
      isPublished: true,
    },
    create: {
      materialId: materialFunctionBasics.id,
      slug: 'greet-user',
      title: 'Greet User',
      description:
        "Write a function `greet` that receives a `name` string and returns 'Hello, {name}!'.",
      hint: 'Declare a function named greet with one parameter called name.',
      order: 1,
      starterCode: `function greet(name) {
  // return greeting here
}`,
      functionName: 'greet',
      parameterNames: ['name'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.FUNCTION_DECLARATION),
      isPublished: true,
    },
  });

  const scDouble = await prisma.studyCase.upsert({
    where: {
      materialId_order: {
        materialId: materialArrowFunction.id,
        order: 1,
      },
    },
    update: {
      slug: 'double-the-number',
      title: 'Double the Number',
      description:
        'Write an arrow function `double` that receives a number `n` and returns n multiplied by 2.',
      hint: 'Create const double = (n) => { ... } and return n * 2.',
      starterCode: `const double = (n) => {
  // return doubled number here
};`,
      functionName: 'double',
      parameterNames: ['n'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.ARROW_FUNCTION),
      isPublished: true,
    },
    create: {
      materialId: materialArrowFunction.id,
      slug: 'double-the-number',
      title: 'Double the Number',
      description:
        'Write an arrow function `double` that receives a number `n` and returns n multiplied by 2.',
      hint: 'Create const double = (n) => { ... } and return n * 2.',
      order: 1,
      starterCode: `const double = (n) => {
  // return doubled number here
};`,
      functionName: 'double',
      parameterNames: ['n'],
      syntaxRules: cloneSyntaxRules(SYNTAX_RULE_PRESETS.ARROW_FUNCTION),
      isPublished: true,
    },
  });

  console.log('✅ Study cases seeded');

  await Promise.all([
    upsertTestCase({
      studyCaseId: scCheckAdult.id,
      description: 'should return true for age 18',
      input: { age: 18 },
      expected: { result: true },
      order: 1,
      isPublished: true,
    }),
    upsertTestCase({
      studyCaseId: scCheckAdult.id,
      description: 'should return true for age 25',
      input: { age: 25 },
      expected: { result: true },
      order: 2,
      isPublished: true,
    }),
    upsertTestCase({
      studyCaseId: scCheckAdult.id,
      description: 'should return false for age 17',
      input: { age: 17 },
      expected: { result: false },
      order: 3,
      isPublished: true,
    }),

    upsertTestCase({
      studyCaseId: scMaxOfTwo.id,
      description: 'should return 5 when comparing 3 and 5',
      input: { a: 3, b: 5 },
      expected: { result: 5 },
      order: 1,
      isPublished: true,
    }),
    upsertTestCase({
      studyCaseId: scMaxOfTwo.id,
      description: 'should return 10 when comparing 10 and 2',
      input: { a: 10, b: 2 },
      expected: { result: 10 },
      order: 2,
      isPublished: true,
    }),
    upsertTestCase({
      studyCaseId: scMaxOfTwo.id,
      description: 'should return 4 when both values are equal',
      input: { a: 4, b: 4 },
      expected: { result: 4 },
      order: 3,
      isPublished: true,
    }),

    upsertTestCase({
      studyCaseId: scDayName.id,
      description: 'should return Monday for 1',
      input: { day: 1 },
      expected: { result: 'Monday' },
      order: 1,
      isPublished: true,
    }),
    upsertTestCase({
      studyCaseId: scDayName.id,
      description: 'should return Sunday for 7',
      input: { day: 7 },
      expected: { result: 'Sunday' },
      order: 2,
      isPublished: true,
    }),
    upsertTestCase({
      studyCaseId: scDayName.id,
      description: 'should return Invalid for 8',
      input: { day: 8 },
      expected: { result: 'Invalid' },
      order: 3,
      isPublished: true,
    }),

    upsertTestCase({
      studyCaseId: scSumArray.id,
      description: 'should return 6 for [1, 2, 3]',
      input: { numbers: [1, 2, 3] },
      expected: { result: 6 },
      order: 1,
      isPublished: true,
    }),
    upsertTestCase({
      studyCaseId: scSumArray.id,
      description: 'should return 0 for empty array',
      input: { numbers: [] },
      expected: { result: 0 },
      order: 2,
      isPublished: true,
    }),
    upsertTestCase({
      studyCaseId: scSumArray.id,
      description: 'should return 15 for [1, 2, 3, 4, 5]',
      input: { numbers: [1, 2, 3, 4, 5] },
      expected: { result: 15 },
      order: 3,
      isPublished: true,
    }),

    upsertTestCase({
      studyCaseId: scFizzBuzz.id,
      description: 'should return correct array for n = 5',
      input: { n: 5 },
      expected: { result: [1, 2, 'Fizz', 4, 'Buzz'] },
      order: 1,
      isPublished: true,
    }),
    upsertTestCase({
      studyCaseId: scFizzBuzz.id,
      description: 'should return FizzBuzz for n = 15',
      input: { n: 15 },
      expected: {
        result: [
          1,
          2,
          'Fizz',
          4,
          'Buzz',
          'Fizz',
          7,
          8,
          'Fizz',
          'Buzz',
          11,
          'Fizz',
          13,
          14,
          'FizzBuzz',
        ],
      },
      order: 2,
      isPublished: true,
    }),

    upsertTestCase({
      studyCaseId: scCountdown.id,
      description: 'should return [3, 2, 1] for n = 3',
      input: { n: 3 },
      expected: { result: [3, 2, 1] },
      order: 1,
      isPublished: true,
    }),
    upsertTestCase({
      studyCaseId: scCountdown.id,
      description: 'should return [1] for n = 1',
      input: { n: 1 },
      expected: { result: [1] },
      order: 2,
      isPublished: true,
    }),

    upsertTestCase({
      studyCaseId: scGreet.id,
      description: "should return 'Hello, Ani!' for name Ani",
      input: { name: 'Ani' },
      expected: { result: 'Hello, Ani!' },
      order: 1,
      isPublished: true,
    }),
    upsertTestCase({
      studyCaseId: scGreet.id,
      description: "should return 'Hello, Budi!' for name Budi",
      input: { name: 'Budi' },
      expected: { result: 'Hello, Budi!' },
      order: 2,
      isPublished: true,
    }),

    upsertTestCase({
      studyCaseId: scDouble.id,
      description: 'should return 10 for n = 5',
      input: { n: 5 },
      expected: { result: 10 },
      order: 1,
      isPublished: true,
    }),
    upsertTestCase({
      studyCaseId: scDouble.id,
      description: 'should return 0 for n = 0',
      input: { n: 0 },
      expected: { result: 0 },
      order: 2,
      isPublished: true,
    }),
  ]);

  console.log('✅ Test cases seeded');

  await prisma.conceptProgress.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: student.id,
        conceptId: conceptConditional.id,
      },
      {
        userId: student.id,
        conceptId: conceptLooping.id,
      },
      {
        userId: student.id,
        conceptId: conceptFunction.id,
      },
    ],
  });

  await prisma.materialProgress.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: student.id,
        materialId: materialIfElse.id,
      },
      {
        userId: student.id,
        materialId: materialSwitch.id,
      },
      {
        userId: student.id,
        materialId: materialForLoop.id,
      },
      {
        userId: student.id,
        materialId: materialWhileLoop.id,
      },
      {
        userId: student.id,
        materialId: materialFunctionBasics.id,
      },
      {
        userId: student.id,
        materialId: materialArrowFunction.id,
      },
    ],
  });

  await prisma.studyCaseProgress.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: student.id,
        studyCaseId: scCheckAdult.id,
      },
      {
        userId: student.id,
        studyCaseId: scMaxOfTwo.id,
      },
      {
        userId: student.id,
        studyCaseId: scDayName.id,
      },
      {
        userId: student.id,
        studyCaseId: scSumArray.id,
      },
      {
        userId: student.id,
        studyCaseId: scFizzBuzz.id,
      },
      {
        userId: student.id,
        studyCaseId: scCountdown.id,
      },
      {
        userId: student.id,
        studyCaseId: scGreet.id,
      },
      {
        userId: student.id,
        studyCaseId: scDouble.id,
      },
    ],
  });

  console.log('✅ Progress records seeded');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
