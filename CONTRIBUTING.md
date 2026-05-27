# Contributing to Bird Watch

Thank you for your interest in contributing to Bird Watch! This document provides guidelines and instructions for contributing to the project.

[繁體中文版本](CONTRIBUTING-tw.md)

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please be respectful and constructive in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/bird-watch.git
   cd bird-watch
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/bird-watch.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run tests
npm run test

# Build the project
npm run build
```

### 4. Commit Your Changes

Follow the commit message guidelines:

```bash
git add .
git commit -m "feat: add bird identification mini-game"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

Go to GitHub and create a Pull Request from your fork to the main repository.

## 💻 Coding Standards

### TypeScript

- Use TypeScript strict mode
- Provide type annotations for all public APIs
- Avoid using `any` type
- Use interfaces for object shapes
- Use enums for fixed sets of values

```typescript
// Good
interface BirdData {
  id: string;
  name: string;
  rarity: BirdRarity;
}

// Bad
const bird: any = { ... };
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use UPPER_CASE for constants

```typescript
// Good
const birdName = 'Taiwan Blue Magpie';
const MAX_BIRDS = 100;

class BirdSpawner {
  spawnBird(): void { }
}

// Bad
const bird_name = "Taiwan Blue Magpie";
const maxBirds = 100;
```

### File Organization

- One class per file
- Group related functionality
- Use barrel exports (index.ts)
- Keep files under 500 lines

```typescript
// src/systems/index.ts
export { QuestSystem } from './QuestSystem';
export { AchievementSystem } from './AchievementSystem';
```

### Comments

- Write self-documenting code
- Add JSDoc comments for public APIs
- Explain "why" not "what"
- Keep comments up to date

```typescript
/**
 * Spawns a bird at the specified position
 * @param birdData - The bird species data
 * @param position - World position for spawning
 * @returns The spawned bird instance or null if failed
 */
public spawnBird(birdData: BirdData, position: Vector2): BirdInstance | null {
  // Implementation
}
```

## 📝 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
feat(quest): add daily quest system
fix(bird-spawn): correct spawn weight calculation
docs(readme): update installation instructions
refactor(map): simplify collision detection logic
test(pokedex): add unit tests for search function
```

### Scope

The scope should be the name of the affected module:

- `core` - Game engine core
- `quest` - Quest system
- `achievement` - Achievement system
- `pokedex` - Pokedex system
- `map` - Map system
- `bird` - Bird-related features
- `ui` - User interface
- `data` - Data models

## 🔍 Pull Request Process

### Before Submitting

1. ✅ Code follows the style guidelines
2. ✅ All tests pass
3. ✅ New tests added for new features
4. ✅ Documentation updated
5. ✅ No console errors or warnings
6. ✅ Commit messages follow guidelines

### PR Title

Use the same format as commit messages:

```
feat(quest): add daily quest system
```

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. At least one maintainer must approve
2. All CI checks must pass
3. No unresolved conversations
4. Branch must be up to date with main

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test src/systems/QuestSystem.test.ts

# Generate coverage report
npm run test:coverage
```

### Writing Tests

- Write tests for all new features
- Aim for >80% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('QuestSystem', () => {
  it('should complete quest when all objectives are met', () => {
    // Arrange
    const quest = new Quest(mockQuestData);
    
    // Act
    quest.updateObjective('obj1', 10);
    quest.updateObjective('obj2', 5);
    
    // Assert
    expect(quest.isCompleted()).toBe(true);
  });
});
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for all public APIs
- Include parameter descriptions
- Provide usage examples
- Document return values

### README Updates

Update README.md when:
- Adding new features
- Changing installation steps
- Modifying configuration
- Adding new dependencies

### Changelog

Significant changes should be documented in CHANGELOG.md:

```markdown
## [1.2.0] - 2024-01-15

### Added
- Daily quest system
- Bird call recognition mini-game

### Fixed
- Bird spawn weight calculation
- Map collision detection edge cases

### Changed
- Improved quest UI layout
```

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Try the latest version
3. Reproduce the bug
4. Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Any other relevant information
```

## 🎯 Areas for Contribution

### High Priority

- [ ] Bird behavior AI improvements
- [ ] Weather system implementation
- [ ] Time of day system
- [ ] UI/UX enhancements
- [ ] Performance optimizations

### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers!

### Documentation

- Improve code comments
- Add more examples
- Translate documentation
- Create video tutorials

## 📞 Getting Help

- 💬 [GitHub Discussions](https://github.com/yourusername/bird-watch/discussions)
- 🐛 [Issue Tracker](https://github.com/yourusername/bird-watch/issues)
- 📧 Email: your-email@example.com

## 🙏 Thank You!

Thank you for contributing to Bird Watch! Your efforts help make this project better for everyone.

---

Happy Coding! 🐦✨