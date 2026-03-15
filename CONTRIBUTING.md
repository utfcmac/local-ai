# Contributing to Local AI

First off, thank you for considering contributing to Local AI! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include as many details as possible using the bug report template.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Use the feature request template and provide the following information:

- A clear description of the enhancement
- Explain why this would be useful
- Provide examples of how it would work

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the code style
3. **Test your changes** locally
4. **Update documentation** if needed
5. **Update CHANGELOG.md** under `[Unreleased]`
6. **Commit using Conventional Commits**
7. **Push to your fork** and submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/local-ai.git
cd local-ai

# Install dependencies
npm install

# Start Ollama (required)
ollama serve

# Pull the model
ollama pull qwen2.5:7b

# Set up environment
echo 'LOCAL_AI_API_KEY=test-key-for-development' > .env.local

# Start development server
npm run dev
```

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Build process, dependencies

**Examples:**
```bash
feat(api): add language parameter to generate endpoint
fix(dashboard): correct memory calculation
docs(readme): update installation instructions
```

## Code Style

- Use TypeScript for type safety
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Testing

Before submitting a PR:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Test the standalone build:**
   ```bash
   npm run start:standalone
   ```

3. **Test API endpoints:**
   ```bash
   curl -X POST http://localhost:3100/api/generate \
     -H "x-api-key: test-key" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test","content":"Test content","blogUrl":"https://example.com"}'
   ```

4. **Check dashboard:** Visit `http://localhost:3100`

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # i18n pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities (ollama, db, auth)
└── messages/              # i18n translations
```

## Release Process

Maintainers will handle releases:

1. Update CHANGELOG.md
2. Create tag: `git tag -a v1.2.0 -m "Release v1.2.0"`
3. Push: `git push origin main --tags`
4. GitHub Actions automatically creates the release

## Questions?

Feel free to open an issue with the label `question`.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
