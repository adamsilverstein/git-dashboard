# Git Dashboard

A lightweight, keyboard-driven GitHub PR dashboard built with React and TypeScript. Browse pull requests across multiple repositories with real-time CI status, review state tracking, and vim-style keyboard navigation — all from your browser.

## Features

- **Multi-repo PR view** — Monitor pull requests across all your repositories in one place
- **CI status at a glance** — Color-coded badges show success, failure, pending, and mixed check states
- **Review tracking** — See approvals, change requests, and comment counts per PR
- **Keyboard-first navigation** — Vim-style `j`/`k` keys, filters, and actions without touching the mouse
- **Filter & sort** — Quickly filter by "mine only," failing CI, or needs review; sort by updated, created, repo, or status
- **Local configuration** — Token and repo settings persist in `localStorage` — no backend required

## Screenshot

![Git Dashboard — Token Setup](https://github.com/user-attachments/assets/a3b5174c-abee-4be4-9748-8ad60d1a0ae6)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later (see `.nvmrc`)
- A GitHub Personal Access Token (see [Creating a GitHub PAT](#creating-a-github-pat) below)

### Installation

```bash
git clone https://github.com/adamsilverstein/git-dashboard.git
cd git-dashboard
npm install
npm run dev
```

The dev server starts at **http://localhost:5173**. On first visit you'll be prompted to enter your GitHub token.

### Production Build

```bash
npm run build    # Type-checks and builds to dist/
npm run preview  # Preview the production build locally
```

## Creating a GitHub PAT

The dashboard uses a **Personal Access Token** to read pull request data from the GitHub API.

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token** (classic)
3. Give the token a descriptive name (e.g. "Git Dashboard")
4. Select the **`repo`** scope — this grants read access to pull requests, commits, and check statuses for both public and private repositories
5. Click **Generate token** and copy the value
6. Paste the token into the dashboard's setup screen and click **Save & Continue**

> **Tip:** You can also use a [fine-grained token](https://github.com/settings/tokens?type=beta) scoped to specific repositories with **Pull requests** (read) and **Checks** (read) permissions.

## Keyboard Shortcuts

Press **`?`** at any time to open the in-app help modal.

| Key | Action |
|-----|--------|
| `j` / `↓` | Move cursor down |
| `k` / `↑` | Move cursor up |
| `Enter` | Open selected PR in browser |
| `r` | Refresh data |
| `m` | Toggle "mine only" filter |
| `f` | Cycle filter (all → failing → needs-review) |
| `s` | Cycle sort (updated → created → repo → status) |
| `c` | Open repo configuration |
| `?` | Toggle help modal |
| `Esc` | Close open modal |

Shortcuts are automatically disabled while typing in input fields.

## Configuration

All settings are stored in the browser's `localStorage` — nothing is sent to a server.

| Key | Description |
|-----|-------------|
| `gh-dashboard-token` | Your GitHub Personal Access Token |
| `gh-dashboard-config` | JSON object containing repos and display preferences |

The config object has the following shape:

```json
{
  "repos": [
    { "owner": "facebook", "name": "react", "enabled": true }
  ],
  "defaults": {
    "sort": "updated",
    "filter": "all",
    "maxPrsPerRepo": 30
  }
}
```

To reset the dashboard, clear these keys from `localStorage` in your browser's developer tools or sign out via the header button.

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b my-feature`)
3. Make your changes
4. Run the build to catch type errors (`npm run build`)
5. Commit your changes (`git commit -m 'Add my feature'`)
6. Push to your branch (`git push origin my-feature`)
7. Open a Pull Request

### Tech Stack

- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Dev server and bundler
- **@octokit/rest** — GitHub API client

## License

This project is open source. See the repository for license details.
