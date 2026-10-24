const option = (questionId, number, text, correct = false) => ({
  id: `${questionId}-option-${number}`,
  text,
  correct,
});

const question = (id, prompt, type, category, points, answers) => ({
  id,
  prompt,
  type,
  category,
  points,
  options: answers.map(([text, correct], index) => option(id, index + 1, text, correct)),
});

export const sampleQuestions = [
  question('sample-q-01', 'Which document defines the functional and nonfunctional requirements of a software system?', 'SINGLE', 'Software Engineering', 1, [
    ['Software Requirements Specification', true], ['Deployment log', false], ['Source code repository', false], ['Test execution report', false],
  ]),
  question('sample-q-02', 'Which activities are part of requirements engineering?', 'MULTI', 'Software Engineering', 2, [
    ['Eliciting stakeholder needs', true], ['Validating requirements', true], ['Compiling production binaries', false], ['Managing requirement changes', true],
  ]),
  question('sample-q-03', 'In a use case diagram, what does an actor represent?', 'SINGLE', 'Software Engineering', 1, [
    ['An external role that interacts with the system', true], ['A database table', false], ['A class constructor', false], ['A server process', false],
  ]),
  question('sample-q-04', 'Which qualities make a requirement testable?', 'MULTI', 'Software Engineering', 2, [
    ['It has an observable outcome', true], ['It uses measurable acceptance criteria', true], ['It relies on vague words such as fast', false], ['It can be verified by a defined test', true],
  ]),
  question('sample-q-05', 'What does a primary key do in a relational table?', 'SINGLE', 'Database Systems', 1, [
    ['Uniquely identifies each row', true], ['Encrypts all columns', false], ['Sorts every query automatically', false], ['Replaces foreign keys', false],
  ]),
  question('sample-q-06', 'Which statements about foreign keys are correct?', 'MULTI', 'Database Systems', 2, [
    ['They can reference a key in another table', true], ['They help enforce referential integrity', true], ['They always contain unique values', false], ['They can model relationships between tables', true],
  ]),
  question('sample-q-07', 'Which SQL clause filters rows before grouping?', 'SINGLE', 'Database Systems', 1, [
    ['WHERE', true], ['HAVING', false], ['ORDER BY', false], ['LIMIT', false],
  ]),
  question('sample-q-08', 'Which are common benefits of database normalization?', 'MULTI', 'Database Systems', 2, [
    ['Reducing unnecessary data duplication', true], ['Improving consistency when data changes', true], ['Guaranteeing every query is faster', false], ['Making relationships clearer', true],
  ]),
  question('sample-q-09', 'Which HTTP method is normally used to retrieve a resource?', 'SINGLE', 'Web Fundamentals', 1, [
    ['GET', true], ['POST', false], ['PATCH', false], ['DELETE', false],
  ]),
  question('sample-q-10', 'Which practices help protect a web application?', 'MULTI', 'Web Fundamentals', 2, [
    ['Validate input on the server', true], ['Use HTTPS for sensitive traffic', true], ['Store passwords in plain text', false], ['Apply role-based authorization', true],
  ]),
  question('sample-q-11', 'What does a 404 HTTP response indicate?', 'SINGLE', 'Web Fundamentals', 1, [
    ['The requested resource was not found', true], ['The request succeeded', false], ['The server is permanently unavailable', false], ['Authentication succeeded', false],
  ]),
  question('sample-q-12', 'Which statements about REST APIs are generally correct?', 'MULTI', 'Web Fundamentals', 2, [
    ['Resources are identified by URLs', true], ['HTTP methods express operations', true], ['Every request must use a browser page', false], ['Status codes communicate outcomes', true],
  ]),
];

function localDateTime(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function makeSampleExams(now = new Date()) {
  const startAt = localDateTime(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const endAt = localDateTime(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
  return [
    {
      id: 'sample-exam-software', title: 'Software Engineering Essentials', duration: 20,
      startAt, endAt, questions: sampleQuestions.slice(0, 4).map((item) => item.id),
      students: ['student@oes.local'], randomQuestions: false, randomOptions: false, status: 'PUBLISHED',
    },
    {
      id: 'sample-exam-database', title: 'Database Systems Basics', duration: 20,
      startAt, endAt, questions: sampleQuestions.slice(4, 8).map((item) => item.id),
      students: ['student@oes.local'], randomQuestions: true, randomOptions: true, status: 'PUBLISHED',
    },
    {
      id: 'sample-exam-web', title: 'Web Fundamentals Practice', duration: 25,
      startAt, endAt, questions: sampleQuestions.slice(8, 12).map((item) => item.id),
      students: [], randomQuestions: false, randomOptions: false, status: 'DRAFT',
    },
  ];
}
