const day = 24 * 60 * 60 * 1000
const dateFromToday = (offset) => new Date(Date.now() + offset * day).toISOString().slice(0, 10)

export const initialBooks = [
  { id: 'BK-1042', title: 'The Midnight Library', author: 'Matt Haig', category: 'Fiction', isbn: '9780525559474', year: 2020, copies: 5, available: 3, borrowed: 42, tone: 'cover-midnight' },
  { id: 'BK-1043', title: 'Atomic Habits', author: 'James Clear', category: 'Self Development', isbn: '9780735211292', year: 2018, copies: 4, available: 1, borrowed: 38, tone: 'cover-habits' },
  { id: 'BK-1044', title: 'The Silent Patient', author: 'Alex Michaelides', category: 'Mystery', isbn: '9781250301697', year: 2019, copies: 3, available: 2, borrowed: 31, tone: 'cover-silent' },
  { id: 'BK-1045', title: 'Educated', author: 'Tara Westover', category: 'Biography', isbn: '9780399590504', year: 2018, copies: 4, available: 4, borrowed: 27, tone: 'cover-educated' },
  { id: 'BK-1046', title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Technology', isbn: '9780465050659', year: 2013, copies: 3, available: 0, borrowed: 24, tone: 'cover-design' },
  { id: 'BK-1047', title: 'Ikigai', author: 'Héctor García', category: 'Lifestyle', isbn: '9780143130727', year: 2016, copies: 5, available: 2, borrowed: 22, tone: 'cover-ikigai' },
  { id: 'BK-1048', title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', isbn: '9780062316097', year: 2011, copies: 4, available: 3, borrowed: 19, tone: 'cover-sapiens' },
  { id: 'BK-1049', title: 'Little Women', author: 'Louisa May Alcott', category: 'Fiction', isbn: '9780147514011', year: 1868, copies: 6, available: 5, borrowed: 17, tone: 'cover-women' },
  { id: 'BK-1050', title: 'Deep Work', author: 'Cal Newport', category: 'Self Development', isbn: '9781455586691', year: 2016, copies: 3, available: 2, borrowed: 15, tone: 'cover-deep' },
  { id: 'BK-1051', title: 'The Song of Achilles', author: 'Madeline Miller', category: 'Fiction', isbn: '9780062060624', year: 2011, copies: 3, available: 1, borrowed: 13, tone: 'cover-achilles' },
  { id: 'BK-1052', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Psychology', isbn: '9780374533557', year: 2011, copies: 2, available: 2, borrowed: 12, tone: 'cover-thinking' },
  { id: 'BK-1053', title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction', isbn: '9780062315007', year: 1988, copies: 4, available: 3, borrowed: 10, tone: 'cover-alchemist' },
]

export const initialBorrowers = [
  { id: '2024-0182', name: 'Isabella Reyes', email: 'isabella.reyes@students.edu.ph', course: 'BS Information Technology', joined: '2024-08-18', status: 'Active', borrowed: 2 },
  { id: '2023-0094', name: 'Gabriel Santos', email: 'gabriel.santos@students.edu.ph', course: 'BS Computer Science', joined: '2023-09-02', status: 'Active', borrowed: 1 },
  { id: '2024-0221', name: 'Mia Dela Cruz', email: 'mia.delacruz@students.edu.ph', course: 'BS Communication', joined: '2024-08-23', status: 'Active', borrowed: 3 },
  { id: '2022-0117', name: 'Liam Villanueva', email: 'liam.villanueva@students.edu.ph', course: 'BS Architecture', joined: '2022-07-12', status: 'On hold', borrowed: 1 },
  { id: '2023-0156', name: 'Sofia Mendoza', email: 'sofia.mendoza@students.edu.ph', course: 'BS Psychology', joined: '2023-08-29', status: 'Active', borrowed: 0 },
  { id: '2024-0318', name: 'Noah Garcia', email: 'noah.garcia@students.edu.ph', course: 'BS Information Systems', joined: '2024-09-05', status: 'Active', borrowed: 1 },
]

export const initialTransactions = [
  { id: 'TRX-0281', borrowerId: '2024-0182', borrower: 'Isabella Reyes', bookId: 'BK-1042', title: 'The Midnight Library', issued: dateFromToday(-4), due: dateFromToday(10), status: 'Borrowed', fine: 0 },
  { id: 'TRX-0280', borrowerId: '2023-0094', borrower: 'Gabriel Santos', bookId: 'BK-1043', title: 'Atomic Habits', issued: dateFromToday(-18), due: dateFromToday(-4), status: 'Overdue', fine: 20 },
  { id: 'TRX-0279', borrowerId: '2024-0221', borrower: 'Mia Dela Cruz', bookId: 'BK-1044', title: 'The Silent Patient', issued: dateFromToday(-2), due: dateFromToday(12), status: 'Borrowed', fine: 0 },
  { id: 'TRX-0278', borrowerId: '2024-0182', borrower: 'Isabella Reyes', bookId: 'BK-1046', title: 'The Design of Everyday Things', issued: dateFromToday(-28), due: dateFromToday(-14), returned: dateFromToday(-10), status: 'Returned', fine: 0 },
  { id: 'TRX-0277', borrowerId: '2022-0117', borrower: 'Liam Villanueva', bookId: 'BK-1047', title: 'Ikigai', issued: dateFromToday(-21), due: dateFromToday(-7), status: 'Overdue', fine: 35 },
  { id: 'TRX-0276', borrowerId: '2024-0318', borrower: 'Noah Garcia', bookId: 'BK-1048', title: 'Sapiens', issued: dateFromToday(-6), due: dateFromToday(8), status: 'Borrowed', fine: 0 },
  { id: 'TRX-0275', borrowerId: '2024-0221', borrower: 'Mia Dela Cruz', bookId: 'BK-1049', title: 'Little Women', issued: dateFromToday(-35), due: dateFromToday(-21), returned: dateFromToday(-22), status: 'Returned', fine: 0 },
  { id: 'TRX-0274', borrowerId: '2023-0156', borrower: 'Sofia Mendoza', bookId: 'BK-1050', title: 'Deep Work', issued: dateFromToday(-8), due: dateFromToday(6), status: 'Borrowed', fine: 0 },
]

export const initialStaff = [
  { id: 'ST-001', name: 'Leona De Chavez', email: 'admin@lrc.ph', role: 'Administrator', status: 'Active' },
  { id: 'ST-002', name: 'Bench', email: 'carlo.bautista@lib.ph', role: 'Librarian', status: 'Active' },
  { id: 'ST-003', name: 'Patricia Lim', email: 'patricia.lim@lib.ph', role: 'Librarian', status: 'Active' },
]

export const initialSettings = {
  libraryName: 'BookHub Library',
  email: 'library@edu.ph',
  loanDays: 14,
  maxBooks: 3,
  fineRate: 5,
  renewals: 1,
  dueReminders: true,
  overdueAlerts: true,
  newArrivals: false,
  twoFactor: true,
  sessionTimeout: 30,
}