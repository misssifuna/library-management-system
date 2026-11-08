# Library Management System

A backend application for managing a library's books, genres, and users. The project uses NestJS, Prisma ORM, and PostgreSQL hosted on Supabase.

## Technology Stack

- **Backend:** NestJS
- **ORM:** Prisma 7
- **Database:** PostgreSQL (Supabase)
- **Language:** TypeScript

## Database Models

The database currently contains three core models:

- **User:** Stores user details, including name, email, and role.
- **Genre:** Stores book genres and their descriptions.
- **Book:** Stores book details and references its genre.

The `Role` enum defines two user roles: `PATRON` and `LIBRARIAN`.

## Schema Decisions

The `Book` model references the `Genre` model through a `genreId` foreign key instead of embedding genre information directly in each book record.

This relational design avoids duplicating genre names and descriptions across multiple books. It also ensures consistency: when a genre's description or other shared information changes, it only needs to be updated in one place.

The one-to-many relationship allows one genre to be associated with many books, while each book references one genre. The foreign key constraint helps maintain referential integrity by ensuring that every book is associated with an existing genre.

This approach is appropriate for a relational PostgreSQL database because it supports structured relationships, data consistency, and efficient querying.

## Database Setup

1. Navigate to the API directory:

   ```bash
   cd api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your local environment file using `.env.example` as a reference. Set your own PostgreSQL `DATABASE_URL`.

4. Generate the Prisma Client:

   ```bash
   npx prisma generate
   ```

5. Apply database migrations:

   ```bash
   npx prisma migrate dev
   ```

6. Seed the database:

   ```bash
   npx prisma db seed
   ```

## Seed Data

The seed script creates four genres and twenty books distributed across those genres. It uses upsert logic for genres and checks for existing books before inserting them, helping avoid duplicate seed records when the script is run again.
