# Contributing to Drawora

Thank you for your interest in Drawora! This project is open source under the [MIT License](LICENSE). Bug reports, feature ideas, and pull requests are welcome.

## Reporting issues

Please use [GitHub Issues](../../issues) instead of email or social messages so we can track and fix problems properly.

Before opening a new issue:

1. Search [existing issues](../../issues) to avoid duplicates.
2. Use the correct template (**Bug report** or **Feature request**).
3. Include steps to reproduce, expected vs actual behavior, and your browser/OS.
4. For UI bugs, attach a screenshot or short screen recording if possible.

### Bug reports

Include:

- What you were trying to do
- What happened instead
- Browser and version (e.g. Chrome 128, Firefox 129, Edge 128)
- Operating system (Windows, macOS, Linux, Android, iOS)
- Whether you were online, offline, or in a collaboration room

### Feature requests

Explain:

- The problem you want solved
- Your proposed solution (if any)
- Who would benefit (teachers, students, presenters, etc.)

## Suggesting improvements

Small ideas and polish suggestions are fine as feature requests. Larger changes (new tools, new file formats, auth systems) should describe the use case clearly so maintainers can decide scope.

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Keep changes focused — one fix or feature per PR when possible.
3. Match existing code style (vanilla JS, no build step unless discussed).
4. Test in a modern browser: drawing, undo/redo, pages, export, and any area you changed.
5. Update `README.md` only if user-facing behavior changes.

### Local development

```bash
git clone <your-fork-url>
cd Drawora
npx serve .
```

Open the URL shown in the terminal (usually `http://localhost:3000`).

Optional Cloudflare Pages local preview:

```bash
npm run pages:dev
```

### What we are looking for

- Bug fixes with clear reproduction steps
- Accessibility improvements
- Performance improvements on large boards
- Documentation and translation improvements
- Tests or verification scripts (if they stay lightweight)

### What needs discussion first

- New major features not listed in [ROADMAP.md](ROADMAP.md)
- Adding npm dependencies or a build toolchain
- Breaking changes to the `.drawora` project format

## Code of conduct

Be respectful and constructive. Drawora is built for educators, students, and creators — keep discussions welcoming and professional.

## Questions

If you are unsure whether something should be an issue or a PR, open a **Feature request** or **Bug report** and ask there. That helps everyone learn from the answer.
