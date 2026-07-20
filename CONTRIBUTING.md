# Contributing to Awesome AI Platform

First off, thank you for taking the time to contribute! 🎉 We welcome code contributions, documentation improvements, issue reporting, and suggestions.

To ensure a smooth collaboration, please follow the guidelines below.

---

## 💬 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to the project maintainers.

---

## 🛠️ Getting Started

1.  **Fork the Repository**: Create a personal fork on GitHub.
2.  **Clone the Repository**: Clone your fork locally.
3.  **Install dependencies**:
    ```bash
    pnpm install
    ```
4.  **Create a Branch**:
    *   For features: `feature/your-feature-name`
    *   For bug fixes: `bugfix/issue-id-short-description`
    *   For documentation: `docs/short-description`

---

## 📝 Submitting Proposals (RFCs & Design Docs)

For major features or architectural changes, we require an **RFC (Request for Comments)** or **Design Document** before writing code.
1.  Create an issue using the **RFC / Architecture Proposal** template.
2.  Discuss the approach with the maintainers.
3.  Once aligned, a maintainer will approve the proposal, and you can proceed to implementation.

---

## 💻 Development Workflow

### Code Style & Formatting

We use Prettier and ESLint to maintain a consistent code style across the monorepo.
*   **Format your code** before committing:
    ```bash
    pnpm format
    ```
*   **Lint your code** to verify there are no errors:
    ```bash
    pnpm lint
    ```

### Writing Tests

We value high test coverage. Every new component, helper, or utility should have associated unit or integration tests.
*   Run tests locally:
    ```bash
    pnpm test
    ```

---

## 🚀 Creating a Pull Request

1.  **Keep it Focused**: Ensure your PR addresses a single issue or feature.
2.  **Follow the Template**: Fill in the PR description template entirely.
3.  **Include Tests**: Verify that any code changes are covered by tests.
4.  **Check CI/CD**: Ensure all automated checks (lint, format, build, tests) pass on your PR.

---

Thank you for contributing!
