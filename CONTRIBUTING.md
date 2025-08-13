# Contributing to Claude Code JSONL Editor

Thank you for your interest in contributing to Claude Code JSONL Editor! We welcome contributions from the community and are excited to see how you can help make prompt engineering more efficient for everyone.

## 🎯 Project Philosophy

Before contributing, please understand our core philosophy:

**Efficient Prompt Engineering Through Conversation Editing** - Our tool enables infinite iteration and refinement of AI interactions by allowing direct editing of conversation outputs while preserving context. Every contribution should align with this mission of making prompt engineering more efficient and accessible.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Contributor License Agreement (CLA)](#contributor-license-agreement-cla)
- [Community and Support](#community-and-support)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** 2.20.0 or higher
- Basic understanding of TypeScript/JavaScript
- Familiarity with React/Preact (for UI contributions)
- Understanding of Express.js (for server contributions)

### First Contribution?

1. 🔍 **Explore the codebase**: Read the [README.md](README.md) and try the tool yourself
2. 🐛 **Find a good first issue**: Look for issues labeled `good first issue` or `help wanted`
3. 💬 **Join discussions**: Participate in [GitHub Discussions](https://github.com/yuis-ice/claude-code-jsonl-editor/discussions)
4. 📚 **Understand prompt engineering**: Familiarize yourself with conversation editing workflows

## 💻 Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/claude-code-jsonl-editor.git
cd claude-code-jsonl-editor

# Add the original repository as upstream
git remote add upstream https://github.com/yuis-ice/claude-code-jsonl-editor.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Workflow

```bash
# Start development server (runs both client and server)
npm run dev

# Run only the server
npm run server

# Run only the client
npm run client

# Build for production
npm run build
```

### 4. Test Your Setup

```bash
# Test with sample files
npm start

# Test with custom file
npm start -- -p ./your-test-file.jsonl

# Test network mode
npm start -- --expose
```

## 🤝 How to Contribute

### 🐛 Bug Reports

Found a bug? Please [create a bug report](https://github.com/yuis-ice/claude-code-jsonl-editor/issues/new?template=bug_report.yml) with:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- System information
- Error logs if applicable

### 💡 Feature Requests

Have an idea? [Submit a feature request](https://github.com/yuis-ice/claude-code-jsonl-editor/issues/new?template=feature_request.yml) with:

- Problem statement
- Proposed solution
- Use cases and examples
- Implementation ideas (if any)

### 📝 Code Contributions

1. **Pick an Issue**: Choose an existing issue or create one to discuss your idea
2. **Branch**: Create a feature branch from `main`
3. **Develop**: Make your changes following our coding standards
4. **Test**: Ensure all tests pass and add new tests if needed
5. **Document**: Update documentation for any new features
6. **Submit**: Open a pull request with a clear description

### 📚 Documentation

Documentation improvements are always welcome:

- Fix typos or unclear instructions
- Add examples and use cases
- Improve API documentation
- Create tutorials or guides
- Translate documentation

## 🔄 Pull Request Process

### Before Submitting

- [ ] Create an issue to discuss major changes
- [ ] Fork the repository and create a feature branch
- [ ] Follow coding standards and conventions
- [ ] Add or update tests for your changes
- [ ] Update documentation if needed
- [ ] Test across different environments if applicable

### PR Requirements

1. **Title**: Use a descriptive title with appropriate prefix:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
   - `test:` for test updates
   - `chore:` for maintenance tasks

2. **Description**: Use our [PR template](.github/PULL_REQUEST_TEMPLATE.md)

3. **Testing**: Ensure all tests pass and add new tests for new functionality

4. **Reviews**: All PRs require at least one review from a maintainer

5. **CI/CD**: All automated checks must pass

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and quality checks
2. **Code Review**: Maintainers review code quality, architecture, and functionality
3. **Testing**: Manual testing of new features and bug fixes
4. **Documentation**: Review of documentation updates
5. **Merge**: Approved PRs are merged by maintainers

## 🎨 Coding Standards

### General Principles

- **Clarity over cleverness**: Write code that's easy to understand
- **Consistency**: Follow existing patterns in the codebase
- **Performance**: Consider performance implications
- **Security**: Follow security best practices
- **Accessibility**: Ensure UI components are accessible

### TypeScript/JavaScript

```typescript
// Use TypeScript interfaces for type definitions
interface ConversationEntry {
  uuid: string;
  type: 'user' | 'assistant';
  message: ClaudeMessage;
  timestamp: string;
}

// Use descriptive function names
function parseJSONLContent(content: string): ParsedConversation {
  // Implementation
}

// Use const assertions for immutable data
const MESSAGE_TYPES = ['user', 'assistant', 'summary'] as const;
```

### File Structure

```
src/
├── components/          # Reusable UI components
├── utils/              # Utility functions
├── types.ts            # Type definitions
├── app.tsx             # Main application
└── main.tsx            # Entry point
```

### Naming Conventions

- **Files**: `kebab-case.tsx`, `camelCase.ts`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

## ✅ Testing Guidelines

### Test Structure

```typescript
// Unit tests for utilities
describe('jsonlParser', () => {
  test('should parse valid JSONL content', () => {
    const content = '{"type":"user","message":{"content":"test"}}\n';
    const result = parseJSONL(content);
    expect(result.messages).toHaveLength(1);
  });
});
```

### Testing Requirements

- **Unit Tests**: All utility functions must have unit tests
- **Integration Tests**: API endpoints and file operations
- **Component Tests**: UI components with user interactions
- **E2E Tests**: Critical user workflows

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📖 Documentation

### Code Documentation

```typescript
/**
 * Parses JSONL content into structured conversation data
 * @param content - Raw JSONL string content
 * @returns Parsed conversation with entries, summaries, and messages
 * @throws {Error} When JSONL format is invalid
 */
function parseJSONL(content: string): ParsedConversation {
  // Implementation
}
```

### README Updates

When adding features, update:
- Feature list
- Usage examples
- CLI options (if applicable)
- API documentation (if applicable)

## 🤝 Contributor License Agreement (CLA)

By submitting a pull request or contribution, you agree to the following:

> You grant the project founder a **non-exclusive, irrevocable, worldwide, royalty-free license** to use, modify, sublicense, and relicense your contribution, including the right to incorporate it into dual-licensed or commercial versions of the project.

This ensures that the project can grow sustainably while preserving creator rights.

If you are contributing on behalf of a company or organization, please contact us in advance.

### What This Means

- ✅ You retain ownership of your contributions
- ✅ The project can use your contributions freely
- ✅ Your contributions can be included in commercial versions
- ✅ You can still use your contributions in other projects
- ✅ The project can relicense if needed for sustainability

### Why We Require This

- **Project Sustainability**: Allows flexible licensing for long-term sustainability
- **Commercial Viability**: Enables potential commercial offerings to fund development
- **Legal Clarity**: Provides clear rights for all parties
- **Community Protection**: Ensures contributions can't be withdrawn

## 🌟 Community and Support

### Communication Channels

- **GitHub Discussions**: General questions, feature discussions, and community chat
- **Issues**: Bug reports and feature requests
- **Pull Requests**: Code contributions and reviews

### Getting Help

- 📖 Check the [README.md](README.md) for basic usage
- 💬 Ask in [GitHub Discussions](https://github.com/yuis-ice/claude-code-jsonl-editor/discussions)
- 🔍 Search existing issues and discussions
- 📧 Contact maintainers for security issues

### Contribution Recognition

We recognize contributions in multiple ways:

- **Contributors List**: All contributors are listed in our README
- **Release Notes**: Significant contributions are highlighted
- **Special Recognition**: Outstanding contributors may be invited as maintainers

## 🎉 Types of Contributions Welcome

### Code Contributions
- Bug fixes and improvements
- New features and enhancements
- Performance optimizations
- Security improvements
- Cross-platform compatibility

### Non-Code Contributions
- Documentation improvements
- Translation work
- UI/UX design
- Testing and QA
- Community management
- Tutorial creation
- Bug reports and feature requests

### Prompt Engineering Contributions
- Conversation templates
- Workflow examples
- Best practices documentation
- Use case studies
- Integration examples

## 🚀 Release Process

### Version Management

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Schedule

- **Patch releases**: As needed for critical bugs
- **Minor releases**: Monthly for new features
- **Major releases**: Quarterly or for significant changes

---

Thank you for contributing to Claude Code JSONL Editor! Together, we're making prompt engineering more efficient and accessible for everyone. 🚀

For questions about contributing, please reach out in [GitHub Discussions](https://github.com/yuis-ice/claude-code-jsonl-editor/discussions) or contact the maintainers directly.