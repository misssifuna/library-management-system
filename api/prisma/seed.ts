import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const genres = [
    {
      name: 'Fiction',
      description: 'Imaginary stories and literary narratives.',
    },
    {
      name: 'Science',
      description: 'Books about scientific discoveries and principles.',
    },
    {
      name: 'History',
      description: 'Books about historical events and civilizations.',
    },
    {
      name: 'Technology',
      description: 'Books about computing and modern technology.',
    },
  ];

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { name: genre.name },
      update: { description: genre.description },
      create: genre,
    });
  }

  const books = [
    // Fiction
    { title: 'Things Fall Apart', author: 'Chinua Achebe', genre: 'Fiction' },
    { title: 'The River Between', author: 'Ngugi wa Thiong’o', genre: 'Fiction' },
    { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', genre: 'Fiction' },
    { title: 'The Old Man and the Sea', author: 'Ernest Hemingway', genre: 'Fiction' },
    { title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Fiction' },

    // Science
    { title: 'A Brief History of Time', author: 'Stephen Hawking', genre: 'Science' },
    { title: 'The Selfish Gene', author: 'Richard Dawkins', genre: 'Science' },
    { title: 'Cosmos', author: 'Carl Sagan', genre: 'Science' },
    { title: 'The Gene', author: 'Siddhartha Mukherjee', genre: 'Science' },
    { title: 'Silent Spring', author: 'Rachel Carson', genre: 'Science' },

    // History
    { title: 'The History of Africa', author: 'Kevin Shillington', genre: 'History' },
    { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', genre: 'History' },
    { title: 'The Wretched of the Earth', author: 'Frantz Fanon', genre: 'History' },
    { title: 'Long Walk to Freedom', author: 'Nelson Mandela', genre: 'History' },
    { title: 'The Art of War', author: 'Sun Tzu', genre: 'History' },

    // Technology
    { title: 'Clean Code', author: 'Robert C. Martin', genre: 'Technology' },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt and David Thomas', genre: 'Technology' },
    { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen et al.', genre: 'Technology' },
    { title: 'Code', author: 'Charles Petzold', genre: 'Technology' },
    { title: 'The Innovators', author: 'Walter Isaacson', genre: 'Technology' },
  ];

  for (const book of books) {
    const genre = await prisma.genre.findUniqueOrThrow({
      where: { name: book.genre },
    });

        const existingBook = await prisma.book.findFirst({
      where: {
        title: book.title,
        author: book.author,
      },
    });

    if (existingBook) {
      await prisma.book.update({
        where: { id: existingBook.id },
        data: { genreId: genre.id },
      });
    } else {
      await prisma.book.create({
        data: {
          title: book.title,
          author: book.author,
          genreId: genre.id,
        },
      });
    }
  }

  console.log(`Seeded ${genres.length} genres and ${books.length} books.`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
