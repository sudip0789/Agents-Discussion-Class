/*
 * Class 3 Workbook — page list.
 * The sidebar, Previous / Next buttons and progress ticks are built from this list.
 * `checkpoint: true` marks lessons that end with a "You're done when..." box.
 */
window.C3_PAGES = [
  // Lessons, Part 1: Foundations
  { id: "lesson-00", group: "lessons", part: 1, num: "0", title: "Welcome", path: "index.html" },
  { id: "lesson-01", group: "lessons", part: 1, num: "1", title: "From chat to agents", path: "lessons/lesson-01-from-chat-to-agents.html" },
  { id: "lesson-02", group: "lessons", part: 1, num: "2", title: "Workflows, agents, and tools", path: "lessons/lesson-02-workflows-agents-and-tools.html" },
  { id: "lesson-03", group: "lessons", part: 1, num: "3", title: "Guardrails", path: "lessons/lesson-03-guardrails.html" },
  { id: "lesson-04", group: "lessons", part: 1, num: "4", title: "Skills, and how to vet them", path: "lessons/lesson-04-skills.html" },
  { id: "lesson-05", group: "lessons", part: 1, num: "5", title: "Where agents get facts", path: "lessons/lesson-05-where-agents-get-facts.html" },

  // Lessons, Part 2: Build
  { id: "lesson-06", group: "lessons", part: 2, num: "6", title: "Set up your project", path: "lessons/lesson-06-set-up-your-project.html", checkpoint: true },
  { id: "lesson-07", group: "lessons", part: 2, num: "7", title: "Build the case briefer", path: "lessons/lesson-07-build-the-briefer.html", checkpoint: true },
  { id: "lesson-08", group: "lessons", part: 2, num: "8", title: "Add a checker and /brief", path: "lessons/lesson-08-checker-and-brief-command.html", checkpoint: true },
  { id: "lesson-09", group: "lessons", part: 2, num: "9", title: "Break it, then lock it", path: "lessons/lesson-09-test-and-lock.html", checkpoint: true },
  { id: "lesson-10", group: "lessons", part: 2, num: "10", title: "Switch to CourtListener", path: "lessons/lesson-10-switch-to-courtlistener.html", checkpoint: true },
  { id: "lesson-11", group: "lessons", part: 2, num: "11", title: "Save and share: Git vs GitHub", path: "lessons/lesson-11-git-and-github.html", checkpoint: true },
  { id: "lesson-12", group: "lessons", part: 2, num: "12", title: "Risks of using agents", path: "lessons/lesson-12-risks-and-the-library.html" },
  { id: "lesson-13", group: "lessons", part: 2, num: "13", title: "Wrap-up", path: "lessons/lesson-13-wrap-up.html" },

  // Concept notes
  { id: "note-01", group: "notes", num: "N1", title: "Models", path: "notes/note-01-models.html" },
  { id: "note-02", group: "notes", num: "N2", title: "Workflows vs agents", path: "notes/note-02-workflows-vs-agents.html" },
  { id: "note-03", group: "notes", num: "N3", title: "Tools and permissions", path: "notes/note-03-tools-and-permissions.html" },
  { id: "note-04", group: "notes", num: "N4", title: "Skills, and how to choose them", path: "notes/note-04-skills.html" },
  { id: "note-05", group: "notes", num: "N5", title: "APIs and databases", path: "notes/note-05-apis-and-databases.html" },
  { id: "note-06", group: "notes", num: "N6", title: "Git and GitHub", path: "notes/note-06-git-and-github.html" },
  { id: "note-07", group: "notes", num: "N7", title: "Risks and guardrails", path: "notes/note-07-risks-and-guardrails.html" },
  { id: "note-08", group: "notes", num: "N8", title: "VS Code and code basics", path: "notes/note-08-vscode-and-code-basics.html" },

  // Resources
  { id: "glossary", group: "resources", title: "Glossary", path: "resources/glossary.html" },
  { id: "all-prompts", group: "resources", title: "All prompts", path: "resources/all-prompts.html" },
  { id: "further-reading", group: "resources", title: "Further reading", path: "resources/further-reading.html" },
];
