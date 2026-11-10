# GeekHub Skills Lab — Library Integration Design

**Status:** Design proposal; no database migration or production data changes have been made.  
**Target repository:** `misssifuna/library-management-system`  
**Working branch:** `feature/geekhub-skills-lab-design`

## 1. Existing application baseline

The current backend uses NestJS, Prisma 7 and PostgreSQL (Supabase). The current Prisma schema has three models:

- `User`: name, unique email, role (`PATRON` or `LIBRARIAN`), created date.
- `Genre`: unique name, optional description, related books.
- `Book`: title, author, optional unique ISBN, optional publication year, required Genre relation.

The current schema has no course, lesson, assessment, enrolment or learner-progress models. The README describes a backend application. This proposal therefore addresses the data/API foundation; a learner-facing web interface is a separate implementation stage.

## 2. Design principles

1. Preserve the existing Book–Genre relationship and all current library behaviour.
2. Do not model a lesson as a Book or a course category as a Genre.
3. Give learning content its own domain models and relationships.
4. Reuse the existing User identity for learners; a library patron can enrol in a learning path without introducing a second account system.
5. Use explicit resource types and links so slides, videos, PDFs and reference material can be attached to lessons.
6. Store lesson content in Markdown initially; this is portable, versionable and easy to render.
7. Build learner progress into the model, but keep enrolment and completion distinct.
8. Add the schema in stages and validate with a migration against a development database before any production deployment.

## 3. Library experience mapping

| Traditional library concept | Skills Lab equivalent | Data boundary |
|---|---|---|
| Books | Books remain books; learning paths are courses | Separate models |
| Genres | Book genres | Keep `Genre` specific to books |
| Subject/category browsing | Skills Lab subject areas | New `LearningSubject` |
| Book series/collections | Learning paths and modules | New learning models |
| Chapters | Lessons | New `Lesson` |
| Study guides/reference items | Lesson resources | New `LearningResource` |
| Revision cards | Flashcards and decks | New `FlashcardDeck`, `Flashcard` |
| Question banks | Practice questions | New `QuestionBank`, `PracticeQuestion` |
| Exercises | Assignments | New `Assignment` |
| Reading history | Enrolment and lesson progress | New learner-progress models |

The user experience can share navigation, search, tags and visual design while the database keeps books and learning content distinct.

## 4. Proposed domain model

### Catalogue and course structure

- **LearningSubject** — Skills Lab subject area, e.g. CRM, Software Development, Sales Support, Virtual Assistance.
- **LearningPath** — a course or structured learning path, with title, slug, summary, level and publication status.
- **LearningModule** — an ordered grouping of lessons within a learning path.
- **Lesson** — learner-facing lesson content, objectives, estimated duration and Markdown body; belongs to a module.

Relationship: one subject has many learning paths; one learning path has many modules; one module has many lessons.

### Lesson learning materials

- **LearningResource** — supporting item attached to a lesson: presentation, PDF, video, link, worksheet or reference. A PowerPoint is a resource attached to a lesson, not the lesson itself.
- **FlashcardDeck** and **Flashcard** — revision decks attached to a lesson, containing ordered front/back cards.
- **QuestionBank** and **PracticeQuestion** — ordered practice questions attached to a lesson, with question type, prompt, optional choices, correct answer, explanation and points.
- **Assignment** — practical work attached to a lesson, with instructions, submission guidance, maximum score and rubric.

### Learner activity

- **LearningEnrollment** — joins a User to a LearningPath; records enrolment date and status.
- **LessonProgress** — joins a User to a Lesson; records status, start/completion dates and optional last-viewed position.

Use unique constraints on (userId, learningPathId) and (userId, lessonId) to prevent duplicate enrolments/progress rows.

### Later extension, not required for the first schema increment

- Assignment submissions, instructor feedback and grades.
- Timed quizzes and assessment attempts.
- Per-card spaced-repetition history.
- Certificates and completion awards.
- Cohorts, facilitators and scheduled sessions.
- Fine-grained permissions and content versioning.

These should be introduced when actual workflows require them rather than overbuilding the first release.

## 5. User roles and access

The existing `PATRON` and `LIBRARIAN` roles should not be casually repurposed. In the first iteration:

- Public/published learning content can be browsed according to application policy.
- An authenticated User can enrol and track their own progress.
- Librarian-level content management can be implemented using the existing administrative role only if that matches the intended access policy.
- A later permissions design should distinguish content author, facilitator, learner and system administrator if the product needs those roles.

Do not expose one learner's progress or assignment work to another learner.

## 6. First pilot: CRM Fundamentals

Create one LearningSubject: **Business & Customer Operations** (or an agreed CRM-specific subject).

Create one LearningPath: **HubSpot CRM Fundamentals**, with five ordered modules or lessons:

1. CRM Fundamentals
2. Understanding HubSpot
3. Managing a Sales Pipeline
4. CRM Data Management
5. Reporting and Accountability

Each lesson can link to its learner notes, flashcard deck, question bank, assignment and (later) PowerPoint through the relevant relations. The existing course materials remain the source content for this pilot.

## 7. Recommended implementation sequence

1. Confirm this design and the learner/content-management access policy.
2. Add the first-stage Prisma models and relations on a feature branch.
3. Run Prisma formatting and validation locally.
4. Generate and inspect a migration against a development database; do not apply it to production.
5. Seed the CRM Fundamentals subject, learning path, five lessons and their learning resources.
6. Add NestJS modules/services/controllers for read-only catalogue and lesson retrieval.
7. Add enrolment and learner progress endpoints with ownership checks.
8. Add flashcards and practice-question endpoints.
9. Add assignment submission and marking only after the workflow is agreed.
10. Build the learner interface and later attach PowerPoint resources.

## 8. Migration and data-safety notes

- Existing tables and rows must remain intact.
- New relations to User should use explicit foreign keys and deliberate delete behaviour.
- Do not cascade-delete a learner's account because a course is deleted; use restrictive or archival behaviour for learning records.
- Prefer publication status/archiving over destructive deletion of learning content that learners may already have used.
- The repository contains a Prisma migration lock file, but the current database's migration history must be checked before applying any migration. Do not assume that a schema push or migration is safe merely because local validation passes.
- Keep secrets and database connection strings out of GitHub and all learner-facing files.

## 9. Decisions to confirm before implementing schema

- Should all authenticated patrons be able to enrol, or should Skills Lab be restricted to invited GeekHub learners?
- Who may create/edit/publish learning paths: librarians, designated instructors, or both?
- Should lessons be publicly readable before enrolment, or only after enrolment?
- Should assignment submission and marking be part of the first release, or follow after lessons, flashcards and practice questions?

## 10. Acceptance criteria for the first release

- Existing books, genres and users continue to work.
- A learner can browse published learning paths and open lessons.
- A learning path presents modules and ordered lessons.
- A lesson can expose flashcards, practice questions, assignments and attached resources.
- A learner can enrol and track their own lesson progress.
- PowerPoint files can be attached later without changing the lesson content model.
- No learner can read or modify another learner's private progress.
