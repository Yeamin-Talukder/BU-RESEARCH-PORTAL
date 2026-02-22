
<!-- PROJECT TITLE -->
<h1 align="center">🎓 BU Research Space</h1>
<p align="center">
  <strong>A Web-Based Academic Research Submission & Review Management System</strong>
</p>


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```



<p align="center">
  Streamlining university research submission, peer review, and publication.
</p>


---

## 📌 Overview

**BU Research Space** is a web-based platform designed to manage the submission, review, and publication of academic research papers within a university environment.

The system provides a **structured, transparent, and role-based platform** where students and faculty members can:

- 📄 Submit research papers  
- 👨‍⚖️ Participate in peer review  
- 🏛️ Manage editorial decisions  
- 📚 Access published papers across faculties and departments  

---

## 🎯 Purpose

Traditional journal management processes are often manual and time-consuming.  
**BU Research Space** simplifies and automates the workflow by handling:

- ✅ Paper Submission  
- ✅ Reviewer Assignment  
- ✅ Peer Review Process  
- ✅ Editorial Decision-Making  
- ✅ Final Publication  

The system ensures **secure role-based access control**, allowing users to perform their responsibilities efficiently.

---

## 👥 User Roles

### 🧑‍🎓 Student / Author
- Submit research papers
- Track submission status
- View feedback and decisions

### 👨‍🏫 Reviewer
- Review assigned papers
- Provide comments and recommendations

### 🏢 Editor / Admin
- Assign reviewers
- Make final decisions (Accept / Reject / Revise)
- Publish approved papers

---

## 🌟 Key Features

- 🔐 Secure Authentication & Authorization  
- 📂 Department & Faculty-Based Categorization  
- 🔄 Automated Review Workflow  
- 📊 Transparent Paper Status Tracking  
- 📖 Online Research Archive  
- 📑 Role-Based Dashboard  

---

## 🛠️ System Objectives

- Streamline university research management  
- Reduce manual paperwork  
- Ensure fairness and transparency  
- Provide a centralized research repository  
- Improve collaboration between students and faculty  

---

## 👨‍💻 Authors

| Name | Roll |
|------|------|
| **MD Yeamin Talukder** | 22 CSE 020 |
| **Khan Md Omar Faruk** | 22 CSE 018 |
| **MD Abdullah** | 22 CSE 048 |
| **Md Abdullah Al Noman** | 22 CSE 038 |
| **Md Riajuddin Sikder** | 22 CSE 016 |

---

## 🏫 Department

Department of Computer Science & Engineering  
Bangladesh University  

---

## 📜 License

This project was developed for academic purposes.

---

<p align="center">
  ⭐ If you like this project, consider giving it a star on GitHub!
</p>

