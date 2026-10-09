# BOOKHUB

BOOKHUB is a React-based library borrowing and return management system.

## Run locally

```bash
npm install
npm run dev
```

The app stores library records in the browser's local storage so updates are shared between tabs. Each tab keeps its own sign-in session, allowing different users to use BOOKHUB in separate tabs in the same browser.

Administrators can create student accounts from **Borrowers**. Student emails are generated from the surname and first-name initial (for example, `santosa@students.edu.ph`); the administrator sets a temporary password. Librarian accounts can be created from **Users / Staff**, with generated addresses at `@lib.ph` and an administrator-set password.

## Demo sign-in

- Admin: `admin@lrc.ph` / `admin123`
- Librarians: an administrator must create the staff account and set its password first.
- Students and employees: select the account type and create an account, or sign in with an existing account.

Authentication is local to the browser and is for demonstration only. Use a trusted authentication service and server-enforced role permissions before deployment.