(function(){
  'use strict';

  function link(type, label, url){
    return { type: type, label: label, url: url };
  }

  function cert(name, provider, url){
    return { name: name, provider: provider, url: url };
  }

  function project(title, description, tags){
    return { title: title, description: description, tags: tags };
  }

  function topic(name, badges, note, links){
    return { name: name, badges: badges, note: note, links: links };
  }

  const BADGE_CLASS = {
    faang: 'badge-faang',
    must: 'badge-must',
    high: 'badge-high',
    medium: 'badge-med',
    advanced: 'badge-adv'
  };

  const BADGE_LABEL = {
    faang: 'FAANG Must',
    must: 'Must',
    high: 'High',
    medium: 'Medium',
    advanced: 'Advanced'
  };

  const PHASE_COLORS = [
    { bg: '#E6F1FB', color: '#185FA5' },
    { bg: '#EAF3DE', color: '#3B6D11' },
    { bg: '#EEEDFE', color: '#3C3489' },
    { bg: '#FAECE7', color: '#993C1D' },
    { bg: '#FAEEDA', color: '#854F0B' },
    { bg: '#FBEAF0', color: '#72243E' },
    { bg: '#FCEBEB', color: '#A32D2D' },
    { bg: '#E1F5EE', color: '#085041' }
  ];

  const ROADMAP_EXTENSIONS = {
    dsa: {
      introTitle: 'DSA Roadmap - Interview depth, pattern mastery, and 300+ practice problems',
      introText: 'Expanded with advanced binary search, heaps, monotonic structures, tries, string algorithms, bitmasking, segment trees, and mock interview sprints.',
      phases: []
    },
    webdev: {
      introTitle: 'Web Development Roadmap - From frontend basics to production systems',
      introText: 'Expanded beyond HTML/CSS/JS basics into TypeScript, architecture, performance, accessibility, testing, backend APIs, security, and deployment.',
      phases: []
    },
    ai: {
      introTitle: 'AI and ML Roadmap - Math, modeling, LLM engineering, and provider ecosystem depth',
      introText: 'Expanded to cover classical ML, deep learning systems, LLM evaluation, retrieval, serving, research habits, and the modern model ecosystem.',
      phases: [],
      optionsPanel: ''
    },
    mlops: {
      introTitle: 'MLOps Roadmap - Training pipelines, deployment, monitoring, and ML platform engineering',
      introText: 'A practical path from reproducible experimentation to production-grade model serving, observability, governance, and platform ownership.',
      phases: []
    },
    dba: {
      introTitle: 'DBA and Data Platform Roadmap - Reliability, tuning, automation, and cloud-era database ownership',
      introText: 'Built for the future of DBA work: core administration, SQL performance, HA/DR, cloud databases, security, automation, and data platform skills.',
      phases: []
    }
  };

  ROADMAP_EXTENSIONS.dsa.phases.push(
    {
      title: 'Advanced Search, Heaps, and Monotonic Data Structures',
      duration: '3-4 weeks',
      topics: [
        topic('Binary Search on Answer', ['faang', 'must'], 'Practice monotonic predicates, feasibility checks, and lower-bound style reasoning.', [
          link('lc', 'LC: Koko Eating Bananas', 'https://leetcode.com/problems/koko-eating-bananas/'),
          link('lc', 'LC: Ship Packages Within D Days', 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/'),
          link('lc', 'LC: Split Array Largest Sum', 'https://leetcode.com/problems/split-array-largest-sum/'),
          link('lc', 'LC: Min Days to Make Bouquets', 'https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/'),
          link('lc', 'LC: Minimized Maximum Products', 'https://leetcode.com/problems/minimized-maximum-of-products-distributed-to-any-store/'),
          link('lc', 'LC: Magnetic Force Between Balls', 'https://leetcode.com/problems/magnetic-force-between-two-balls/')
        ]),
        topic('Heap Patterns and Top-K Problems', ['faang', 'must'], 'Get comfortable with heap choice, lazy deletion, and streaming state.', [
          link('lc', 'LC: Top K Frequent Elements', 'https://leetcode.com/problems/top-k-frequent-elements/'),
          link('lc', 'LC: Find Median From Data Stream', 'https://leetcode.com/problems/find-median-from-data-stream/'),
          link('lc', 'LC: Reorganize String', 'https://leetcode.com/problems/reorganize-string/'),
          link('lc', 'LC: K Closest Points to Origin', 'https://leetcode.com/problems/k-closest-points-to-origin/'),
          link('lc', 'LC: Task Scheduler', 'https://leetcode.com/problems/task-scheduler/'),
          link('lc', 'LC: Last Stone Weight', 'https://leetcode.com/problems/last-stone-weight/')
        ]),
        topic('Advanced Heap Merging and Greedy Scheduling', ['high'], 'These mix priority queues with greedy reasoning.', [
          link('lc', 'LC: Merge K Sorted Lists', 'https://leetcode.com/problems/merge-k-sorted-lists/'),
          link('lc', 'LC: K Pairs With Smallest Sums', 'https://leetcode.com/problems/find-k-pairs-with-smallest-sums/'),
          link('lc', 'LC: Smallest Range Covering K Lists', 'https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/'),
          link('lc', 'LC: IPO', 'https://leetcode.com/problems/ipo/'),
          link('lc', 'LC: Furthest Building You Can Reach', 'https://leetcode.com/problems/furthest-building-you-can-reach/'),
          link('lc', 'LC: Total Cost to Hire K Workers', 'https://leetcode.com/problems/total-cost-to-hire-k-workers/')
        ]),
        topic('Monotonic Stack Mastery', ['faang', 'must'], 'A must-have pattern for histogram, next-greater, and contribution counting.', [
          link('lc', 'LC: Daily Temperatures', 'https://leetcode.com/problems/daily-temperatures/'),
          link('lc', 'LC: Next Greater Element II', 'https://leetcode.com/problems/next-greater-element-ii/'),
          link('lc', 'LC: Largest Rectangle in Histogram', 'https://leetcode.com/problems/largest-rectangle-in-histogram/'),
          link('lc', 'LC: Online Stock Span', 'https://leetcode.com/problems/online-stock-span/'),
          link('lc', 'LC: Sum of Subarray Minimums', 'https://leetcode.com/problems/sum-of-subarray-minimums/'),
          link('lc', 'LC: Remove K Digits', 'https://leetcode.com/problems/remove-k-digits/')
        ]),
        topic('Monotonic Queue and Deque Problems', ['advanced'], 'Excellent for level-up prep because they require a stronger mental model than standard sliding window.', [
          link('lc', 'LC: Sliding Window Maximum', 'https://leetcode.com/problems/sliding-window-maximum/'),
          link('lc', 'LC: Shortest Subarray at Least K', 'https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/'),
          link('lc', 'LC: Constrained Subsequence Sum', 'https://leetcode.com/problems/constrained-subsequence-sum/'),
          link('lc', 'LC: Jump Game VI', 'https://leetcode.com/problems/jump-game-vi/'),
          link('lc', 'LC: Longest Subarray With Limit', 'https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/'),
          link('lc', 'LC: Most Competitive Subsequence', 'https://leetcode.com/problems/find-the-most-competitive-subsequence/')
        ])
      ],
      projects: [
        project('Pattern Notebook for Binary Search and Heaps', 'Build a repo where every problem is tagged by predicate shape, heap strategy, time complexity, and failure cases.', ['Python', 'Markdown', 'Git']),
        project('Monotonic Visualizer', 'Create a small page that animates stack and deque behavior for histogram, temperatures, and sliding window problems.', ['HTML', 'CSS', 'JavaScript'])
      ],
      certificates: [
        cert('Heap and Priority Queue Practice', 'HackerRank - Free practice track', 'https://www.hackerrank.com/domains/data-structures')
      ]
    },
    {
      title: 'Trees, Tries, and String Processing',
      duration: '3-4 weeks',
      topics: [
        topic('Tree Construction and Traversals', ['faang', 'must'], 'Focus on BFS vs DFS tradeoffs, recursion state, and serialization formats.', [
          link('lc', 'LC: Level Order Traversal', 'https://leetcode.com/problems/binary-tree-level-order-traversal/'),
          link('lc', 'LC: Zigzag Level Order', 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/'),
          link('lc', 'LC: Build Tree From Traversals', 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/'),
          link('lc', 'LC: Right Side View', 'https://leetcode.com/problems/binary-tree-right-side-view/'),
          link('lc', 'LC: Serialize and Deserialize Tree', 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/'),
          link('lc', 'LC: Vertical Order Traversal', 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/')
        ]),
        topic('BST and LCA Patterns', ['faang', 'must'], 'Interviewers love these because they expose how well you use tree invariants.', [
          link('lc', 'LC: Validate BST', 'https://leetcode.com/problems/validate-binary-search-tree/'),
          link('lc', 'LC: Kth Smallest in BST', 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/'),
          link('lc', 'LC: Delete Node in BST', 'https://leetcode.com/problems/delete-node-in-a-bst/'),
          link('lc', 'LC: Recover Binary Search Tree', 'https://leetcode.com/problems/recover-binary-search-tree/'),
          link('lc', 'LC: LCA of Binary Tree', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/'),
          link('lc', 'LC: LCA of BST', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/')
        ]),
        topic('Trie and Prefix Search', ['high'], 'Use tries for prefix lookups, wildcard search, word search pruning, and autocomplete-like problems.', [
          link('lc', 'LC: Implement Trie', 'https://leetcode.com/problems/implement-trie-prefix-tree/'),
          link('lc', 'LC: Add and Search Word', 'https://leetcode.com/problems/design-add-and-search-words-data-structure/'),
          link('lc', 'LC: Replace Words', 'https://leetcode.com/problems/replace-words/'),
          link('lc', 'LC: Map Sum Pairs', 'https://leetcode.com/problems/map-sum-pairs/'),
          link('lc', 'LC: Word Search II', 'https://leetcode.com/problems/word-search-ii/'),
          link('lc', 'LC: Search Suggestions System', 'https://leetcode.com/problems/search-suggestions-system/')
        ]),
        topic('Advanced String Construction', ['high'], 'These reward careful parsing and data-structure choice more than syntax tricks.', [
          link('lc', 'LC: Palindrome Pairs', 'https://leetcode.com/problems/palindrome-pairs/'),
          link('lc', 'LC: Text Justification', 'https://leetcode.com/problems/text-justification/'),
          link('lc', 'LC: Decode String', 'https://leetcode.com/problems/decode-string/'),
          link('lc', 'LC: Remove Duplicate Letters', 'https://leetcode.com/problems/remove-duplicate-letters/'),
          link('lc', 'LC: Basic Calculator II', 'https://leetcode.com/problems/basic-calculator-ii/'),
          link('lc', 'LC: Word Break II', 'https://leetcode.com/problems/word-break-ii/')
        ]),
        topic('String Algorithms Theory', ['advanced'], 'Pair theory with implementation so KMP, Z-function, rolling hash, and suffix ideas stop feeling abstract.', [
          link('gfg', 'GFG: KMP Algorithm', 'https://www.geeksforgeeks.org/kmp-algorithm-for-pattern-searching/'),
          link('gfg', 'GFG: Z Algorithm', 'https://www.geeksforgeeks.org/z-algorithm-linear-time-pattern-searching-algorithm/'),
          link('gfg', 'GFG: Rabin-Karp', 'https://www.geeksforgeeks.org/rabin-karp-algorithm-for-pattern-searching/'),
          link('yt', 'YT: String Matching Patterns', 'https://www.youtube.com/watch?v=GTJr8OvyEVQ'),
          link('doc', 'CP Notes: Prefix Function', 'https://cp-algorithms.com/string/prefix-function.html'),
          link('doc', 'CP Notes: Z Function', 'https://cp-algorithms.com/string/z-function.html')
        ])
      ],
      projects: [
        project('Tree and Trie Visual Playground', 'Build an interactive visualizer for traversals, insert/delete in BST, and trie prefix search.', ['JavaScript', 'SVG', 'Algorithms'])
      ],
      certificates: [
        cert('Tree and Graph Interview Prep', 'freeCodeCamp - Free', 'https://www.freecodecamp.org/news/binary-tree-traversal-inorder-preorder-post-order-for-bst/')
      ]
    }
  );

  ROADMAP_EXTENSIONS.dsa.phases.push(
    {
      title: 'Bitmasking, State Search, and Hard DP',
      duration: '3-5 weeks',
      topics: [
        topic('Bit Manipulation Essentials', ['high'], 'Strengthen XOR reasoning, bit DP intuition, and mask transitions.', [
          link('lc', 'LC: Single Number II', 'https://leetcode.com/problems/single-number-ii/'),
          link('lc', 'LC: Counting Bits', 'https://leetcode.com/problems/counting-bits/'),
          link('lc', 'LC: Bitwise AND of Numbers Range', 'https://leetcode.com/problems/bitwise-and-of-numbers-range/'),
          link('lc', 'LC: Maximum XOR of Two Numbers', 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/'),
          link('lc', 'LC: Minimum One Bit Operations', 'https://leetcode.com/problems/minimum-one-bit-operations-to-make-integers-zero/'),
          link('lc', 'LC: Subsets', 'https://leetcode.com/problems/subsets/')
        ]),
        topic('Bitmask Backtracking and DP', ['advanced'], 'These force you to model state carefully instead of reaching for brute force.', [
          link('lc', 'LC: Partition to K Equal Sum Subsets', 'https://leetcode.com/problems/partition-to-k-equal-sum-subsets/'),
          link('lc', 'LC: Matchsticks to Square', 'https://leetcode.com/problems/matchsticks-to-square/'),
          link('lc', 'LC: Can I Win', 'https://leetcode.com/problems/can-i-win/'),
          link('lc', 'LC: Shortest Path Visiting All Nodes', 'https://leetcode.com/problems/shortest-path-visiting-all-nodes/'),
          link('lc', 'LC: Stickers to Spell Word', 'https://leetcode.com/problems/stickers-to-spell-word/'),
          link('lc', 'LC: Beautiful Arrangement', 'https://leetcode.com/problems/beautiful-arrangement/')
        ]),
        topic('Digit DP and Counting', ['advanced'], 'A strong category for level-up prep because it builds reusable transitions over position, tightness, and used-state.', [
          link('lc', 'LC: Numbers At Most N Given Digit Set', 'https://leetcode.com/problems/numbers-at-most-n-given-digit-set/'),
          link('lc', 'LC: Number of Digit One', 'https://leetcode.com/problems/number-of-digit-one/'),
          link('lc', 'LC: Non-negative Integers Without Consecutive Ones', 'https://leetcode.com/problems/non-negative-integers-without-consecutive-ones/'),
          link('lc', 'LC: Rotated Digits', 'https://leetcode.com/problems/rotated-digits/'),
          link('lc', 'LC: Count Stepping Numbers in Range', 'https://leetcode.com/problems/count-stepping-numbers-in-range/'),
          link('lc', 'LC: Numbers With Repeated Digits', 'https://leetcode.com/problems/numbers-with-repeated-digits/')
        ]),
        topic('State Space Search and BFS Variants', ['faang', 'high'], 'These are ideal for sharpening graph modeling under constraints and custom state dimensions.', [
          link('lc', 'LC: Open the Lock', 'https://leetcode.com/problems/open-the-lock/'),
          link('lc', 'LC: Minimum Genetic Mutation', 'https://leetcode.com/problems/minimum-genetic-mutation/'),
          link('lc', 'LC: Shortest Path to Get All Keys', 'https://leetcode.com/problems/shortest-path-to-get-all-keys/'),
          link('lc', 'LC: Race Car', 'https://leetcode.com/problems/race-car/'),
          link('lc', 'LC: Bus Routes', 'https://leetcode.com/problems/bus-routes/'),
          link('lc', 'LC: Sliding Puzzle', 'https://leetcode.com/problems/sliding-puzzle/')
        ]),
        topic('Game Theory and Advanced Recurrence Design', ['advanced'], 'Model turn order, minimax intuition, interval state, and memoization cleanly.', [
          link('lc', 'LC: Stone Game', 'https://leetcode.com/problems/stone-game/'),
          link('lc', 'LC: Stone Game II', 'https://leetcode.com/problems/stone-game-ii/'),
          link('lc', 'LC: Stone Game III', 'https://leetcode.com/problems/stone-game-iii/'),
          link('lc', 'LC: Predict the Winner', 'https://leetcode.com/problems/predict-the-winner/'),
          link('lc', 'LC: Minimum Cost Tree From Leaf Values', 'https://leetcode.com/problems/minimum-cost-tree-from-leaf-values/'),
          link('lc', 'LC: Remove Boxes', 'https://leetcode.com/problems/remove-boxes/')
        ])
      ],
      projects: [
        project('State Search Template Library', 'Write reusable templates for BFS over custom state, memoized DFS, and bitmask DP with clear complexity notes.', ['Python', 'Templates', 'Algorithms'])
      ],
      certificates: [
        cert('Dynamic Programming Practice Collection', 'HackerEarth - Free practice', 'https://www.hackerearth.com/practice/algorithms/dynamic-programming/')
      ]
    },
    {
      title: 'Segment Trees, Range Queries, and Mock Interview Sprints',
      duration: '2-4 weeks',
      topics: [
        topic('Segment Tree and Fenwick Tree Practice', ['advanced'], 'Know when point updates, range queries, lazy propagation, or coordinate compression are needed.', [
          link('lc', 'LC: Range Sum Query Mutable', 'https://leetcode.com/problems/range-sum-query-mutable/'),
          link('lc', 'LC: Count of Smaller Numbers After Self', 'https://leetcode.com/problems/count-of-smaller-numbers-after-self/'),
          link('lc', 'LC: Reverse Pairs', 'https://leetcode.com/problems/reverse-pairs/'),
          link('lc', 'LC: Falling Squares', 'https://leetcode.com/problems/falling-squares/'),
          link('lc', 'LC: Range Module', 'https://leetcode.com/problems/range-module/'),
          link('lc', 'LC: My Calendar III', 'https://leetcode.com/problems/my-calendar-iii/')
        ]),
        topic('Backtracking Revision Sprint', ['must'], 'These are core interview questions that reward pattern repetition and clean pruning.', [
          link('lc', 'LC: Combination Sum', 'https://leetcode.com/problems/combination-sum/'),
          link('lc', 'LC: Combination Sum II', 'https://leetcode.com/problems/combination-sum-ii/'),
          link('lc', 'LC: Palindrome Partitioning', 'https://leetcode.com/problems/palindrome-partitioning/'),
          link('lc', 'LC: Restore IP Addresses', 'https://leetcode.com/problems/restore-ip-addresses/'),
          link('lc', 'LC: N-Queens', 'https://leetcode.com/problems/n-queens/'),
          link('lc', 'LC: Generate Parentheses', 'https://leetcode.com/problems/generate-parentheses/')
        ]),
        topic('Hard Recursion and Expression Search', ['high'], 'These are excellent for explaining recursion trees, pruning, and expression state.', [
          link('lc', 'LC: Sudoku Solver', 'https://leetcode.com/problems/sudoku-solver/'),
          link('lc', 'LC: Expression Add Operators', 'https://leetcode.com/problems/expression-add-operators/'),
          link('lc', 'LC: Remove Invalid Parentheses', 'https://leetcode.com/problems/remove-invalid-parentheses/'),
          link('lc', 'LC: Different Ways to Add Parentheses', 'https://leetcode.com/problems/different-ways-to-add-parentheses/'),
          link('lc', 'LC: Permutations II', 'https://leetcode.com/problems/permutations-ii/'),
          link('lc', 'LC: Word Search', 'https://leetcode.com/problems/word-search/')
        ]),
        topic('Design-heavy Data Structure Questions', ['faang', 'high'], 'Use these to practice API design, invariant maintenance, and amortized analysis.', [
          link('lc', 'LC: LRU Cache', 'https://leetcode.com/problems/lru-cache/'),
          link('lc', 'LC: LFU Cache', 'https://leetcode.com/problems/lfu-cache/'),
          link('lc', 'LC: Insert Delete GetRandom O(1)', 'https://leetcode.com/problems/insert-delete-getrandom-o1/'),
          link('lc', 'LC: Random Pick With Weight', 'https://leetcode.com/problems/random-pick-with-weight/'),
          link('lc', 'LC: Time Based Key-Value Store', 'https://leetcode.com/problems/time-based-key-value-store/'),
          link('lc', 'LC: Snapshot Array', 'https://leetcode.com/problems/snapshot-array/')
        ]),
        topic('Final Mixed Interview Sprint', ['faang', 'must'], 'Revisit these under timed conditions and explain tradeoffs out loud as if you are in a real interview.', [
          link('lc', 'LC: Alien Dictionary', 'https://leetcode.com/problems/alien-dictionary/'),
          link('lc', 'LC: Cheapest Flights Within K Stops', 'https://leetcode.com/problems/cheapest-flights-within-k-stops/'),
          link('lc', 'LC: Edit Distance', 'https://leetcode.com/problems/edit-distance/'),
          link('lc', 'LC: Minimum Window Substring', 'https://leetcode.com/problems/minimum-window-substring/'),
          link('lc', 'LC: Binary Tree Maximum Path Sum', 'https://leetcode.com/problems/binary-tree-maximum-path-sum/'),
          link('lc', 'LC: Burst Balloons', 'https://leetcode.com/problems/burst-balloons/')
        ])
      ],
      projects: [
        project('Interview Sprint Tracker', 'Track timed sessions, wrong assumptions, and re-solves. Add tags for pattern, bug type, and explanation quality.', ['JavaScript', 'Local Storage', 'Charts']),
        project('Range Query Playground', 'Build a demo that compares prefix sums, Fenwick trees, and segment trees on the same update/query stream.', ['HTML', 'CSS', 'JavaScript'])
      ],
      certificates: [
        cert('Algorithms, Part II', 'Princeton / Coursera - Audit free', 'https://www.coursera.org/learn/algorithms-part2')
      ]
    }
  );

  ROADMAP_EXTENSIONS.webdev.phases.push(
    {
      title: 'JavaScript Depth and TypeScript Foundations',
      duration: '3 weeks',
      topics: [
        topic('JavaScript Runtime and Event Loop', ['must'], 'Understand the call stack, microtasks, rendering, and why async code behaves the way it does.', [
          link('doc', 'MDN: Event Loop', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop'),
          link('yt', 'YT: JavaScript Event Loop', 'https://www.youtube.com/watch?v=8aGhZQkoFbQ'),
          link('doc', 'javascript.info: Event Loop', 'https://javascript.info/event-loop')
        ]),
        topic('Closures, Prototypes, and This', ['must'], 'These topics matter because interviewers and bug hunts both rely on them.', [
          link('doc', 'MDN: Closures', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures'),
          link('doc', 'MDN: Prototype Chain', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain'),
          link('yt', 'YT: this keyword', 'https://www.youtube.com/watch?v=gvicrj31JOM')
        ]),
        topic('TypeScript for Real Projects', ['faang', 'must'], 'Learn narrowing, utility types, generics, discriminated unions, and API-safe types.', [
          link('doc', 'TypeScript Handbook', 'https://www.typescriptlang.org/docs/'),
          link('yt', 'YT: TypeScript Full Course', 'https://www.youtube.com/watch?v=30LWjhZzg50'),
          link('doc', 'Total TypeScript Tutorials', 'https://www.totaltypescript.com/tutorials')
        ]),
        topic('Debugging and Performance Profiling', ['high'], 'Use devtools, performance traces, and memory snapshots intentionally.', [
          link('doc', 'Chrome DevTools Performance', 'https://developer.chrome.com/docs/devtools/performance/'),
          link('doc', 'Web.dev Performance', 'https://web.dev/learn/performance/'),
          link('yt', 'YT: Browser Performance Debugging', 'https://www.youtube.com/watch?v=Rz-eq8m-CyA')
        ])
      ],
      projects: [
        project('Async Behavior Playground', 'Build demos for promises, microtasks, debouncing, throttling, and request cancellation.', ['JavaScript', 'HTML', 'CSS'])
      ],
      certificates: [
        cert('JavaScript Algorithms and Data Structures', 'freeCodeCamp - Free', 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/')
      ]
    },
    {
      title: 'Frontend Architecture, Accessibility, and Testing',
      duration: '3-4 weeks',
      topics: [
        topic('React Architecture and State Strategy', ['faang', 'must'], 'Learn data flow, server state, local state, forms, and rendering boundaries.', [
          link('doc', 'React Learn', 'https://react.dev/learn'),
          link('doc', 'React Router', 'https://reactrouter.com/en/main/start/overview'),
          link('doc', 'TanStack Query', 'https://tanstack.com/query/latest/docs/framework/react/overview')
        ]),
        topic('Accessibility and Inclusive UI', ['must'], 'Semantic HTML, focus management, ARIA, contrast, reduced motion, and keyboard-only usability should be normal practice.', [
          link('doc', 'MDN: Accessibility', 'https://developer.mozilla.org/en-US/docs/Learn/Accessibility'),
          link('doc', 'Web.dev Accessibility', 'https://web.dev/learn/accessibility/'),
          link('doc', 'WAI ARIA Practices', 'https://www.w3.org/WAI/ARIA/apg/')
        ]),
        topic('Testing the Frontend Stack', ['high'], 'Cover unit, integration, and end-to-end tests without over-mocking everything.', [
          link('doc', 'Testing Library Docs', 'https://testing-library.com/docs/'),
          link('doc', 'Vitest Guide', 'https://vitest.dev/guide/'),
          link('doc', 'Playwright Docs', 'https://playwright.dev/docs/intro')
        ]),
        topic('Next.js and App Router Fundamentals', ['high'], 'Learn SSR, SSG, server components, route handlers, caching, and deployment expectations.', [
          link('doc', 'Next.js Learn', 'https://nextjs.org/learn'),
          link('doc', 'Next.js App Router', 'https://nextjs.org/docs/app'),
          link('yt', 'YT: Next.js Crash Course', 'https://www.youtube.com/watch?v=wm5gMKuwSYk')
        ])
      ],
      projects: [
        project('Accessible Component Library', 'Build buttons, dialogs, comboboxes, tabs, and accordions with keyboard support and visual tests.', ['React', 'TypeScript', 'Testing Library'])
      ],
      certificates: [
        cert('Responsive Web Design', 'freeCodeCamp - Free', 'https://www.freecodecamp.org/learn/2022/responsive-web-design/')
      ]
    }
  );

  ROADMAP_EXTENSIONS.webdev.phases.push(
    {
      title: 'Backend APIs, Data, and Auth',
      duration: '4 weeks',
      topics: [
        topic('Node.js and API Design', ['faang', 'must'], 'Design routes around resources, validation, errors, pagination, and observability.', [
          link('doc', 'Node.js Learn', 'https://nodejs.org/en/learn'),
          link('doc', 'Express Guide', 'https://expressjs.com/en/guide/routing.html'),
          link('doc', 'Fastify Getting Started', 'https://fastify.dev/docs/latest/Guides/Getting-Started/')
        ]),
        topic('Databases and Query Design', ['must'], 'Get comfortable with Postgres schema design, indexes, transactions, and ORM tradeoffs.', [
          link('doc', 'PostgreSQL Tutorial', 'https://www.postgresql.org/docs/current/tutorial.html'),
          link('doc', 'Prisma Docs', 'https://www.prisma.io/docs'),
          link('doc', 'SQLBolt', 'https://sqlbolt.com/')
        ]),
        topic('Authentication and Session Security', ['high'], 'Learn cookies, JWTs, refresh tokens, password hashing, CSRF, and role-based authorization.', [
          link('doc', 'Auth.js Docs', 'https://authjs.dev/'),
          link('doc', 'OWASP Auth Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'),
          link('doc', 'OWASP Session Management', 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html')
        ]),
        topic('Caching, Queues, and Background Work', ['high'], 'Learn Redis caching, job queues, retries, idempotency, and how to avoid double processing.', [
          link('doc', 'Redis Docs', 'https://redis.io/docs/latest/'),
          link('doc', 'BullMQ Guide', 'https://docs.bullmq.io/guide/introduction'),
          link('doc', 'Web.dev Caching', 'https://web.dev/learn/performance/caching/')
        ])
      ],
      projects: [
        project('Production-style SaaS Backend', 'Build auth, organizations, roles, rate limiting, email verification, audit logs, and webhook handling.', ['Node.js', 'PostgreSQL', 'Redis'])
      ],
      certificates: [
        cert('Back End Development and APIs', 'freeCodeCamp - Free', 'https://www.freecodecamp.org/learn/back-end-development-and-apis/')
      ]
    },
    {
      title: 'DevOps, Security, and Shipping with Confidence',
      duration: '3 weeks',
      topics: [
        topic('Docker and Reproducible Environments', ['high'], 'Package apps consistently and learn multi-stage builds, bind mounts, networks, and environment management.', [
          link('doc', 'Docker Get Started', 'https://docs.docker.com/get-started/'),
          link('doc', 'Docker Compose Overview', 'https://docs.docker.com/compose/'),
          link('yt', 'YT: Docker Crash Course', 'https://www.youtube.com/watch?v=pg19Z8LL06w')
        ]),
        topic('CI/CD and Release Pipelines', ['high'], 'Automate linting, tests, previews, deployments, migrations, and rollback-safe releases.', [
          link('doc', 'GitHub Actions Docs', 'https://docs.github.com/en/actions'),
          link('doc', 'Vercel Deployments', 'https://vercel.com/docs/deployments'),
          link('doc', 'Netlify Docs', 'https://docs.netlify.com/')
        ]),
        topic('Web Security Essentials', ['faang', 'must'], 'Cover XSS, CSRF, CSP, SSRF basics, secrets handling, and dependency hygiene.', [
          link('doc', 'OWASP Top 10', 'https://owasp.org/www-project-top-ten/'),
          link('doc', 'Web.dev Security', 'https://web.dev/learn/privacy-security-security/'),
          link('doc', 'MDN Web Security', 'https://developer.mozilla.org/en-US/docs/Web/Security')
        ]),
        topic('Observability and Incident Readiness', ['medium'], 'Logs, metrics, tracing, error alerts, and postmortem quality matter once real users show up.', [
          link('doc', 'OpenTelemetry Docs', 'https://opentelemetry.io/docs/'),
          link('doc', 'Sentry Docs', 'https://docs.sentry.io/'),
          link('doc', 'Grafana Docs', 'https://grafana.com/docs/')
        ])
      ],
      projects: [
        project('Deployable Full-stack Monorepo', 'Ship a monorepo with preview environments, testing gates, secrets management, and production observability.', ['TypeScript', 'Docker', 'GitHub Actions'])
      ],
      certificates: [
        cert('Relational Database', 'freeCodeCamp - Free', 'https://www.freecodecamp.org/learn/relational-database/')
      ]
    }
  );

  ROADMAP_EXTENSIONS.ai.phases.push(
    {
      title: 'Math, Data Workflow, and ML Foundations',
      duration: '3-4 weeks',
      topics: [
        topic('Linear Algebra, Probability, and Optimization', ['must'], 'Get practical: vectors, gradients, distributions, bias-variance, and optimization intuition.', [
          link('yt', 'YT: Essence of Linear Algebra', 'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr'),
          link('yt', 'YT: StatQuest ML Maths', 'https://www.youtube.com/@statquest'),
          link('doc', 'Khan Academy: Linear Algebra', 'https://www.khanacademy.org/math/linear-algebra')
        ]),
        topic('Data Cleaning, EDA, and Feature Thinking', ['must'], 'Strong AI work starts with careful data understanding, not just model selection.', [
          link('doc', 'Pandas User Guide', 'https://pandas.pydata.org/docs/user_guide/index.html'),
          link('doc', 'Seaborn Tutorials', 'https://seaborn.pydata.org/tutorial.html'),
          link('yt', 'YT: Data Analysis with Python', 'https://www.youtube.com/watch?v=r-uOLxNrNk8')
        ]),
        topic('Model Evaluation and Experiment Discipline', ['high'], 'Confusion matrices, cross-validation, leakage detection, baselines, and error slicing should become habits.', [
          link('doc', 'Scikit-learn Model Evaluation', 'https://scikit-learn.org/stable/modules/model_evaluation.html'),
          link('doc', 'Google ML Crash Course', 'https://developers.google.com/machine-learning/crash-course'),
          link('doc', 'Weights and Biases Reports', 'https://wandb.ai/site/resources/articles')
        ]),
        topic('Classical ML in Practice', ['must'], 'Know when linear models, trees, ensembles, and boosting beat bigger models.', [
          link('doc', 'Scikit-learn User Guide', 'https://scikit-learn.org/stable/user_guide.html'),
          link('yt', 'YT: StatQuest Trees and Boosting', 'https://www.youtube.com/@statquest'),
          link('cert', 'Coursera: Andrew Ng ML Specialization', 'https://www.coursera.org/specializations/machine-learning-introduction')
        ])
      ],
      projects: [
        project('End-to-end Tabular ML Notebook', 'Pick a public dataset, build a reproducible baseline, compare models, and document error slices and business tradeoffs.', ['Python', 'Pandas', 'scikit-learn'])
      ],
      certificates: [
        cert('Machine Learning Crash Course', 'Google - Free', 'https://developers.google.com/machine-learning/crash-course')
      ]
    },
    {
      title: 'Deep Learning Systems and Practical Training',
      duration: '4 weeks',
      topics: [
        topic('PyTorch and Training Loops', ['faang', 'must'], 'Train, validate, checkpoint, profile, and debug models with intent.', [
          link('doc', 'PyTorch Tutorials', 'https://pytorch.org/tutorials/'),
          link('yt', 'YT: PyTorch for Deep Learning', 'https://www.youtube.com/watch?v=V_xro1bcAuA'),
          link('doc', 'Lightning Docs', 'https://lightning.ai/docs/pytorch/stable/')
        ]),
        topic('CNNs, Vision, and Representation Learning', ['high'], 'Learn when convolution still matters and how transfer learning changes project speed.', [
          link('doc', 'CS231n', 'https://cs231n.stanford.edu/'),
          link('doc', 'TorchVision Docs', 'https://pytorch.org/vision/stable/index.html'),
          link('yt', 'YT: CNN Intuition', 'https://www.youtube.com/watch?v=YRhxdVk_sIs')
        ]),
        topic('Sequence Models, Attention, and Transformers', ['faang', 'must'], 'Understand embeddings, attention heads, positional information, and token-level training.', [
          link('doc', 'The Illustrated Transformer', 'https://jalammar.github.io/illustrated-transformer/'),
          link('doc', 'Hugging Face NLP Course', 'https://huggingface.co/learn/nlp-course/chapter1/1'),
          link('yt', 'YT: Stanford CS224N', 'https://www.youtube.com/playlist?list=PLoROMvodv4rOSH4v6133s9LFPRHjEmbmJ')
        ]),
        topic('Experiment Tracking and Reproducibility', ['high'], 'Strong practitioners can reproduce runs, compare versions, and explain why results changed.', [
          link('doc', 'Weights and Biases Docs', 'https://docs.wandb.ai/'),
          link('doc', 'MLflow Docs', 'https://mlflow.org/docs/latest/index.html'),
          link('doc', 'DVC Docs', 'https://dvc.org/doc')
        ])
      ],
      projects: [
        project('Training Pipeline Repo', 'Train a small vision or text model with configuration files, experiment tracking, and clean evaluation notebooks.', ['PyTorch', 'WandB', 'Hydra'])
      ],
      certificates: [
        cert('Deep Learning Specialization', 'DeepLearning.AI / Coursera - Audit free', 'https://www.coursera.org/specializations/deep-learning')
      ]
    },
    {
      title: 'LLM Engineering, Prompting, and Retrieval',
      duration: '4 weeks',
      topics: [
        topic('Prompt Design and Structured Outputs', ['faang', 'must'], 'Write prompts that specify schema, constraints, edge cases, and evaluation criteria clearly.', [
          link('doc', 'OpenAI Cookbook', 'https://github.com/openai/openai-cookbook'),
          link('doc', 'Anthropic Prompt Engineering', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview'),
          link('doc', 'Google Prompt Design', 'https://ai.google.dev/gemini-api/docs/prompting-strategies')
        ]),
        topic('Provider Ecosystem: OpenAI, Anthropic, Gemini, and Open Models', ['high'], 'Learn differences in APIs, context windows, pricing, safety tooling, and structured output support.', [
          link('doc', 'OpenAI Platform Docs', 'https://platform.openai.com/docs/overview'),
          link('doc', 'Anthropic Docs', 'https://docs.anthropic.com/en/docs/welcome'),
          link('doc', 'Gemini API Docs', 'https://ai.google.dev/gemini-api/docs'),
          link('doc', 'OpenRouter Docs', 'https://openrouter.ai/docs'),
          link('doc', 'Hugging Face Inference', 'https://huggingface.co/docs/api-inference/index')
        ]),
        topic('Embeddings, Retrieval, and RAG', ['faang', 'must'], 'Go past toy demos: chunking strategy, metadata, reranking, citations, and evals matter.', [
          link('doc', 'LangChain RAG Concepts', 'https://python.langchain.com/docs/concepts/rag/'),
          link('doc', 'LlamaIndex Docs', 'https://docs.llamaindex.ai/'),
          link('doc', 'OpenAI RAG Cookbook', 'https://cookbook.openai.com/')
        ]),
        topic('Agents, Tools, and Workflow Orchestration', ['high'], 'Use tools where they help, but keep deterministic boundaries and clear evaluation.', [
          link('doc', 'OpenAI Agents Guide', 'https://platform.openai.com/docs/guides/agents'),
          link('doc', 'Anthropic Tool Use', 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview'),
          link('doc', 'LangGraph Overview', 'https://langchain-ai.github.io/langgraph/')
        ])
      ],
      projects: [
        project('Citation-aware RAG Assistant', 'Build a retrieval app that returns grounded answers with chunk citations, follow-up questions, and eval cases.', ['Python', 'Vector DB', 'LLM API']),
        project('Prompt Regression Suite', 'Create a benchmark set for summarization, classification, extraction, and tool use so prompt changes stay measurable.', ['JSON', 'Python', 'Evaluation'])
      ],
      certificates: [
        cert('Generative AI with LLMs', 'AWS + DeepLearning.AI / Coursera - Audit free', 'https://www.coursera.org/learn/generative-ai-with-llms'),
        cert('DeepLearning.AI Short Courses', 'DeepLearning.AI - Free', 'https://www.deeplearning.ai/short-courses/')
      ]
    },
    {
      title: 'Evaluation, Safety, MLOps, and Career Readiness',
      duration: 'Ongoing',
      topics: [
        topic('LLM Evaluation and Failure Analysis', ['faang', 'must'], 'Measure quality across correctness, hallucination rate, refusal quality, latency, and user value.', [
          link('doc', 'OpenAI Evals', 'https://github.com/openai/evals'),
          link('doc', 'Weights and Biases LLM Eval Guides', 'https://wandb.ai/site/resources/articles'),
          link('doc', 'TruLens Docs', 'https://www.trulens.org/')
        ]),
        topic('Safety, Guardrails, and Responsible AI', ['high'], 'Red-teaming, prompt injection awareness, privacy boundaries, and abuse prevention are now core engineering skills.', [
          link('doc', 'OWASP LLM Top 10', 'https://owasp.org/www-project-top-10-for-large-language-model-applications/'),
          link('doc', 'Anthropic Safety Best Practices', 'https://docs.anthropic.com/en/docs/build-with-claude/strengthen-guardrails/overview'),
          link('doc', 'Google Responsible AI', 'https://ai.google/responsibility/')
        ]),
        topic('Serving, Monitoring, and Cost Control', ['high'], 'Learn batching, caching, fallback models, observability, and token-cost awareness.', [
          link('doc', 'vLLM Docs', 'https://docs.vllm.ai/'),
          link('doc', 'BentoML Docs', 'https://docs.bentoml.com/'),
          link('doc', 'Prometheus Docs', 'https://prometheus.io/docs/introduction/overview/')
        ]),
        topic('Portfolio, Research Habits, and Interview Prep', ['must'], 'Strong AI candidates can show experiments, write clean docs, and explain model choices under constraints.', [
          link('doc', 'Papers With Code', 'https://paperswithcode.com/'),
          link('doc', 'arXiv cs.LG recent', 'https://arxiv.org/list/cs.LG/recent'),
          link('yt', 'YT: Yannic Kilcher', 'https://www.youtube.com/@YannicKilcher')
        ])
      ],
      projects: [
        project('LLM App Scorecard Dashboard', 'Track latency, retrieval recall, citation coverage, failure examples, and cost per task for a deployed AI app.', ['Python', 'Metrics', 'Dashboard']),
        project('Research Reproduction Log', 'Reproduce one paper every few weeks, document deviations, and summarize findings for your portfolio.', ['PyTorch', 'Jupyter', 'Writing'])
      ],
      certificates: [
        cert('AI Engineering Roadmap Companion', 'Hugging Face - Free courses', 'https://huggingface.co/learn')
      ]
    }
  );

  ROADMAP_EXTENSIONS.ai.optionsPanel = '' +
    '<div class=\"intro-banner roadmap-callout\">' +
      '<div style=\"font-size:1.5rem\">AI</div>' +
      '<div>' +
        '<div class=\"intro-title\">Free AI Options You Can Use While Learning</div>' +
        '<div class=\"intro-text\">ChatGPT Free, Claude Free, Gemini web apps, Google AI Studio free-tier access in eligible regions, OpenRouter free models, and Hugging Face Spaces are all useful for practice. Availability and limits vary, so build your workflow to support multiple providers instead of depending on one tool.</div>' +
      '</div>' +
    '</div>';

  ROADMAP_EXTENSIONS.mlops.phases.push(
    {
      title: 'Software, Data, and Linux Foundations for MLOps',
      duration: '3-4 weeks',
      topics: [
        topic('Python for Production ML', ['must'], 'Go beyond notebooks: environments, packaging, typing, testing, and CLI workflows matter in real ML teams.', [
          link('doc', 'Real Python Learning Paths', 'https://realpython.com/'),
          link('doc', 'Python Packaging User Guide', 'https://packaging.python.org/'),
          link('doc', 'pytest Docs', 'https://docs.pytest.org/')
        ]),
        topic('Git, CI Basics, and Collaboration', ['must'], 'MLOps work depends on version control hygiene, code review discipline, and repeatable automation.', [
          link('doc', 'GitHub Actions Docs', 'https://docs.github.com/actions'),
          link('doc', 'Atlassian Git Tutorials', 'https://www.atlassian.com/git/tutorials'),
          link('yt', 'YT: Git and GitHub Crash Course', 'https://www.youtube.com/watch?v=RGOj5yH7evk')
        ]),
        topic('Linux, Shell, and Networking for ML Engineers', ['high'], 'You should be comfortable debugging containers, ports, processes, and file systems on servers.', [
          link('doc', 'The Linux Command Line - Free Book', 'https://linuxcommand.org/tlcl.php'),
          link('doc', 'DigitalOcean Linux Tutorials', 'https://www.digitalocean.com/community/tutorials'),
          link('yt', 'YT: Linux for Developers', 'https://www.youtube.com/watch?v=sWbUDq4S6Y8')
        ]),
        topic('SQL, Warehousing, and Data Contracts', ['high'], 'MLOps is easier when you can reason about data lineage, table health, joins, freshness, and schema changes.', [
          link('doc', 'Mode SQL Tutorial', 'https://mode.com/sql-tutorial/'),
          link('doc', 'dbt Fundamentals', 'https://learn.getdbt.com/'),
          link('doc', 'Great Expectations Docs', 'https://docs.greatexpectations.io/')
        ])
      ],
      projects: [
        project('Reusable ML Service Skeleton', 'Create a repo with Python packaging, linting, tests, configuration files, and CI for a simple model inference service.', ['Python', 'pytest', 'GitHub Actions']),
        project('Data Validation Starter', 'Build a small pipeline that checks schema, null ratios, and freshness before a model training step runs.', ['SQL', 'Python', 'Great Expectations'])
      ],
      certificates: [
        cert('MLOps Zoomcamp', 'DataTalksClub - Free', 'https://github.com/DataTalksClub/mlops-zoomcamp'),
        cert('Introduction to GitHub Actions', 'GitHub Skills - Free', 'https://skills.github.com/')
      ]
    },
    {
      title: 'Experiment Tracking, Pipelines, and Reproducibility',
      duration: '4 weeks',
      topics: [
        topic('Experiment Tracking and Metadata', ['faang', 'must'], 'Every serious ML team needs lineage: dataset version, code version, parameters, metrics, and artifacts.', [
          link('doc', 'MLflow Docs', 'https://mlflow.org/docs/latest/index.html'),
          link('doc', 'Weights and Biases Docs', 'https://docs.wandb.ai/'),
          link('doc', 'Neptune Docs', 'https://docs-legacy.neptune.ai/')
        ]),
        topic('Data and Model Versioning', ['must'], 'Reproducibility breaks fast without versioned training data, configs, and model artifacts.', [
          link('doc', 'DVC Docs', 'https://dvc.org/doc'),
          link('doc', 'LakeFS Docs', 'https://docs.lakefs.io/'),
          link('doc', 'Git LFS Docs', 'https://git-lfs.com/')
        ]),
        topic('Workflow Orchestration for Training Jobs', ['high'], 'Learn how scheduled and dependency-aware training pipelines work from raw data to validated model.', [
          link('doc', 'Prefect Docs', 'https://docs.prefect.io/'),
          link('doc', 'Airflow Docs', 'https://airflow.apache.org/docs/'),
          link('doc', 'Dagster Docs', 'https://docs.dagster.io/')
        ]),
        topic('Configuration, Feature Pipelines, and Repeatability', ['high'], 'Treat configuration as code and make training runs composable across environments.', [
          link('doc', 'Hydra Docs', 'https://hydra.cc/docs/intro/'),
          link('doc', 'OmegaConf Docs', 'https://omegaconf.readthedocs.io/'),
          link('doc', 'Feast Docs', 'https://docs.feast.dev/')
        ])
      ],
      projects: [
        project('Tracked Training Pipeline', 'Train a model with MLflow or W&B, version data with DVC, and orchestrate runs through Prefect or Dagster.', ['MLflow', 'DVC', 'Prefect']),
        project('Feature Pipeline Demo', 'Create offline feature generation plus a simple online-serving mock so you understand freshness and point-in-time correctness.', ['Python', 'SQL', 'Feast'])
      ],
      certificates: [
        cert('MLOps Specialization', 'Duke University / Coursera - Audit free', 'https://www.coursera.org/specializations/mlops-machine-learning-duke'),
        cert('Dagster University', 'Dagster - Free', 'https://courses.dagster.io/')
      ]
    },
    {
      title: 'Model Serving, Containers, and Deployment',
      duration: '4 weeks',
      topics: [
        topic('API Serving for Models', ['faang', 'must'], 'Start with simple, observable HTTP inference before jumping to large distributed serving stacks.', [
          link('doc', 'FastAPI Docs', 'https://fastapi.tiangolo.com/'),
          link('doc', 'BentoML Docs', 'https://docs.bentoml.com/'),
          link('doc', 'KServe Docs', 'https://kserve.github.io/website/')
        ]),
        topic('Docker and Container Build Hygiene', ['must'], 'Slim images, reproducible builds, secrets handling, and startup health checks are core deployment skills.', [
          link('doc', 'Docker Docs', 'https://docs.docker.com/'),
          link('doc', 'Docker Best Practices', 'https://docs.docker.com/develop/dev-best-practices/'),
          link('yt', 'YT: Docker for Beginners', 'https://www.youtube.com/watch?v=pg19Z8LL06w')
        ]),
        topic('Kubernetes and Inference Workloads', ['high'], 'You do not need to become a cluster wizard first, but you should understand pods, deployments, autoscaling, and rollout basics.', [
          link('doc', 'Kubernetes Basics', 'https://kubernetes.io/docs/tutorials/kubernetes-basics/'),
          link('doc', 'Argo Workflows Docs', 'https://argo-workflows.readthedocs.io/'),
          link('doc', 'Kubeflow Docs', 'https://www.kubeflow.org/docs/')
        ]),
        topic('Batch, Streaming, and Real-time Inference Patterns', ['high'], 'Pick the right serving mode based on latency budgets, throughput, retraining cadence, and cost.', [
          link('doc', 'Ray Serve Docs', 'https://docs.ray.io/en/latest/serve/'),
          link('doc', 'Kafka Concepts', 'https://kafka.apache.org/documentation/'),
          link('doc', 'AWS SageMaker Hosting Overview', 'https://docs.aws.amazon.com/sagemaker/latest/dg/hosting-faqs.html')
        ])
      ],
      projects: [
        project('Containerized Inference Service', 'Package a model with FastAPI or BentoML, add health checks and logging, and deploy it locally with Docker Compose.', ['FastAPI', 'Docker', 'REST']),
        project('Blue-Green Model Rollout Demo', 'Simulate a canary or blue-green rollout where one model version gradually replaces another while latency and quality are compared.', ['Kubernetes', 'Metrics', 'Deployment'])
      ],
      certificates: [
        cert('Docker Essentials', 'IBM / Coursera - Audit free', 'https://www.coursera.org/learn/docker-essentials'),
        cert('Introduction to Kubernetes', 'The Linux Foundation - Free', 'https://training.linuxfoundation.org/training/introduction-to-kubernetes/')
      ]
    },
    {
      title: 'Monitoring, Governance, and ML Platform Engineering',
      duration: 'Ongoing',
      topics: [
        topic('Model Monitoring and Data Drift', ['faang', 'must'], 'Production ML fails quietly without monitoring for feature drift, prediction quality, latency, and business KPIs.', [
          link('doc', 'Evidently Docs', 'https://docs.evidentlyai.com/'),
          link('doc', 'WhyLabs Docs', 'https://docs.whylabs.ai/'),
          link('doc', 'Prometheus Docs', 'https://prometheus.io/docs/introduction/overview/')
        ]),
        topic('Observability, Alerting, and Incident Response', ['high'], 'Logs alone are not enough. Learn dashboards, traces, SLOs, and practical on-call debugging.', [
          link('doc', 'Grafana Docs', 'https://grafana.com/docs/'),
          link('doc', 'OpenTelemetry Docs', 'https://opentelemetry.io/docs/'),
          link('doc', 'SRE Workbook', 'https://sre.google/workbook/table-of-contents/')
        ]),
        topic('Security, Governance, and Responsible Release Processes', ['high'], 'Access control, secrets, audit trails, approval gates, and compliance matter more as ML systems touch critical workflows.', [
          link('doc', 'OWASP MLOps Top 10', 'https://owasp.org/www-project-machine-learning-security-top-10/'),
          link('doc', 'NIST AI RMF', 'https://www.nist.gov/itl/ai-risk-management-framework'),
          link('doc', 'Google Cloud ML governance overview', 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning')
        ]),
        topic('Platform Thinking and Internal Tooling', ['advanced'], 'The best MLOps engineers reduce repeated work with templates, guardrails, and paved-road workflows.', [
          link('doc', 'Backstage Docs', 'https://backstage.io/docs/'),
          link('doc', 'Terraform Docs', 'https://developer.hashicorp.com/terraform/docs'),
          link('doc', 'Pulumi Docs', 'https://www.pulumi.com/docs/')
        ])
      ],
      projects: [
        project('ML Reliability Dashboard', 'Create dashboards for drift, service health, inference latency, and retraining triggers for one deployed model.', ['Grafana', 'Prometheus', 'Evidently']),
        project('Golden Path ML Template', 'Build an internal starter template that gives teams repo structure, CI, Docker, experiment tracking, deployment, and monitoring out of the box.', ['Terraform', 'GitHub Actions', 'Platform Engineering'])
      ],
      certificates: [
        cert('Google Cloud MLOps Fundamentals', 'Google Cloud Skills Boost - Free modules available', 'https://www.cloudskillsboost.google/paths'),
        cert('Practical MLOps', 'O\'Reilly companion material / book study', 'https://www.oreilly.com/library/view/practical-mlops/9781098103002/')
      ]
    }
  );

  ROADMAP_EXTENSIONS.dba.phases.push(
    {
      title: 'SQL, RDBMS Core, and Linux for Database Work',
      duration: '3-4 weeks',
      topics: [
        topic('Advanced SQL for Production Systems', ['faang', 'must'], 'Go past CRUD: joins, CTEs, windows, execution order, concurrency impact, and query readability all matter.', [
          link('doc', 'PostgreSQL Tutorial', 'https://www.postgresqltutorial.com/'),
          link('doc', 'Mode SQL Tutorial', 'https://mode.com/sql-tutorial/'),
          link('doc', 'SQLBolt', 'https://sqlbolt.com/')
        ]),
        topic('Database Internals Basics', ['must'], 'Learn pages, indexes, vacuuming, MVCC, transactions, WAL, locks, and checkpointing at a high level.', [
          link('doc', 'PostgreSQL Internals Overview', 'https://www.postgresql.org/docs/current/storage.html'),
          link('doc', 'Use The Index, Luke', 'https://use-the-index-luke.com/'),
          link('doc', 'High Performance SQLite', 'https://highperformancesqlite.com/')
        ]),
        topic('Linux Administration for DBAs', ['high'], 'A modern DBA needs confidence with processes, disks, permissions, memory pressure, systemd, and networking basics.', [
          link('doc', 'The Linux Command Line - Free Book', 'https://linuxcommand.org/tlcl.php'),
          link('doc', 'Red Hat Linux Basics', 'https://www.redhat.com/en/blog/category/linux'),
          link('yt', 'YT: Linux Crash Course', 'https://www.youtube.com/watch?v=IVquJh3DXUA')
        ]),
        topic('Shell Scripting and Automation', ['high'], 'The future-proof DBA automates backups, checks, reports, maintenance windows, and recovery drills.', [
          link('doc', 'GNU Bash Manual', 'https://www.gnu.org/software/bash/manual/bash.html'),
          link('doc', 'PowerShell Docs', 'https://learn.microsoft.com/powershell/'),
          link('doc', 'Ansible Docs', 'https://docs.ansible.com/')
        ])
      ],
      projects: [
        project('SQL Performance Workbook', 'Create a repo of query tuning before/after examples using joins, windows, indexes, and explain plans.', ['SQL', 'PostgreSQL', 'Benchmarking']),
        project('DBA Automation Scripts', 'Write scripts for user creation, backup verification, space checks, slow query reporting, and maintenance reminders.', ['Bash', 'PowerShell', 'Scheduling'])
      ],
      certificates: [
        cert('Relational Database Certification', 'freeCodeCamp - Free', 'https://www.freecodecamp.org/learn/relational-database/'),
        cert('PostgreSQL Exercises', 'PostgreSQL Exercises - Free', 'https://pgexercises.com/')
      ]
    },
    {
      title: 'Backup, Recovery, Replication, and High Availability',
      duration: '4 weeks',
      topics: [
        topic('Backup Strategies and Recovery Validation', ['faang', 'must'], 'Backups are only useful if you can restore them under pressure and prove RPO/RTO expectations.', [
          link('doc', 'pgBackRest Docs', 'https://pgbackrest.org/'),
          link('doc', 'PostgreSQL Backup and Restore', 'https://www.postgresql.org/docs/current/backup.html'),
          link('doc', 'Percona Backup Guides', 'https://docs.percona.com/')
        ]),
        topic('Replication, Failover, and HA Topologies', ['must'], 'Understand async vs sync replication, read replicas, failover orchestration, and split-brain risk.', [
          link('doc', 'PostgreSQL Replication', 'https://www.postgresql.org/docs/current/high-availability.html'),
          link('doc', 'MySQL Replication', 'https://dev.mysql.com/doc/refman/8.0/en/replication.html'),
          link('doc', 'Patroni Docs', 'https://patroni.readthedocs.io/')
        ]),
        topic('Disaster Recovery Runbooks', ['high'], 'Strong DBAs write and rehearse runbooks, not just architecture diagrams.', [
          link('doc', 'AWS Disaster Recovery Whitepaper', 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-of-on-premises-applications-to-aws.html'),
          link('doc', 'Google SRE Workbook', 'https://sre.google/workbook/table-of-contents/'),
          link('doc', 'Azure Business Continuity Docs', 'https://learn.microsoft.com/azure/architecture/framework/resiliency/')
        ]),
        topic('Capacity Planning and Storage Strategy', ['high'], 'Think in growth curves, IOPS, retention, indexing cost, maintenance windows, and archive policies.', [
          link('doc', 'AWS Well-Architected Performance Efficiency', 'https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html'),
          link('doc', 'Azure SQL performance guidance', 'https://learn.microsoft.com/azure/azure-sql/database/performance-guidance'),
          link('doc', 'Google Cloud SQL docs', 'https://cloud.google.com/sql/docs')
        ])
      ],
      projects: [
        project('Disaster Recovery Drill Lab', 'Set up a primary plus replica database, take backups, simulate failure, and restore to a target point in time.', ['PostgreSQL', 'Replication', 'Recovery']),
        project('HA Architecture Playbook', 'Document tradeoffs for read replicas, failover managers, connection pooling, and backup schedules for a growing app.', ['Architecture', 'Runbooks', 'Operations'])
      ],
      certificates: [
        cert('PostgreSQL Administration', 'EDB / Community resources', 'https://www.enterprisedb.com/training'),
        cert('AWS Database Offerings Overview', 'AWS Skill Builder - Free modules', 'https://explore.skillbuilder.aws/learn')
      ]
    },
    {
      title: 'Performance Tuning, Security, and Observability',
      duration: '4 weeks',
      topics: [
        topic('Execution Plans and Query Tuning', ['faang', 'must'], 'You should be able to read explain plans, identify bad joins, missing indexes, scan blowups, and cardinality surprises.', [
          link('doc', 'EXPLAIN in PostgreSQL', 'https://www.postgresql.org/docs/current/using-explain.html'),
          link('doc', 'Use The Index, Luke - SQL tuning', 'https://use-the-index-luke.com/sql/explain-plan'),
          link('doc', 'MySQL EXPLAIN Docs', 'https://dev.mysql.com/doc/refman/8.0/en/explain.html')
        ]),
        topic('Index Design and Table Maintenance', ['must'], 'Choose indexes based on workload, write amplification, bloat, vacuum cost, and access patterns.', [
          link('doc', 'PostgreSQL Indexes', 'https://www.postgresql.org/docs/current/indexes.html'),
          link('doc', 'pg_stat_statements Docs', 'https://www.postgresql.org/docs/current/pgstatstatements.html'),
          link('doc', 'Percona Monitoring Tools', 'https://www.percona.com/software/database-tools/percona-monitoring-and-management')
        ]),
        topic('Database Security and Compliance Basics', ['high'], 'Roles, least privilege, encryption, secret rotation, audit logs, and compliance boundaries are core future DBA skills.', [
          link('doc', 'OWASP Database Security Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html'),
          link('doc', 'PostgreSQL Client Authentication', 'https://www.postgresql.org/docs/current/client-authentication.html'),
          link('doc', 'HashiCorp Vault Docs', 'https://developer.hashicorp.com/vault/docs')
        ]),
        topic('Metrics, Logs, and Slow Query Observability', ['high'], 'Modern DBAs operate with dashboards, alert thresholds, and trend analysis instead of reactive firefighting alone.', [
          link('doc', 'Prometheus Docs', 'https://prometheus.io/docs/introduction/overview/'),
          link('doc', 'Grafana Docs', 'https://grafana.com/docs/'),
          link('doc', 'pgwatch Docs', 'https://github.com/cybertec-postgresql/pgwatch')
        ])
      ],
      projects: [
        project('Slow Query Tuning Dashboard', 'Collect slow queries, build explain-plan notes, and track p95 latency improvements after indexing and rewrites.', ['PostgreSQL', 'Grafana', 'Monitoring']),
        project('Security Hardening Checklist', 'Create a reusable hardening checklist for users, roles, network access, TLS, backup encryption, and audit readiness.', ['Security', 'Operations', 'Documentation'])
      ],
      certificates: [
        cert('Database Management Essentials', 'University of Colorado / Coursera - Audit free', 'https://www.coursera.org/learn/database-management'),
        cert('Monitoring and Observability Fundamentals', 'Grafana Labs - Free learning paths', 'https://grafana.com/tutorials/')
      ]
    },
    {
      title: 'Cloud Databases, Automation, and Future-Proof DBA Skills',
      duration: 'Ongoing',
      topics: [
        topic('Managed Cloud Databases and Platform Tradeoffs', ['faang', 'must'], 'Future DBAs increasingly own RDS, Cloud SQL, Azure SQL, Aurora, and managed cache/search choices.', [
          link('doc', 'Amazon RDS Docs', 'https://docs.aws.amazon.com/rds/'),
          link('doc', 'Azure SQL Docs', 'https://learn.microsoft.com/azure/azure-sql/'),
          link('doc', 'Google Cloud SQL Docs', 'https://cloud.google.com/sql/docs')
        ]),
        topic('Infrastructure as Code for Database Operations', ['high'], 'Provisioning, parameter groups, users, alerts, and backups should be reproducible through code.', [
          link('doc', 'Terraform AWS RDS resources', 'https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/db_instance'),
          link('doc', 'Terraform Azure SQL resources', 'https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs'),
          link('doc', 'Pulumi cloud database guides', 'https://www.pulumi.com/docs/')
        ]),
        topic('Data Platform Adjacency: Warehouses, Streams, and ETL', ['high'], 'The most resilient DBA career path includes enough warehouse, stream, and ingestion knowledge to partner with data engineering.', [
          link('doc', 'Snowflake Docs', 'https://docs.snowflake.com/'),
          link('doc', 'BigQuery Docs', 'https://cloud.google.com/bigquery/docs'),
          link('doc', 'Kafka Docs', 'https://kafka.apache.org/documentation/')
        ]),
        topic('Career Growth: SRE, Platform DBA, and Data Reliability', ['advanced'], 'The strongest long-term path is not just “database admin” but database reliability engineer, platform engineer, or data infrastructure owner.', [
          link('doc', 'Google SRE Book', 'https://sre.google/sre-book/table-of-contents/'),
          link('doc', 'dbt Data Reliability concepts', 'https://docs.getdbt.com/docs/build/data-tests'),
          link('doc', 'Data Engineering Zoomcamp', 'https://github.com/DataTalksClub/data-engineering-zoomcamp')
        ])
      ],
      projects: [
        project('Cloud Database Landing Zone', 'Provision a managed PostgreSQL instance with backups, alerts, parameter configuration, and secret management through Terraform.', ['AWS or Azure', 'Terraform', 'Security']),
        project('Database Reliability Portfolio', 'Document incidents, performance fixes, HA decisions, and automation work in a portfolio that positions you for platform or SRE-adjacent roles.', ['Writing', 'Runbooks', 'Operations'])
      ],
      certificates: [
        cert('AWS Cloud Practitioner Database Modules', 'AWS Skill Builder - Free modules', 'https://explore.skillbuilder.aws/learn'),
        cert('Microsoft Learn - Azure Data and SQL paths', 'Microsoft Learn - Free', 'https://learn.microsoft.com/training/')
      ]
    }
  );

  function renderBadges(badges){
    if(!badges || !badges.length) return '';
    return '<span class=\"badges\">' + badges.map(function(badge){
      return '<span class=\"' + (BADGE_CLASS[badge] || 'badge-med') + '\">' + (BADGE_LABEL[badge] || badge) + '</span>';
    }).join('') + '</span>';
  }

  function renderTopicCard(track, data){
    const links = (data.links || []).map(function(item){
      return '<a class=\"link-pill ' + (item.type || 'doc') + '\" href=\"' + item.url + '\" target=\"_blank\" rel=\"noopener noreferrer\">' + item.label + '</a>';
    }).join('');
    return `
      <div class="topic-card" data-track="${track}" data-topic="${data.name}">
        <div class="topic-name">${data.name} ${renderBadges(data.badges)}</div>
        ${data.note ? `<div class="topic-note">${data.note}</div>` : ''}
        <div class="link-row">${links}</div>
        <div class="topic-card-footer">
          <button class="mark-done-btn" type="button">Mark done</button>
          <button class="note-btn" type="button" title="Add note">Notes</button>
        </div>
        <div class="note-box" style="display:none">
          <textarea class="note-ta" placeholder="Your notes..." rows="3"></textarea>
        </div>
      </div>`;
  }

  function renderProjects(items){
    if(!items || !items.length) return '';
    return '<div class=\"section-label\">Projects</div>' + items.map(function(item){
      return '' +
        '<div class=\"proj-card\">' +
          '<div class=\"proj-title\">' + item.title + '</div>' +
          '<div class=\"proj-desc\">' + item.description + '</div>' +
          '<div class=\"link-row\">' + (item.tags || []).map(function(tag){ return '<span class=\"lang-tag\">' + tag + '</span>'; }).join('') + '</div>' +
        '</div>';
    }).join('');
  }

  function renderCertificates(items){
    if(!items || !items.length) return '';
    return '<div class=\"section-label\">Free Certificates / Study Tracks</div>' + items.map(function(item){
      return '' +
        '<div class=\"cert-card\">' +
          '<div class=\"cert-icon\">Cert</div>' +
          '<div class=\"cert-info\">' +
            '<div class=\"cert-name\">' + item.name + '</div>' +
            '<div class=\"cert-by\">' + item.provider + '</div>' +
          '</div>' +
          '<a class=\"link-pill cert\" href=\"' + item.url + '\" target=\"_blank\" rel=\"noopener noreferrer\">Open</a>' +
        '</div>';
    }).join('');
  }

  function renderPhase(track, phase, phaseIndex){
    const color = PHASE_COLORS[phaseIndex % PHASE_COLORS.length];
    const practiceCount = (phase.topics || []).reduce(function(sum, item){
      return sum + (item.links || []).filter(function(linkItem){
        return linkItem.type === 'lc' || linkItem.type === 'hr';
      }).length;
    }, 0);
    const meta = practiceCount > 0 ? (practiceCount + '+ practice links - ' + phase.duration) : phase.duration;

    return '' +
      '<div class=\"phase\" data-track=\"' + track + '\" data-phase=\"' + phaseIndex + '\">' +
        '<div class=\"phase-header\" data-action=\"toggle-phase\">' +
          '<div class=\"phase-badge\" style=\"background:' + color.bg + ';color:' + color.color + '\">Phase ' + (phaseIndex + 1) + '</div>' +
          '<div class=\"phase-title\">' + phase.title + '</div>' +
          '<div class=\"phase-meta\">' + meta + '</div>' +
          '<div class=\"phase-prog\"><div class=\"phase-prog-bar\"><div class=\"phase-prog-fill\" id=\"pp-' + track + '-' + phaseIndex + '\"></div></div><div class=\"phase-prog-pct\" id=\"ppt-' + track + '-' + phaseIndex + '\">0%</div></div>' +
          '<div class=\"chevron\">▼</div>' +
        '</div>' +
        '<div class=\"phase-body\">' +
          '<div class=\"topic-grid\">' + (phase.topics || []).map(function(item){ return renderTopicCard(track, item); }).join('') + '</div>' +
          renderProjects(phase.projects) +
          renderCertificates(phase.certificates) +
        '</div>' +
      '</div>';
  }

  function appendPhases(track, phases){
    const container = document.getElementById(track);
    if(!container || container.dataset.extended === 'true') return;
    const currentPhases = container.querySelectorAll('.phase[data-track][data-phase]').length;
    const markup = (phases || []).map(function(phase, index){
      return renderPhase(track, phase, currentPhases + index);
    }).join('');
    container.insertAdjacentHTML('beforeend', markup);
    container.dataset.extended = 'true';
  }

  function updateIntro(track, config){
    const container = document.getElementById(track);
    if(!container) return;
    const title = container.querySelector('.intro-title');
    const text = container.querySelector('.intro-text');
    if(title) title.textContent = config.introTitle;
    if(text) text.textContent = config.introText;
  }

  function refreshRoadmapSummary(){
    const dsa = document.getElementById('dsa');
    if(dsa){
      const practiceLinks = dsa.querySelectorAll('.link-pill.lc, .link-pill.hr').length;
      const topics = dsa.querySelectorAll('.topic-card[data-track=\"dsa\"]').length;
      const text = dsa.querySelector('.intro-text');
      if(text){
        text.innerHTML = practiceLinks + '+ curated practice links across ' + topics + ' DSA topics with beginner, medium, and advanced pattern coverage. <span class=\"badge-faang\">FAANG Must</span> marks patterns that come up repeatedly in top-company screens.';
      }
    }

    const web = document.getElementById('webdev');
    if(web){
      const topics = web.querySelectorAll('.topic-card[data-track=\"webdev\"]').length;
      const text = web.querySelector('.intro-text');
      if(text){
        text.textContent = 'A detailed full-stack path with ' + topics + '+ curated topics across frontend, backend, testing, security, and deployment. The focus is on production-ready habits, not just finishing tutorials.';
      }
    }

    const ai = document.getElementById('ai');
    if(ai){
      const topics = ai.querySelectorAll('.topic-card[data-track=\"ai\"]').length;
      const text = ai.querySelector('.intro-text');
      if(text){
        text.textContent = 'A more complete AI path with ' + topics + '+ curated topics spanning ML foundations, deep learning, LLM engineering, evaluation, safety, and provider ecosystem knowledge. It includes free learning options and production-focused tooling.';
      }
    }

    const mlops = document.getElementById('mlops');
    if(mlops){
      const topics = mlops.querySelectorAll('.topic-card[data-track=\"mlops\"]').length;
      const text = mlops.querySelector('.intro-text');
      if(text){
        text.textContent = 'A deployment-first MLOps path with ' + topics + '+ curated topics across experimentation, pipelines, serving, Kubernetes, monitoring, governance, and ML platform engineering.';
      }
    }

    const dba = document.getElementById('dba');
    if(dba){
      const topics = dba.querySelectorAll('.topic-card[data-track=\"dba\"]').length;
      const text = dba.querySelector('.intro-text');
      if(text){
        text.textContent = 'A future-proof DBA path with ' + topics + '+ curated topics covering SQL depth, internals, HA and DR, performance tuning, security, cloud databases, automation, and data platform growth.';
      }
    }
  }

  function apply(){
    Object.keys(ROADMAP_EXTENSIONS).forEach(function(track){
      updateIntro(track, ROADMAP_EXTENSIONS[track]);
      appendPhases(track, ROADMAP_EXTENSIONS[track].phases);
    });
    const ai = document.getElementById('ai');
    if(ai && ROADMAP_EXTENSIONS.ai.optionsPanel && !ai.querySelector('.roadmap-callout')){
      const intro = ai.querySelector('.intro-banner');
      if(intro){
        intro.insertAdjacentHTML('afterend', ROADMAP_EXTENSIONS.ai.optionsPanel);
      }
    }
    refreshRoadmapSummary();
  }

  window.RoadmapExtensions = {
    apply: apply,
    data: ROADMAP_EXTENSIONS,
    helpers: { link: link, cert: cert, project: project, topic: topic }
  };
})();
