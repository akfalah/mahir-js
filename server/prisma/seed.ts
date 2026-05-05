import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../generated/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================================
  // USERS
  // ============================================================
  const hashedPassword = await bcrypt.hash('password123', 10);

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      name: 'Budi Santoso',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Ani Rahayu',
      password: hashedPassword,
      role: Role.STUDENT,
    },
  });

  console.log('✅ Users seeded');

  // ============================================================
  // CONCEPTS
  // ============================================================
  const conceptConditional = await prisma.concept.upsert({
    where: { slug: 'conditional' },
    update: {},
    create: {
      slug: 'conditional',
      title: 'Conditional',
      description:
        'Learn how to make decisions in your code using if, else, and switch statements.',
      order: 1,
    },
  });

  const conceptLooping = await prisma.concept.upsert({
    where: { slug: 'looping' },
    update: {},
    create: {
      slug: 'looping',
      title: 'Looping',
      description:
        'Learn how to repeat actions using for, while, and do-while loops.',
      order: 2,
    },
  });

  const conceptFunction = await prisma.concept.upsert({
    where: { slug: 'function' },
    update: {},
    create: {
      slug: 'function',
      title: 'Function',
      description:
        'Learn how to write reusable blocks of code using functions.',
      order: 3,
    },
  });

  console.log('✅ Concepts seeded');

  // ============================================================
  // MATERIALS — CONDITIONAL
  // ============================================================
  const materialIfElse = await prisma.material.upsert({
    where: { conceptId_order: { conceptId: conceptConditional.id, order: 1 } },
    update: {},
    create: {
      conceptId: conceptConditional.id,
      slug: 'if-else',
      title: 'If & Else',
      content: `
        # If & Else

        The \`if\` statement executes a block of code only when a condition is true.
        The \`else\` block runs when the condition is false.

        \`\`\`js
        if (condition) {
          // runs when true
        } else {
          // runs when false
        }
        \`\`\`

        ## Example

        \`\`\`js
        const age = 18;
        if (age >= 18) {
          console.log("Adult");
        } else {
          console.log("Minor");
        }
        \`\`\`
      `.trim(),
      order: 1,
    },
  });

  const materialSwitch = await prisma.material.upsert({
    where: { conceptId_order: { conceptId: conceptConditional.id, order: 2 } },
    update: {},
    create: {
      conceptId: conceptConditional.id,
      slug: 'switch',
      title: 'Switch Statement',
      content: `
        # Switch Statement

        Use \`switch\` when you have many specific values to check against one variable.

        \`\`\`js
        switch (value) {
          case 'a':
            // ...
            break;
          default:
            // ...
        }
        \`\`\`
      `.trim(),
      order: 2,
    },
  });

  // ============================================================
  // MATERIALS — LOOPING
  // ============================================================
  const materialForLoop = await prisma.material.upsert({
    where: { conceptId_order: { conceptId: conceptLooping.id, order: 1 } },
    update: {},
    create: {
      conceptId: conceptLooping.id,
      slug: 'for-loop',
      title: 'For Loop',
      content: `
        # For Loop

        The \`for\` loop repeats code a fixed number of times.

        \`\`\`js
        for (let i = 0; i < 5; i++) {
          console.log(i);
        }
        \`\`\`
      `.trim(),
      order: 1,
    },
  });

  const materialWhileLoop = await prisma.material.upsert({
    where: { conceptId_order: { conceptId: conceptLooping.id, order: 2 } },
    update: {},
    create: {
      conceptId: conceptLooping.id,
      slug: 'while-loop',
      title: 'While Loop',
      content: `
        # While Loop

        The \`while\` loop repeats as long as a condition is true.

        \`\`\`js
        let i = 0;
        while (i < 5) {
          console.log(i);
          i++;
        }
        \`\`\`
      `.trim(),
      order: 2,
    },
  });

  // ============================================================
  // MATERIALS — FUNCTION
  // ============================================================
  const materialFunctionBasics = await prisma.material.upsert({
    where: { conceptId_order: { conceptId: conceptFunction.id, order: 1 } },
    update: {},
    create: {
      conceptId: conceptFunction.id,
      slug: 'function-basics',
      title: 'Function Basics',
      content: `
        # Function Basics

        A function is a reusable block of code that performs a specific task.

        \`\`\`js
        function greet(name) {
          return "Hello, " + name;
        }

        greet("Ani"); // "Hello, Ani"
        \`\`\`
      `.trim(),
      order: 1,
    },
  });

  const materialArrowFunction = await prisma.material.upsert({
    where: { conceptId_order: { conceptId: conceptFunction.id, order: 2 } },
    update: {},
    create: {
      conceptId: conceptFunction.id,
      slug: 'arrow-function',
      title: 'Arrow Function',
      content: `
        # Arrow Function

        Arrow functions are a shorter syntax for writing functions.

        \`\`\`js
        const greet = (name) => "Hello, " + name;
        \`\`\`
      `.trim(),
      order: 2,
    },
  });

  console.log('✅ Materials seeded');

  // ============================================================
  // STUDY CASES — IF & ELSE
  // ============================================================
  const scCheckAdult = await prisma.studyCase.upsert({
    where: { materialId_order: { materialId: materialIfElse.id, order: 1 } },
    update: {},
    create: {
      materialId: materialIfElse.id,
      title: 'Check Adult',
      description:
        'Write a function `isAdult` that receives a number `age` and returns `true` if age is 18 or above, otherwise `false`.',
      starterCode: `
        function isAdult(age) {
          // your code here
        }
      `,
      functionName: 'isAdult',
      parameterNames: ['age'],
      order: 1,
    },
  });

  const scMaxOfTwo = await prisma.studyCase.upsert({
    where: { materialId_order: { materialId: materialIfElse.id, order: 2 } },
    update: {},
    create: {
      materialId: materialIfElse.id,
      title: 'Max of Two Numbers',
      description:
        'Write a function `maxOfTwo` that receives two numbers `a` and `b` and returns the larger one.',
      starterCode: `
        function maxOfTwo(a, b) {
          // your code here
        }
      `,
      functionName: 'maxOfTwo',
      parameterNames: ['a', 'b'],
      order: 2,
    },
  });

  // ============================================================
  // STUDY CASES — SWITCH
  // ============================================================
  const scDayName = await prisma.studyCase.upsert({
    where: { materialId_order: { materialId: materialSwitch.id, order: 1 } },
    update: {},
    create: {
      materialId: materialSwitch.id,
      title: 'Day Name',
      description:
        "Write a function `getDayName` that receives a number (1–7) and returns the day name. 1 = Monday, 7 = Sunday. Return 'Invalid' for other numbers.",
      starterCode: `
        function getDayName(day) {
          // your code here
        }
      `,
      functionName: 'getDayName',
      parameterNames: ['day'],
      order: 1,
    },
  });

  // ============================================================
  // STUDY CASES — FOR LOOP
  // ============================================================
  const scSumArray = await prisma.studyCase.upsert({
    where: { materialId_order: { materialId: materialForLoop.id, order: 1 } },
    update: {},
    create: {
      materialId: materialForLoop.id,
      title: 'Sum of Array',
      description:
        'Write a function `sumArray` that receives an array of numbers and returns the total sum.',
      starterCode: `
        function sumArray(numbers) {
          // your code here
        }
      `,
      functionName: 'sumArray',
      parameterNames: ['numbers'],
      order: 1,
    },
  });

  const scFizzBuzz = await prisma.studyCase.upsert({
    where: { materialId_order: { materialId: materialForLoop.id, order: 2 } },
    update: {},
    create: {
      materialId: materialForLoop.id,
      title: 'FizzBuzz',
      description:
        "Write a function `fizzBuzz` that receives a number `n` and returns an array from 1 to n. Replace multiples of 3 with 'Fizz', multiples of 5 with 'Buzz', and multiples of both with 'FizzBuzz'.",
      starterCode: `
        function fizzBuzz(n) {
          // your code here
        }
      `,
      functionName: 'fizzBuzz',
      parameterNames: ['n'],
      order: 2,
    },
  });

  // ============================================================
  // STUDY CASES — WHILE LOOP
  // ============================================================
  const scCountdown = await prisma.studyCase.upsert({
    where: { materialId_order: { materialId: materialWhileLoop.id, order: 1 } },
    update: {},
    create: {
      materialId: materialWhileLoop.id,
      title: 'Countdown',
      description:
        'Write a function `countdown` that receives a number `n` and returns an array counting down from n to 1.',
      starterCode: `
        function countdown(n) {
          // your code here
        }
      `,
      functionName: 'countdown',
      parameterNames: ['n'],
      order: 1,
    },
  });

  // ============================================================
  // STUDY CASES — FUNCTION BASICS
  // ============================================================
  const scGreet = await prisma.studyCase.upsert({
    where: {
      materialId_order: { materialId: materialFunctionBasics.id, order: 1 },
    },
    update: {},
    create: {
      materialId: materialFunctionBasics.id,
      title: 'Greet User',
      description:
        "Write a function `greet` that receives a `name` string and returns 'Hello, {name}!'.",
      starterCode: `
        function greet(name) {
          // your code here
        }
      `,
      functionName: 'greet',
      parameterNames: ['name'],
      order: 1,
    },
  });

  // ============================================================
  // STUDY CASES — ARROW FUNCTION
  // ============================================================
  const scDouble = await prisma.studyCase.upsert({
    where: {
      materialId_order: { materialId: materialArrowFunction.id, order: 1 },
    },
    update: {},
    create: {
      materialId: materialArrowFunction.id,
      title: 'Double the Number',
      description:
        'Write an arrow function `double` that receives a number `n` and returns n multiplied by 2.',
      starterCode: `
        const double = (n) => {
          // your code here
        }
      `,
      functionName: 'double',
      parameterNames: ['n'],
      order: 1,
    },
  });

  console.log('✅ Study cases seeded');

  // ============================================================
  // TEST CASES
  // ============================================================

  // isAdult
  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        studyCaseId: scCheckAdult.id,
        description: 'should return true for age 18',
        input: { age: 18 },
        expected: { result: true },
        order: 1,
        isPublished: true,
      },
      {
        studyCaseId: scCheckAdult.id,
        description: 'should return true for age 25',
        input: { age: 25 },
        expected: { result: true },
        order: 2,
        isPublished: true,
      },
      {
        studyCaseId: scCheckAdult.id,
        description: 'should return false for age 17',
        input: { age: 17 },
        expected: { result: false },
        order: 3,
        isPublished: false,
      },
      {
        studyCaseId: scCheckAdult.id,
        description: 'should return false for age 0',
        input: { age: 0 },
        expected: { result: false },
        order: 4,
        isPublished: false,
      },
    ],
  });

  // maxOfTwo
  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        studyCaseId: scMaxOfTwo.id,
        description: 'should return 5 when comparing 3 and 5',
        input: { a: 3, b: 5 },
        expected: { result: 5 },
        order: 1,
        isPublished: true,
      },
      {
        studyCaseId: scMaxOfTwo.id,
        description: 'should return 10 when comparing 10 and 2',
        input: { a: 10, b: 2 },
        expected: { result: 10 },
        order: 2,
        isPublished: true,
      },
      {
        studyCaseId: scMaxOfTwo.id,
        description: 'should return either when both are equal',
        input: { a: 4, b: 4 },
        expected: { result: 4 },
        order: 3,
        isPublished: false,
      },
    ],
  });

  // getDayName
  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        studyCaseId: scDayName.id,
        description: 'should return Monday for 1',
        input: { day: 1 },
        expected: { result: 'Monday' },
        order: 1,
        isPublished: true,
      },
      {
        studyCaseId: scDayName.id,
        description: 'should return Sunday for 7',
        input: { day: 7 },
        expected: { result: 'Sunday' },
        order: 2,
        isPublished: true,
      },
      {
        studyCaseId: scDayName.id,
        description: 'should return Invalid for 8',
        input: { day: 8 },
        expected: { result: 'Invalid' },
        order: 3,
        isPublished: false,
      },
    ],
  });

  // sumArray
  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        studyCaseId: scSumArray.id,
        description: 'should return 6 for [1, 2, 3]',
        input: { numbers: [1, 2, 3] },
        expected: { result: 6 },
        order: 1,
        isPublished: true,
      },
      {
        studyCaseId: scSumArray.id,
        description: 'should return 0 for empty array',
        input: { numbers: [] },
        expected: { result: 0 },
        order: 2,
        isPublished: true,
      },
      {
        studyCaseId: scSumArray.id,
        description: 'should return 15 for [1, 2, 3, 4, 5]',
        input: { numbers: [1, 2, 3, 4, 5] },
        expected: { result: 15 },
        order: 3,
        isPublished: false,
      },
    ],
  });

  // fizzBuzz
  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        studyCaseId: scFizzBuzz.id,
        description: 'should return correct array for n=5',
        input: { n: 5 },
        expected: { result: [1, 2, 'Fizz', 4, 'Buzz'] },
        order: 1,
        isPublished: true,
      },
      {
        studyCaseId: scFizzBuzz.id,
        description: 'should return FizzBuzz for multiples of 15',
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
        isPublished: false,
      },
    ],
  });

  // countdown
  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        studyCaseId: scCountdown.id,
        description: 'should return [3, 2, 1] for n=3',
        input: { n: 3 },
        expected: { result: [3, 2, 1] },
        order: 1,
        isPublished: true,
      },
      {
        studyCaseId: scCountdown.id,
        description: 'should return [1] for n=1',
        input: { n: 1 },
        expected: { result: [1] },
        order: 2,
        isPublished: false,
      },
    ],
  });

  // greet
  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        studyCaseId: scGreet.id,
        description: "should return 'Hello, Ani!' for name='Ani'",
        input: { name: 'Ani' },
        expected: { result: 'Hello, Ani!' },
        order: 1,
        isPublished: true,
      },
      {
        studyCaseId: scGreet.id,
        description: "should return 'Hello, Budi!' for name='Budi'",
        input: { name: 'Budi' },
        expected: { result: 'Hello, Budi!' },
        order: 2,
        isPublished: false,
      },
    ],
  });

  // double
  await prisma.testCase.createMany({
    skipDuplicates: true,
    data: [
      {
        studyCaseId: scDouble.id,
        description: 'should return 10 for n=5',
        input: { n: 5 },
        expected: { result: 10 },
        order: 1,
        isPublished: true,
      },
      {
        studyCaseId: scDouble.id,
        description: 'should return 0 for n=0',
        input: { n: 0 },
        expected: { result: 0 },
        order: 2,
        isPublished: false,
      },
    ],
  });

  console.log('✅ Test cases seeded');

  // ============================================================
  // PROGRESS — seed initial unlocked state for the student
  // First item at each level starts as unlocked, rest are locked
  // ============================================================

  // Concept progresses
  await prisma.conceptProgress.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: student.id,
        conceptId: conceptConditional.id,
        isUnlocked: true,
      },
      { userId: student.id, conceptId: conceptLooping.id, isUnlocked: false },
      { userId: student.id, conceptId: conceptFunction.id, isUnlocked: false },
    ],
  });

  // Material progresses — Conditional
  await prisma.materialProgress.createMany({
    skipDuplicates: true,
    data: [
      { userId: student.id, materialId: materialIfElse.id, isUnlocked: true },
      { userId: student.id, materialId: materialSwitch.id, isUnlocked: false },
    ],
  });

  // Material progresses — Looping
  await prisma.materialProgress.createMany({
    skipDuplicates: true,
    data: [
      { userId: student.id, materialId: materialForLoop.id, isUnlocked: false },
      {
        userId: student.id,
        materialId: materialWhileLoop.id,
        isUnlocked: false,
      },
    ],
  });

  // Material progresses — Function
  await prisma.materialProgress.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: student.id,
        materialId: materialFunctionBasics.id,
        isUnlocked: false,
      },
      {
        userId: student.id,
        materialId: materialArrowFunction.id,
        isUnlocked: false,
      },
    ],
  });

  // Study case progresses — If & Else
  await prisma.studyCaseProgress.createMany({
    skipDuplicates: true,
    data: [
      { userId: student.id, studyCaseId: scCheckAdult.id, isUnlocked: true },
      { userId: student.id, studyCaseId: scMaxOfTwo.id, isUnlocked: false },
    ],
  });

  // Study case progresses — Switch
  await prisma.studyCaseProgress.createMany({
    skipDuplicates: true,
    data: [
      { userId: student.id, studyCaseId: scDayName.id, isUnlocked: false },
    ],
  });

  // Study case progresses — For Loop
  await prisma.studyCaseProgress.createMany({
    skipDuplicates: true,
    data: [
      { userId: student.id, studyCaseId: scSumArray.id, isUnlocked: false },
      { userId: student.id, studyCaseId: scFizzBuzz.id, isUnlocked: false },
    ],
  });

  // Study case progresses — While Loop
  await prisma.studyCaseProgress.createMany({
    skipDuplicates: true,
    data: [
      { userId: student.id, studyCaseId: scCountdown.id, isUnlocked: false },
    ],
  });

  // Study case progresses — Function Basics
  await prisma.studyCaseProgress.createMany({
    skipDuplicates: true,
    data: [{ userId: student.id, studyCaseId: scGreet.id, isUnlocked: false }],
  });

  // Study case progresses — Arrow Function
  await prisma.studyCaseProgress.createMany({
    skipDuplicates: true,
    data: [{ userId: student.id, studyCaseId: scDouble.id, isUnlocked: false }],
  });

  console.log('✅ Progress records seeded');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
