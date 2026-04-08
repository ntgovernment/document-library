---
description: "Deploy current changes to the dev branch: stage all files, commit with a generated summary of this session's changes, then push to origin/dev."
name: "Deploy to dev"
agent: "agent"
tools: [run_in_terminal, get_changed_files]
---

Deploy the current working changes to the `dev` branch by following these steps in order:

## Steps

### 1. Stage all changes
```
#runInTerminal:git add .
```

### 2. Generate a commit message
Review what has changed in this chat session and produce a concise conventional-style commit message that summarises the work done. Format:

```
<type>(<scope>): <short summary>

- <bullet describing change 1>
- <bullet describing change 2>
- …
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`.

### 3. Commit with the generated message
Run the commit using the message generated in step 2:
```
#runInTerminal:git commit -m "<generated message>"
```

### 4. Push to origin/dev
```
#runInTerminal:git push origin dev
```

After pushing, confirm the push was successful and display a brief summary of what was deployed.
