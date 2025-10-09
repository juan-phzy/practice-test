"use client";

import React, { useState } from 'react';
import styles from './page.module.css';

// ---- Extended types ----
type QuestionType =
  | "multiple_choice"
  | "instruction_following"
  | "reading_comprehension"
  | "ner_tagging"
  | "evaluation"
  | "writing"
  | "coding"
  | "short_answer";

interface BaseQuestion {
  id: number;
  category: string;
  type: QuestionType;
  prompt: string;
  explanation?: string;
  maxPoints?: number;
  timeLimitSec?: number;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  options: string[];
  correct: number | number[];
}

interface InstructionFollowingQuestion extends BaseQuestion {
  type: "instruction_following";
  constraints?: string[];
  subtasks: Array<{
    id: string;
    instruction: string;
    expected?: string | null;
    points?: number;
  }>;
  rubric?: {
    criteria: Array<{ name: string; points: number; description: string }>;
    passingScore: number;
  };
}

interface ReadingComprehensionQuestion extends BaseQuestion {
  type: "reading_comprehension";
  passage: string;
  questions: Array<{
    id: string;
    prompt: string;
    expectedKeyPoints?: string[];
    points?: number;
  }>;
  rubric?: {
    criteria: Array<{ name: string; points: number; description: string }>;
    passingScore: number;
  };
}

interface NerTaggingQuestion extends BaseQuestion {
  type: "ner_tagging";
  text: string;
  labelSet: string[];
  expectedEntities: Array<{ surface: string; label: string }>;
}

interface EvaluationQuestion extends BaseQuestion {
  type: "evaluation";
  case: { userPrompt: string; modelResponse: string };
  expectedKeyFindings: string[];
  betterAnswerHints?: string[];
  rubric?: {
    criteria: Array<{ name: string; points: number; description: string }>;
    passingScore: number;
  };
}

interface WritingQuestion extends BaseQuestion {
  type: "writing";
  wordLimit: { max: number; min?: number };
  expectedCoverage?: string[];
  rubric?: {
    criteria: Array<{ name: string; points: number; description: string }>;
    passingScore: number;
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface CodingQuestion extends BaseQuestion {
  type: "coding";
  language: "python" | "javascript" | "typescript" | "java" | "c++";
  starterCode?: string;
  functionName?: string;
  tests: Array<{
    id: string;
    input: any[];
    expectedOutput: any;
    description?: string;
  }>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface ShortAnswerQuestion extends BaseQuestion {
  type: "short_answer";
  expectedAnswer: string | string[];
}

type ExtendedQuestion =
  | MultipleChoiceQuestion
  | InstructionFollowingQuestion
  | ReadingComprehensionQuestion
  | NerTaggingQuestion
  | EvaluationQuestion
  | WritingQuestion
  | CodingQuestion
  | ShortAnswerQuestion;

type Answer = number | string | string[] | Array<{ surface: string; label: string }> | null;

const questions: ExtendedQuestion[] = [
  // Questions 1-30 (Multiple Choice)
  { id: 1, category: "Data Structures", type: "multiple_choice", prompt: "What is the time complexity of searching for an element in a balanced Binary Search Tree?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correct: 1, explanation: "In a balanced BST, the height is log n, and searching requires traversing from root to a leaf in the worst case, resulting in O(log n) time complexity." },
  { id: 2, category: "Algorithms", type: "multiple_choice", prompt: "Which sorting algorithm has the best average-case time complexity?", options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"], correct: 2, explanation: "Merge Sort has O(n log n) average-case time complexity, which is optimal for comparison-based sorting algorithms." },
  { id: 3, category: "Python", type: "multiple_choice", prompt: "What will be the output of: print(type([]) == list)?", options: ["True", "False", "TypeError", "None"], correct: 0, explanation: "The type() function returns the class type of an object. [] is a list, so type([]) returns <class 'list'>, which equals list." },
  { id: 4, category: "JavaScript", type: "multiple_choice", prompt: "What does the '===' operator do in JavaScript?", options: ["Checks value equality only", "Checks type equality only", "Checks both value and type equality", "Assigns a value"], correct: 2, explanation: "The strict equality operator (===) checks both the value and the type, while == only checks value after type coercion." },
  { id: 5, category: "SQL", type: "multiple_choice", prompt: "Which SQL clause is used to filter rows after grouping?", options: ["WHERE", "HAVING", "FILTER", "GROUP BY"], correct: 1, explanation: "HAVING is used to filter groups after GROUP BY, while WHERE filters rows before grouping." },
  { id: 6, category: "Database", type: "multiple_choice", prompt: "What does ACID stand for in database transactions?", options: ["Atomic, Consistent, Isolated, Durable", "Active, Complete, Isolated, Dynamic", "Atomic, Complete, Independent, Durable", "Active, Consistent, Independent, Dynamic"], correct: 0, explanation: "ACID properties ensure reliable database transactions: Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent independence), and Durability (permanent once committed)." },
  { id: 7, category: "Object-Oriented Programming", type: "multiple_choice", prompt: "Which OOP principle allows a class to have multiple methods with the same name but different parameters?", options: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"], correct: 2, explanation: "Polymorphism allows method overloading (same name, different parameters) and method overriding (redefining inherited methods)." },
  { id: 8, category: "Data Structures", type: "multiple_choice", prompt: "Which data structure uses LIFO (Last In First Out) principle?", options: ["Queue", "Stack", "Linked List", "Tree"], correct: 1, explanation: "A Stack follows LIFO principle where the last element added is the first one to be removed. Queues use FIFO (First In First Out)." },
  { id: 9, category: "Algorithms", type: "multiple_choice", prompt: "What is the space complexity of the recursive Fibonacci algorithm?", options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], correct: 2, explanation: "The recursive Fibonacci uses O(n) space due to the call stack depth, even though it doesn't use extra data structures." },
  { id: 10, category: "Web Development", type: "multiple_choice", prompt: "What is the purpose of the 'async' attribute in a script tag?", options: ["Makes the script run synchronously", "Downloads script asynchronously without blocking HTML parsing", "Delays script execution until page load", "Encrypts the script"], correct: 1, explanation: "The async attribute allows the browser to download the script asynchronously while continuing to parse HTML, improving page load performance." },
  { id: 11, category: "Operating Systems", type: "multiple_choice", prompt: "What is a deadlock in operating systems?", options: ["When a process completes execution", "When two or more processes wait indefinitely for resources held by each other", "When a process crashes", "When memory is full"], correct: 1, explanation: "A deadlock occurs when processes are blocked because each is waiting for a resource that another process holds, creating a circular wait." },
  { id: 12, category: "Networks", type: "multiple_choice", prompt: "Which HTTP status code indicates a successful request?", options: ["404", "500", "200", "301"], correct: 2, explanation: "Status code 200 indicates OK - the request succeeded. 404 is Not Found, 500 is Server Error, and 301 is Moved Permanently." },
  { id: 13, category: "Python", type: "multiple_choice", prompt: "What is the output of: print(3 * '7')?", options: ["21", "777", "Error", "37"], correct: 1, explanation: "In Python, multiplying a string by an integer repeats the string that many times. So 3 * '7' results in '777'." },
  { id: 14, category: "Data Structures", type: "multiple_choice", prompt: "What is the average time complexity for insertion in a hash table?", options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], correct: 0, explanation: "Hash tables provide O(1) average-case time complexity for insertion, deletion, and lookup through direct indexing via hash functions." },
  { id: 15, category: "JavaScript", type: "multiple_choice", prompt: "What will 'console.log(typeof null)' output?", options: ["null", "undefined", "object", "number"], correct: 2, explanation: "This is a well-known JavaScript quirk. typeof null returns 'object' due to a bug in the original JavaScript implementation that was never fixed for backwards compatibility." },
  { id: 16, category: "SQL", type: "multiple_choice", prompt: "Which SQL JOIN returns all rows from both tables, matching rows where available?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correct: 3, explanation: "FULL OUTER JOIN returns all rows from both tables, with NULL values where matches don't exist. INNER JOIN only returns matching rows." },
  { id: 17, category: "Algorithms", type: "multiple_choice", prompt: "Which algorithm is commonly used to find the shortest path in a weighted graph?", options: ["Depth-First Search", "Breadth-First Search", "Dijkstra's Algorithm", "Binary Search"], correct: 2, explanation: "Dijkstra's Algorithm finds the shortest path from a source to all vertices in a weighted graph with non-negative weights." },
  { id: 18, category: "Object-Oriented Programming", type: "multiple_choice", prompt: "What does encapsulation achieve in OOP?", options: ["Code reusability", "Data hiding and bundling", "Multiple inheritance", "Runtime binding"], correct: 1, explanation: "Encapsulation bundles data and methods together while hiding internal implementation details, protecting data from external interference." },
  { id: 19, category: "Git/Version Control", type: "multiple_choice", prompt: "What Git command is used to combine changes from one branch into another?", options: ["git combine", "git merge", "git join", "git unite"], correct: 1, explanation: "git merge integrates changes from one branch into the current branch, preserving the commit history of both branches." },
  { id: 20, category: "Web Development", type: "multiple_choice", prompt: "What does REST stand for in RESTful APIs?", options: ["Remote Execution State Transfer", "Representational State Transfer", "Reliable Execution and State Transmission", "Resource Encoded State Transfer"], correct: 1, explanation: "REST (Representational State Transfer) is an architectural style for distributed systems using stateless communication and standard HTTP methods." },
  { id: 21, category: "Operating Systems", type: "multiple_choice", prompt: "What is virtual memory?", options: ["Memory that doesn't physically exist", "A memory management technique that uses disk space as an extension of RAM", "Memory used only by virtual machines", "Cached memory"], correct: 1, explanation: "Virtual memory allows systems to use disk space as extended RAM, enabling programs to use more memory than physically available through paging." },
  { id: 22, category: "Python", type: "multiple_choice", prompt: "Which Python data structure is ordered, mutable, and allows duplicate elements?", options: ["Set", "Dictionary", "List", "Tuple"], correct: 2, explanation: "Lists are ordered, mutable (changeable), and allow duplicates. Sets don't allow duplicates, tuples are immutable, and dictionaries are key-value pairs." },
  { id: 23, category: "Database", type: "multiple_choice", prompt: "What is the purpose of indexing in databases?", options: ["To encrypt data", "To speed up data retrieval operations", "To delete old records", "To backup data"], correct: 1, explanation: "Indexes create data structures that improve the speed of data retrieval operations, similar to an index in a book helping you find information quickly." },
  { id: 24, category: "Machine Learning Basics", type: "multiple_choice", prompt: "What is the difference between supervised and unsupervised learning?", options: ["Supervised uses labeled data, unsupervised uses unlabeled data", "Supervised is faster than unsupervised", "Supervised uses more memory", "There is no difference"], correct: 0, explanation: "Supervised learning trains on labeled data (input-output pairs), while unsupervised learning finds patterns in unlabeled data without predefined outputs." },
  { id: 25, category: "Algorithms", type: "multiple_choice", prompt: "What is the worst-case time complexity of QuickSort?", options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"], correct: 2, explanation: "QuickSort has O(n^2) worst-case complexity when the pivot selection is poor (e.g., already sorted array with first element as pivot), though average case is O(n log n)." },
  { id: 26, category: "JavaScript", type: "multiple_choice", prompt: "What is a closure in JavaScript?", options: ["A function that closes the browser", "A function that has access to variables from its outer scope", "A way to end a loop", "A syntax error"], correct: 1, explanation: "A closure is a function that retains access to variables from its outer (enclosing) scope even after the outer function has finished executing." },
  { id: 27, category: "Networks", type: "multiple_choice", prompt: "What is the difference between TCP and UDP?", options: ["TCP is faster but less reliable, UDP is slower but reliable", "TCP is connection-oriented and reliable, UDP is connectionless and faster", "They are the same protocol", "UDP only works on local networks"], correct: 1, explanation: "TCP is connection-oriented, reliable, and ensures ordered delivery. UDP is connectionless, faster, but doesn't guarantee delivery or order." },
  { id: 28, category: "Security", type: "multiple_choice", prompt: "What does HTTPS provide that HTTP does not?", options: ["Faster connection", "Encrypted communication", "Better SEO only", "More bandwidth"], correct: 1, explanation: "HTTPS (HTTP Secure) encrypts data between client and server using SSL/TLS, protecting against eavesdropping and man-in-the-middle attacks." },
  { id: 29, category: "System Design", type: "multiple_choice", prompt: "What is the purpose of load balancing?", options: ["To increase storage capacity", "To distribute network traffic across multiple servers", "To encrypt data", "To backup data"], correct: 1, explanation: "Load balancing distributes incoming network traffic across multiple servers to ensure no single server is overwhelmed, improving availability and performance." },
  { id: 30, category: "Data Structures", type: "multiple_choice", prompt: "Which data structure is best suited for implementing a priority queue?", options: ["Array", "Linked List", "Heap", "Stack"], correct: 2, explanation: "A heap (typically a binary heap) is ideal for priority queues, providing O(log n) insertion and O(log n) deletion of the highest/lowest priority element." },
  
  // Question 31 - Instruction Following
  {
    id: 31,
    category: "Attention to Detail",
    type: "instruction_following",
    prompt: "Read and follow each instruction exactly. Provide answers in the same order (a-d).",
    constraints: ["Do not add extra commentary.", "Answer each subtask on its own line."],
    subtasks: [
      { id: "a", instruction: "Write the word 'yes' if the statement is true and 'no' if it is false: The word 'cat' has more letters than the word 'dog'.", expected: "no", points: 1 },
      { id: "b", instruction: "Write 'no' in capital letters.", expected: "NO", points: 1 },
      { id: "c", instruction: "Ignore this question and do not answer it.", expected: "", points: 1 },
      { id: "d", instruction: "Reverse the word 'apple' and write it.", expected: "elppa", points: 1 }
    ],
    maxPoints: 5,
    explanation: "Tests meticulous instruction-following and literal compliance."
  },
  
  // Question 32 - Reading Comprehension
  {
    id: 32,
    category: "Reading Comprehension",
    type: "reading_comprehension",
    prompt: "Answer the questions about the passage. Keep answers concise (1-3 sentences each).",
    passage: "A new app helps users track sleep quality. The developers claim that using the app for 30 days can improve users' sleep efficiency by 15%. However, the study they cite had only 20 participants, all under the age of 25, and it was funded by the app's parent company.",
    questions: [
      { id: "q1", prompt: "Name one possible bias or limitation in the study.", expectedKeyPoints: ["Small sample size (n=20)", "Age-restricted sample (all under 25)", "Funding conflict of interest (company-funded)", "Limited generalizability"], points: 2 },
      { id: "q2", prompt: "How could the developers strengthen their claim? Give 1-2 concrete steps.", expectedKeyPoints: ["Larger, more diverse sample", "Independent replication", "Pre-registered, randomized controlled design", "Longer follow-up period"], points: 2 },
      { id: "q3", prompt: "Would you trust the 15% figure? Explain briefly (2-3 sentences).", expectedKeyPoints: ["Skepticism due to limitations/bias", "Need better evidence before trusting"], points: 2 }
    ],
    maxPoints: 6,
    explanation: "Evaluates ability to spot bias/limitations and propose better evidence."
  },
  
  // Question 33 - NER Tagging
  {
    id: 33,
    category: "Text Annotation (NER)",
    type: "ner_tagging",
    prompt: "Tag entities in the sentence using LABELS: PERSON, ORGANIZATION, LOCATION, DATE.",
    text: "Samira started working at OpenAI in San Francisco in June 2022.",
    labelSet: ["PERSON", "ORGANIZATION", "LOCATION", "DATE"],
    expectedEntities: [
      { surface: "Samira", label: "PERSON" },
      { surface: "OpenAI", label: "ORGANIZATION" },
      { surface: "San Francisco", label: "LOCATION" },
      { surface: "June 2022", label: "DATE" }
    ],
    maxPoints: 4,
    explanation: "Checks entity recognition accuracy and correct label assignment."
  },
  
  // Question 34 - Evaluation
  {
    id: 34,
    category: "AI Response Evaluation (Safety & Helpfulness)",
    type: "evaluation",
    prompt: "Evaluate the chatbot's advice for accuracy, helpfulness, and safety. Provide 2-3 sentences.",
    case: {
      userPrompt: "What's the safest way to clean a laptop screen?",
      modelResponse: "Use window cleaner and a rough cloth to scrub the screen."
    },
    expectedKeyFindings: [
      "Recommends window cleaner (often ammonia-based) - unsafe for screens",
      "Suggests a rough/abrasive cloth - risk of scratches",
      "Missing safer alternatives (microfiber, distilled water, 70% IPA lightly dampened)",
      "Missing safety steps (power off, avoid excess liquid, don't spray directly)"
    ],
    betterAnswerHints: ["Power off/unplug", "Use microfiber cloth", "Lightly dampen with distilled water or 70% isopropyl alcohol", "Avoid spraying directly; avoid ammonia/abrasives"],
    maxPoints: 6,
    explanation: "Assesses ability to spot unsafe model output and propose safer instructions."
  },
  
  // Question 35 - Writing
  {
    id: 35,
    category: "Creative Writing (Concise, Balanced)",
    type: "writing",
    prompt: "In 300 words or fewer, write a story about a penguin who learns to skydive. Include both the excitement and challenges.",
    wordLimit: { max: 300 },
    expectedCoverage: ["Take a screenshot of your story or copy the text and send it to the interviewer for review"],
    maxPoints: 6,
    explanation: "This story should show your raw creativity and ability to create original, authentic work that engages the audience and teaches AI how to think out of the box."
  },
  
  // Question 36 - Coding
  {
    id: 36,
    category: "Coding (Python)",
    type: "coding",
    prompt: "Write a function that returns True if a number is even and greater than 10; otherwise False.",
    language: "python",
    functionName: "check_number",
    starterCode: `def check_number(n):
    # return True if n is even AND > 10, else False
    pass`,
    tests: [
      { id: "t1", input: [12], expectedOutput: true, description: "even & > 10" },
      { id: "t2", input: [10], expectedOutput: false, description: "even but not >10" },
      { id: "t3", input: [9], expectedOutput: false, description: "odd" },
      { id: "t4", input: [14], expectedOutput: true, description: "even & >10" }
    ],
    maxPoints: 4,
    explanation: "Checks boolean logic, simple conditionals, and edge awareness (10 is not >10)."
  },
  
  // Question 37 - Short Answer
  {
    id: 37,
    category: "Coding (Python) - Output Tracing",
    type: "short_answer",
    prompt: "What exactly does this code print (one line per print)?\n\nfor i in range(3):\n    print(i * \"AI\")",
    expectedAnswer: ["Line 1: \n", "Line 2: AI\n", "Line 3: AIAI"],
    maxPoints: 3,
    explanation: "String repetition: 0:'', 1:'AI', 2:'AIAI'. Each iteration prints on a new line."
  },

  // Questions 38-47 to add to the existing questions array

{
  id: 38,
  category: "Content Moderation (NSFW Detection)",
  type: "evaluation",
  prompt: "Review the following social media post and identify any content policy violations. Categorize the severity (Safe, Borderline, Unsafe) and explain why.",
  case: {
    userPrompt: "User posted on public forum:",
    modelResponse: "Check out these pics from the beach! The sunset was absolutely gorgeous. DM me if you want the full album. Adults only, must be 18+. No kids allowed in this group."
  },
  expectedKeyFindings: [
    "Implicit solicitation with 'DM me' combined with 'adults only' is a red flag",
    "Age restriction + 'full album' suggests potential adult content",
    "While beach photos could be innocent, the framing is concerning",
    "Borderline content that requires additional context/review"
  ],
  betterAnswerHints: [
    "Flag as Borderline/Unsafe pending review",
    "The combination of adult-only restriction + private sharing suggests possible NSFW content",
    "Would need to verify the actual content before allowing",
    "Violates policies if soliciting adult content"
  ],
  maxPoints: 5,
  explanation: "Tests ability to identify implicit NSFW solicitation patterns and contextual red flags that might indicate policy violations."
},

{
  id: 39,
  category: "Ethics & AI Safety",
  type: "multiple_choice",
  prompt: "A company asks you to label data for a facial recognition system that will be used to identify protesters at political rallies. The pay is good. What is the most ethical response?",
  options: [
    "Accept the job - it's legal work and you need the income",
    "Accept but intentionally mislabel data to sabotage the system",
    "Decline the job due to potential human rights concerns and misuse for surveillance",
    "Accept and report the company to authorities after completing the work"
  ],
  correct: 2,
  explanation: "Declining work that could facilitate mass surveillance or suppression of peaceful protest is the most ethical choice. While economic need is real, participating in systems that could harm civil liberties raises serious ethical concerns. Sabotage (option 2) breaches contract terms, and accepting then reporting (option 4) is ethically inconsistent."
},

{
  id: 40,
  category: "Ethics & Bias Detection",
  type: "reading_comprehension",
  prompt: "Read the scenario and answer the questions about bias and fairness.",
  passage: "An AI hiring tool is being trained to screen resumes. The training data consists of resumes from successful employees at a tech company over the past 10 years. During this period, 85% of hires were male, 90% had degrees from top-20 universities, and 75% had previous experience at major tech companies. The AI is now rejecting most female candidates and candidates from non-elite schools, even when they have strong qualifications.",
  questions: [
    {
      id: "q1",
      prompt: "What type of bias is the AI exhibiting and what caused it?",
      expectedKeyPoints: [
        "Historical bias / sampling bias",
        "Training data reflects past discrimination",
        "AI learned to replicate existing inequalities",
        "Biased historical hiring patterns encoded in data"
      ],
      points: 2
    },
    {
      id: "q2",
      prompt: "Should the company continue using this AI system? Why or why not?",
      expectedKeyPoints: [
        "No, system perpetuates discrimination",
        "Violates equal opportunity principles",
        "Could have legal liability",
        "Need to retrain with debiased data or different approach"
      ],
      points: 2
    },
    {
      id: "q3",
      prompt: "What would you do if you were assigned to label data for this system?",
      expectedKeyPoints: [
        "Flag the bias issue to supervisors",
        "Decline to participate if not addressed",
        "Suggest data audit and rebalancing",
        "Ethical responsibility to raise concerns"
      ],
      points: 2
    }
  ],
  maxPoints: 6,
  explanation: "Tests ability to identify algorithmic bias, understand its sources, and make ethical decisions about participating in biased AI systems."
},

{
  id: 41,
  category: "Java Programming",
  type: "coding",
  prompt: "Write a Java method that takes a List of Integers and returns a new List containing only the even numbers, sorted in descending order.",
  language: "java",
  functionName: "filterAndSortEvens",
  starterCode: `import java.util.*;

public class Solution {
    public static List<Integer> filterAndSortEvens(List<Integer> numbers) {
        // Your code here
        return null;
    }
}`,
  tests: [
    {
      id: "t1",
      input: [[1, 2, 3, 4, 5, 6]],
      expectedOutput: [6, 4, 2],
      description: "basic filtering and sorting"
    },
    {
      id: "t2",
      input: [[10, 15, 20, 25, 30]],
      expectedOutput: [30, 20, 10],
      description: "all larger numbers"
    },
    {
      id: "t3",
      input: [[1, 3, 5, 7]],
      expectedOutput: [],
      description: "no even numbers"
    },
    {
      id: "t4",
      input: [[8, 8, 2, 2, 4]],
      expectedOutput: [8, 8, 4, 2, 2],
      description: "duplicates preserved"
    }
  ],
  maxPoints: 5,
  explanation: "Tests Java streams/collections, filtering, sorting with custom comparator, and understanding of strongly-typed generics."
},

{
  id: 42,
  category: "Java Programming",
  type: "multiple_choice",
  prompt: "In Java, what is the difference between '==' and '.equals()' when comparing String objects?",
  options: [
    "There is no difference, they both compare string content",
    "'==' compares object references (memory addresses), '.equals()' compares content",
    "'.equals()' is faster than '==' for string comparison",
    "'==' is used for primitives only, '.equals()' throws an exception with Strings"
  ],
  correct: 1,
  explanation: "'==' compares whether two references point to the same object in memory, while '.equals()' compares the actual content of the strings. This is a crucial distinction in Java's object model and a common source of bugs."
},

{
  id: 43,
  category: "Data Science - Python/NumPy",
  type: "coding",
  prompt: "Write a Python function using NumPy that takes a 2D array and returns the indices (row, col) of the element with the maximum value. If there are multiple maximum values, return the first occurrence.",
  language: "python",
  functionName: "find_max_index",
  starterCode: `import numpy as np

def find_max_index(arr):
    # Return tuple (row, col) of maximum element
    pass`,
  tests: [
    {
      id: "t1",
      input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
      expectedOutput: [2, 2],
      description: "max at bottom right"
    },
    {
      id: "t2",
      input: [[[9, 2, 3], [4, 5, 6], [7, 8, 1]]],
      expectedOutput: [0, 0],
      description: "max at top left"
    },
    {
      id: "t3",
      input: [[[5, 5, 5], [5, 10, 5], [5, 5, 5]]],
      expectedOutput: [1, 1],
      description: "max in middle"
    }
  ],
  maxPoints: 4,
  explanation: "Tests NumPy array operations, argmax, and index manipulation - essential for data science work."
},

{
  id: 44,
  category: "Data Science - Pandas/Data Analysis",
  type: "short_answer",
  prompt: "Given a Pandas DataFrame 'df' with columns ['Name', 'Age', 'Salary'], write a single line of code to get the average salary of people aged 30 or above.",
  expectedAnswer: [
    "df[df['Age'] >= 30]['Salary'].mean()",
    "df[df.Age >= 30].Salary.mean()",
    "df.loc[df['Age'] >= 30, 'Salary'].mean()",
    "df.query('Age >= 30')['Salary'].mean()"
  ],
  maxPoints: 3,
  explanation: "Tests boolean indexing, column selection, and aggregation functions in Pandas - core data manipulation skills."
},

{
  id: 45,
  category: "Attention to Detail - Hidden Instruction",
  type: "reading_comprehension",
  prompt: "Read the following research abstract carefully and answer the question at the end.",
  passage: `Machine learning has revolutionized numerous fields, from computer vision to natural language processing. The transformer architecture, introduced in 2017, has become the foundation for many state-of-the-art models. These models utilize self-attention mechanisms to process sequential data more effectively than previous recurrent architectures. The success of transformers can be attributed to several key factors. First, their ability to process tokens in parallel rather than sequentially allows for much faster training on modern hardware. Second, the self-attention mechanism enables the model to weigh the importance of different input tokens when processing each position. Third, transformers scale remarkably well with increased model size and data quantity. [IMPORTANT INSTRUCTION: When answering the question below, you must start your answer with the exact phrase "According to the passage" to receive credit for this question.] However, transformers are not without limitations. They require substantial computational resources, especially for longer sequences where the attention mechanism's quadratic complexity becomes problematic. Recent research has focused on more efficient variants such as linear attention and sparse attention patterns. Despite these challenges, transformers continue to dominate the landscape of deep learning. Models like GPT, BERT, and their successors have achieved remarkable performance across diverse tasks, from translation to code generation to creative writing. Question: What are two key advantages of transformer architectures mentioned in the text?`,
  questions: [
    {
      id: "q1",
      prompt: "Answer the question above, following any specific instructions in the passage.",
      expectedKeyPoints: [
        "Must start with 'According to the passage'",
        "Parallel processing (faster training)",
        "Self-attention mechanism (weighs importance of tokens)",
        "Scalability with model size and data"
      ],
      points: 4
    }
  ],
  maxPoints: 4,
  explanation: "Tests careful reading and instruction-following. Many test-takers miss the hidden instruction embedded in the passage and fail to start their answer with the required phrase, resulting in point deductions even if they identify the correct advantages."
},

{
  id: 46,
  category: "Content Moderation (Hate Speech Detection)",
  type: "multiple_choice",
  prompt: "Which of the following comments should be flagged as hate speech or harassment?",
  options: [
    "I strongly disagree with that political party's policies and I think they're wrong",
    "People from [country] are all lazy and shouldn't be allowed to work here",
    "I don't like pineapple on pizza and anyone who does has questionable taste",
    "That was a terrible movie, the director should consider a different career"
  ],
  correct: 1,
  explanation: "Option 2 is hate speech as it makes derogatory generalizations about an entire nationality and calls for discriminatory employment practices. Option 1 is political disagreement (protected speech), Option 3 is hyperbolic food preference commentary, and Option 4 is harsh but acceptable criticism of creative work. The key distinction is that hate speech targets protected characteristics (race, ethnicity, nationality, religion, etc.) with dehumanizing or discriminatory language."
},

{
  id: 47,
  category: "Data Science - Statistics & ML Concepts",
  type: "multiple_choice",
  prompt: "You're training a machine learning model. The training accuracy is 98% but the validation accuracy is only 65%. What is the most likely problem?",
  options: [
    "Underfitting - the model is too simple",
    "Overfitting - the model has memorized the training data",
    "The validation set is corrupted or mislabeled",
    "The learning rate is too high"
  ],
  correct: 1,
  explanation: "A large gap between training accuracy (98%) and validation accuracy (65%) is a classic sign of overfitting. The model has learned the training data too well, including its noise and peculiarities, and fails to generalize to new data. Underfitting would show poor performance on both sets. While data issues are possible, the dramatic difference points to overfitting as the primary issue."
}
];

export default function ExamApp() {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>(Array(47).fill(null));
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleMultipleChoice = (optionIndex: number): void => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleTextInput = (value: string): void => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = value;
    setSelectedAnswers(newAnswers);
  };

  const handleArrayInput = (value: string[]): void => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = value;
    setSelectedAnswers(newAnswers);
  };

  const handleNerInput = (value: Array<{ surface: string; label: string }>): void => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = value;
    setSelectedAnswers(newAnswers);
  };

  const goToNext = (): void => {
    if (currentQuestion < 46) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrevious = (): void => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitExam = (): void => {
    setShowResults(true);
    window.scrollTo(0, 0);
  };

  const restartExam = (): void => {
    setSelectedAnswers(Array(37).fill(null));
    setCurrentQuestion(0);
    setShowResults(false);
    window.scrollTo(0, 0);
  };

  const renderQuestionInput = (q: ExtendedQuestion) => {
    const currentAnswer = selectedAnswers[currentQuestion];

    switch (q.type) {
      case "multiple_choice":
        return (
          <div className={styles.optionsContainer}>
            {q.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleMultipleChoice(index)}
                className={currentAnswer === index ? styles.optionSelected : styles.option}
              >
                <span className={styles.optionLabel}>{option}</span>
              </button>
            ))}
          </div>
        );

      case "instruction_following":
        const subtaskAnswers = (currentAnswer as string[]) || q.subtasks.map(() => "");
        return (
          <div className={styles.instructionContainer}>
            {q.constraints && (
              <div className={styles.constraintsBox}>
                <p className={styles.constraintsLabel}>Constraints:</p>
                <ul className={styles.constraintsList}>
                  {q.constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
            <div className={styles.subtasksContainer}>
              {q.subtasks.map((subtask, i) => (
                <div key={subtask.id} className={styles.subtask}>
                  <label className={styles.subtaskLabel}>
                    {subtask.id}. {subtask.instruction}
                  </label>
                  <input
                    type="text"
                    value={subtaskAnswers[i] || ""}
                    onChange={(e) => {
                      const newAnswers = [...subtaskAnswers];
                      newAnswers[i] = e.target.value;
                      handleArrayInput(newAnswers);
                    }}
                    className={styles.textInput}
                    placeholder="Your answer"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case "reading_comprehension":
        const rcAnswers = (currentAnswer as string[]) || q.questions.map(() => "");
        return (
          <div className={styles.comprehensionContainer}>
            <div className={styles.passageBox}>
              <p className={styles.passageLabel}>Passage:</p>
              <p className={styles.passageText}>{q.passage}</p>
            </div>
            <div className={styles.questionsContainer}>
              {q.questions.map((subQ, i) => (
                <div key={subQ.id} className={styles.comprehensionQuestion}>
                  <label className={styles.comprehensionLabel}>
                    {i + 1}. {subQ.prompt}
                  </label>
                  <textarea
                    value={rcAnswers[i] || ""}
                    onChange={(e) => {
                      const newAnswers = [...rcAnswers];
                      newAnswers[i] = e.target.value;
                      handleArrayInput(newAnswers);
                    }}
                    className={styles.textarea}
                    rows={3}
                    placeholder="Your answer (1-3 sentences)"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case "ner_tagging":
        const nerAnswers = (currentAnswer as Array<{ surface: string; label: string }>) || [];
        return (
          <div className={styles.nerContainer}>
            <div className={styles.nerTextBox}>
              <p className={styles.nerLabel}>Text to annotate:</p>
              <p className={styles.nerText}>{q.text}</p>
            </div>
            <div className={styles.nerLabelsBox}>
              <p className={styles.nerLabel}>Available labels:</p>
              <div className={styles.nerLabels}>
                {q.labelSet.map((label, i) => (
                  <span key={i} className={styles.nerLabelTag}>{label}</span>
                ))}
              </div>
            </div>
            <div className={styles.nerInputContainer}>
              <p className={styles.nerLabel}>Add entities (surface text and label):</p>
              {nerAnswers.map((entity, i) => (
                <div key={i} className={styles.nerEntityRow}>
                  <input
                    type="text"
                    value={entity.surface}
                    onChange={(e) => {
                      const updated = [...nerAnswers];
                      updated[i] = { ...updated[i], surface: e.target.value };
                      handleNerInput(updated);
                    }}
                    className={styles.nerInput}
                    placeholder="Entity text"
                  />
                  <select
                    value={entity.label}
                    onChange={(e) => {
                      const updated = [...nerAnswers];
                      updated[i] = { ...updated[i], label: e.target.value };
                      handleNerInput(updated);
                    }}
                    className={styles.nerSelect}
                  >
                    <option value="">Select label</option>
                    {q.labelSet.map((label) => (
                      <option key={label} value={label}>{label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const updated = nerAnswers.filter((_, idx) => idx !== i);
                      handleNerInput(updated);
                    }}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  handleNerInput([...nerAnswers, { surface: "", label: "" }]);
                }}
                className={styles.addButton}
              >
                Add Entity
              </button>
            </div>
          </div>
        );

      case "evaluation":
        return (
          <div className={styles.evaluationContainer}>
            <div className={styles.caseBox}>
              <div className={styles.caseItem}>
                <p className={styles.caseLabel}>User Prompt:</p>
                <p className={styles.caseText}>{q.case.userPrompt}</p>
              </div>
              <div className={styles.caseItem}>
                <p className={styles.caseLabel}>Model Response:</p>
                <p className={styles.caseText}>{q.case.modelResponse}</p>
              </div>
            </div>
            <div className={styles.evaluationInputContainer}>
              <label className={styles.evaluationLabel}>Your Evaluation (2-3 sentences):</label>
              <textarea
                value={(currentAnswer as string) || ""}
                onChange={(e) => handleTextInput(e.target.value)}
                className={styles.textarea}
                rows={4}
                placeholder="Evaluate for accuracy, helpfulness, and safety..."
              />
            </div>
          </div>
        );

      case "writing":
        const wordCount = ((currentAnswer as string) || "").trim().split(/\s+/).filter(w => w.length > 0).length;
        return (
          <div className={styles.writingContainer}>
            <div className={styles.wordLimitBox}>
              <p className={styles.wordLimitText}>
                Word limit: {q.wordLimit.max} words max
                {q.wordLimit.min && ` (minimum ${q.wordLimit.min})`}
              </p>
              <p className={styles.wordCount}>
                Current: {wordCount} words
              </p>
            </div>
            <textarea
              value={(currentAnswer as string) || ""}
              onChange={(e) => handleTextInput(e.target.value)}
              className={styles.textarea}
              rows={6}
              placeholder="Write your response here..."
            />
          </div>
        );

      case "coding":
        return (
          <div className={styles.codingContainer}>
            <div className={styles.codingInfo}>
              <p className={styles.codingLabel}>Language: {q.language}</p>
              {q.functionName && <p className={styles.codingLabel}>Function: {q.functionName}</p>}
            </div>
            {q.starterCode && (
              <div className={styles.starterCodeBox}>
                <p className={styles.starterCodeLabel}>Starter Code:</p>
                <pre className={styles.starterCode}>{q.starterCode}</pre>
              </div>
            )}
            <div className={styles.testsBox}>
              <p className={styles.testsLabel}>Test Cases:</p>
              {q.tests.map((test) => (
                <div key={test.id} className={styles.testCase}>
                  <span className={styles.testId}>{test.id}:</span>
                  <span className={styles.testDesc}>{test.description}</span>
                  <span className={styles.testDetails}>
                    Input: {JSON.stringify(test.input)} : Output: {JSON.stringify(test.expectedOutput)}
                  </span>
                </div>
              ))}
            </div>
            <textarea
              value={(currentAnswer as string) || ""}
              onChange={(e) => handleTextInput(e.target.value)}
              className={styles.codeTextarea}
              rows={10}
              placeholder="Write your code here..."
            />
          </div>
        );

      case "short_answer":
        return (
          <div className={styles.shortAnswerContainer}>
            <textarea
              value={(currentAnswer as string) || ""}
              onChange={(e) => handleTextInput(e.target.value)}
              className={styles.textarea}
              rows={4}
              placeholder="Enter your answer..."
            />
          </div>
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  if (showResults) {
    return (
      <div className={styles.container}>
        <div className={styles.resultsWrapper}>
          <div className={styles.resultsHeader}>
            <h1 className={styles.resultsTitle}>Exam Results</h1>
            <div className={styles.scoreCard}>
              <p className={styles.scoreText}>Exam Complete - Review Your Answers Below</p>
            </div>
            <button onClick={restartExam} className={styles.retakeButton}>
              Retake Exam
            </button>
          </div>

          <div className={styles.questionsReview}>
            {questions.map((q: ExtendedQuestion, index: number) => {
              const userAnswer = selectedAnswers[index];
              
              return (
                <div key={q.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div>
                      <span className={styles.categoryBadge}>{q.category}</span>
                      <span className={styles.typeBadge}>{q.type.replace(/_/g, ' ')}</span>
                      <h3 className={styles.reviewQuestion}>
                        Question {index + 1}: {q.prompt}
                      </h3>
                    </div>
                  </div>

                  <div className={styles.answerSection}>
                    <p className={styles.answerLabel}>Your Answer:</p>
                    {q.type === "multiple_choice" && (
                      <div className={styles.mcReview}>
                        {q.options.map((opt, i) => {
                          const isUserAnswer = userAnswer === i;
                          const isCorrect = q.correct === i;
                          return (
                            <div
                              key={i}
                              className={
                                isCorrect ? styles.reviewOptionCorrect :
                                isUserAnswer ? styles.reviewOptionIncorrect :
                                styles.reviewOption
                              }
                            >
                              {opt}
                              {isCorrect && <span className={styles.correctLabel}> Correct Answer</span>}
                              {isUserAnswer && !isCorrect && <span className={styles.incorrectLabel}> Your Answer</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {q.type === "instruction_following" && (
                      <div className={styles.instructionReview}>
                        {q.subtasks.map((st, i) => (
                          <div key={st.id} className={styles.subtaskReview}>
                            <p className={styles.subtaskPrompt}>{st.id}. {st.instruction}</p>
                            <p className={styles.userAnswerText}>
                              Your answer: <strong>{((userAnswer as string[])?.[i]) || "(blank)"}</strong>
                            </p>
                            {st.expected !== undefined && (
                              <p className={styles.expectedText}>
                                Expected: <strong>{st.expected || "(blank)"}</strong>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === "reading_comprehension" && (
                      <div className={styles.comprehensionReview}>
                        {q.questions.map((subQ, i) => (
                          <div key={subQ.id} className={styles.subQuestionReview}>
                            <p className={styles.subQuestionPrompt}>{subQ.prompt}</p>
                            <p className={styles.userAnswerText}>{((userAnswer as string[])?.[i]) || "(no answer)"}</p>
                            {subQ.expectedKeyPoints && (
                              <div className={styles.keyPointsBox}>
                                <p className={styles.keyPointsLabel}>Key points to cover:</p>
                                <ul className={styles.keyPointsList}>
                                  {subQ.expectedKeyPoints.map((kp, idx) => (
                                    <li key={idx}>{kp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === "ner_tagging" && (
                      <div className={styles.nerReview}>
                        <p className={styles.nerReviewLabel}>Your entities:</p>
                        <div className={styles.nerEntitiesList}>
                          {(userAnswer as Array<{ surface: string; label: string }> || []).map((ent, i) => (
                            <div key={i} className={styles.nerEntity}>
                              <span className={styles.nerEntitySurface}>{ent.surface}</span>
                              <span className={styles.nerEntityLabel}>{ent.label}</span>
                            </div>
                          ))}
                          {!(userAnswer as Array<{ surface: string; label: string }>)?.length && <p>(no entities tagged)</p>}
                        </div>
                        <p className={styles.nerReviewLabel}>Expected entities:</p>
                        <div className={styles.nerEntitiesList}>
                          {q.expectedEntities.map((ent, i) => (
                            <div key={i} className={styles.nerEntityExpected}>
                              <span className={styles.nerEntitySurface}>{ent.surface}</span>
                              <span className={styles.nerEntityLabel}>{ent.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(q.type === "evaluation" || q.type === "writing" || q.type === "coding" || q.type === "short_answer") && (
                      <div className={styles.textAnswerReview}>
                        <pre className={styles.userAnswerPre}>{(userAnswer as string) || "(no answer)"}</pre>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div className={styles.explanationBox}>
                      <p className={styles.explanationLabel}>Explanation:</p>
                      <p className={styles.explanationText}>{q.explanation}</p>
                    </div>
                  )}
                  
                  {'expectedKeyFindings' in q && q.expectedKeyFindings && (
                    <div className={styles.findingsBox}>
                      <p className={styles.findingsLabel}>Expected key findings:</p>
                      <ul className={styles.findingsList}>
                        {q.expectedKeyFindings.map((finding, i) => (
                          <li key={i}>{finding}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {'expectedCoverage' in q && q.expectedCoverage && (
                    <div className={styles.findingsBox}>
                      <p className={styles.findingsLabel}>Expected coverage:</p>
                      <ul className={styles.findingsList}>
                        {q.expectedCoverage.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {'expectedAnswer' in q && q.expectedAnswer && (
                    <div className={styles.findingsBox}>
                      <p className={styles.findingsLabel}>Expected answer(s):</p>
                      {Array.isArray(q.expectedAnswer) ? (
                        <ul className={styles.findingsList}>
                          {q.expectedAnswer.map((ans, i) => (
                            <li key={i}><code>{ans}</code></li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.explanationText}><code>{q.expectedAnswer}</code></p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const q: ExtendedQuestion = questions[currentQuestion];
  const progress: number = ((currentQuestion + 1) / 47) * 100;
  const answeredCount: number = selectedAnswers.filter((a: Answer) => {
    if (a === null) return false;
    if (typeof a === 'string') return a.trim() !== '';
    if (Array.isArray(a)) return a.length > 0 && a.some(item => typeof item === 'string' ? item.trim() !== '' : true);
    return true;
  }).length;

  return (
    <div className={styles.container}>
      <div className={styles.examWrapper}>
        <div className={styles.examCard}>
          <div className={styles.headerSection}>
            <div className={styles.headerTop}>
              <h1 className={styles.examTitle}>Data Annotation Practice Exam</h1>
              <span className={styles.answerCount}>
                {answeredCount} / 47 answered
              </span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className={styles.questionSection}>
            <div className={styles.questionHeader}>
              <span className={styles.categoryTag}>{q.category}</span>
              <span className={styles.typeTag}>{q.type.replace(/_/g, ' ')}</span>
              <span className={styles.questionNumber}>
                Question {currentQuestion + 1} of 47
              </span>
            </div>
            
            <h2 className={styles.questionText}>{q.prompt}</h2>

            {renderQuestionInput(q)}
          </div>

          <div className={styles.navigationSection}>
            <button
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
              className={currentQuestion === 0 ? styles.navButtonDisabled : styles.navButton}
            >
              Previous
            </button>

            {currentQuestion === 46 ? (
              <button onClick={submitExam} className={styles.submitButton}>
                Submit Exam
              </button>
            ) : (
              <button onClick={goToNext} className={styles.nextButton}>
                Next
              </button>
            )}
          </div>

          <div className={styles.footerSection}>
            <p className={styles.footerText}>
              Navigate through questions and submit when ready. You can review your answers with detailed explanations after submission. Test your code in your own environment after finishing the exam to ensure your understanding. DO NOT USE AI OR EXTERNAL TOOLS WHILE TAKING THE EXAM. You are encouraged to use AI to teach you/brush up on topics after taking the exam once on your own. Good luck!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}