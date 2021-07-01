process.env.NODE_ENV = 'test';

const request = require('supertest');
const db = require('../db');
const books = require('../routes/books');
const app = require('../app');

const bookOne = {
  isbn: '0691161518',
  amazon_url: 'http://a.co/eobPtX2',
  author: 'Matthew Lane',
  language: 'english',
  pages: 264,
  publisher: 'Princeton University Press',
  title: 'Power-Up: Unlocking the Hidden Mathematics in Video Games',
  year: 2017,
};

const bookTwo = {
  isbn: '06341161518',
  amazon_url: 'http://a.co/eobPtX2',
  author: 'Test Author',
  language: 'english',
  pages: 200,
  publisher: 'Test Publisher',
  title: 'Test Title',
  year: 2005,
};

const bookTwoError = {
  isbn: '06341161518',
  amazon_url: 'http://a.co/eobPtX2',
  author: 'Test Author',
  language: 'english',
  pages: 200,
  publisher: 'Test Publisher',
  title: 'Test Title',
};

const bookTwoUpdate = {
  amazon_url: 'http://a.co/eobPtX2',
  author: 'Test Author Update',
  language: 'english',
  pages: 250,
  publisher: 'Test Publisher Update',
  title: 'Test Title Update',
  year: 2000,
};

beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO books (
            isbn,
            amazon_url,
            author,
            language,
            pages,
            publisher,
            title,
            year) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING isbn,
                   amazon_url,
                   author,
                   language,
                   pages,
                   publisher,
                   title,
                   year`,
    [
      bookOne.isbn,
      bookOne.amazon_url,
      bookOne.author,
      bookOne.language,
      bookOne.pages,
      bookOne.publisher,
      bookOne.title,
      bookOne.year,
    ]
  );
});

afterEach(async () => {
  await db.query(`DELETE FROM books`);
});

afterAll(async () => {
  await db.end();
});

// Testing Get
describe('GET /books', () => {
  test('Get a list of all books', async () => {
    const res = await request(app).get('/books');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      books: [
        {
          isbn: '0691161518',
          amazon_url: 'http://a.co/eobPtX2',
          author: 'Matthew Lane',
          language: 'english',
          pages: 264,
          publisher: 'Princeton University Press',
          title: 'Power-Up: Unlocking the Hidden Mathematics in Video Games',
          year: 2017,
        },
      ],
    });
  });
});

describe('GET /books/:isbn', () => {
  test('Get a single book', async () => {
    const res = await request(app).get(`/books/${bookOne.isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      book: {
        isbn: '0691161518',
        amazon_url: 'http://a.co/eobPtX2',
        author: 'Matthew Lane',
        language: 'english',
        pages: 264,
        publisher: 'Princeton University Press',
        title: 'Power-Up: Unlocking the Hidden Mathematics in Video Games',
        year: 2017,
      },
    });
  });
});

describe('POST /books', () => {
  test('Create a book', async () => {
    const res = await request(app).post('/books').send(bookTwo);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      book: {
        isbn: '06341161518',
        amazon_url: 'http://a.co/eobPtX2',
        author: 'Test Author',
        language: 'english',
        pages: 200,
        publisher: 'Test Publisher',
        title: 'Test Title',
        year: 2005,
      },
    });
  });
  test('Test JSONSchema Error', async () => {
    const res = await request(app).post('/books').send(bookTwoError);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: { message: ['instance requires property "year"'], status: 400 },
      message: ['instance requires property "year"'],
    });
  });
});

describe('PUT /books/:isbn', () => {
  test('Create a book', async () => {
    const res = await request(app)
      .put(`/books/${bookOne.isbn}`)
      .send(bookTwoUpdate);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      book: {
        isbn: '0691161518',
        amazon_url: 'http://a.co/eobPtX2',
        author: 'Test Author Update',
        language: 'english',
        pages: 250,
        publisher: 'Test Publisher Update',
        title: 'Test Title Update',
        year: 2000,
      },
    });
  });
});

describe('DELETE /books/:isbn', () => {
  test('Delete a single book', async () => {
    const res = await request(app).delete(`/books/${bookOne.isbn}`);
    expect(res.statusCode).toBe(200);
  });
});
