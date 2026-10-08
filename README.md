# Bug Bash: Deploy on Friday

A tiny, nerdy browser game by [Coded Female](https://codedfemale.com). Squash bugs, collect coffee and leave the rubber ducks alone. Built with plain HTML, CSS and JavaScript, with no dependencies or build step.

## Play locally

Download the files into one folder and open `index.html` in your browser.

## How to play

- Click or tap a target, or press its square number (1 to 9, left to right, top to bottom).
- Bugs give 10 points. Every five consecutive fixes increases your multiplier, up to ×3. Missing a bug costs a life and resets your streak.
- Coffee adds three seconds, capped at 45 seconds remaining.
- Clicking a duck costs 15 points and one life, and resets your streak. Scores cannot go below zero.
- Survive 30 seconds with five lives. Targets get quicker as the run continues.
- Press P to pause or resume. Enter starts or resumes a run. Switching away pauses automatically.
- Choose Practice mode before starting for slower targets, unlimited time and unlimited lives. Coffee gives five points in practice. Click End run when finished.

Best scores are saved on this browser when local storage is available. Practice scores do not count towards the best score. No scores or personal data are sent anywhere.

## Put it on GitHub

1. Create a public repository named `bug-bash`.
2. Choose **Add file → Upload files**. Upload the contents of this folder directly into the repository, including `index.html`, `style.css`, `script.js`, `README.md` and `LICENSE`. Commit the files.
3. Open **Settings → Pages**. Under **Source**, choose **Deploy from a branch**.
4. Choose **main** and **/(root)**, then click **Save**.
5. When deployment finishes, open the link shown in Pages settings.

GitHub’s [official Pages instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) cover publishing from a branch.

## Remix it

| File | What to change |
| --- | --- |
| `index.html` | Headings, instructions and developer jokes |
| `style.css` | Colours, spacing and the terminal grid |
| `script.js` | Round length, lives, target chances and scoring |

Start with `ROUND_SECONDS` or `STARTING_LIVES` at the top of `script.js`. Try swapping the bugs for aliens, or adding a rare golden bug. Keep instructions in step with your rule changes.

The controls support mouse, touch and keyboard. Squares have accessible labels, feedback uses a live region, and animations respect reduced motion preferences. The timed arcade mode remains visually demanding; practice offers a slower alternative.

## Licence

MIT. See `LICENSE`. Contributions and remixes welcome.
