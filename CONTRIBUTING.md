# CONTRIBUTING

## Step 1: Find or Create an Issue

- Browse the project's Issues tab to find tasks or bugs to work on.
- If you have a new feature or bug fix in mind and it's not listed as an issue, create a new issue.
- Provide a clear, descriptive title.
- Write a detailed comment explaining the feature or bug.
- Label the issue appropriately (e.g., bug, enhancement, good first issue, frontend, backend).

## Step 2: Move Issue to "Doing" Column in Project

- Navigate to the project's [Projects tab](https://github.com/users/seangray-dev/projects/3).
- Move your selected or newly created issue to the "Doing" column to indicate that you are working on it.

## Step 4: Create a New Branch for Your Work

- Clone the repository to your local machine.

```bash
git clone https://github.com/seangray-dev/curate-health.git
cd curate-health
```

- Create a new branch from the main branch. Name it appropriately based on the feature or fix you're working on (e.g., `feature-add-login`, `fix-header-layout`).

```bash
git checkout -b [your-branch-name]
```

## Step 5: Implement Your Feature or Bug Fix

- Write code for the feature or bug fix in your branch.
- Regularly commit your changes with clear, descriptive commit messages.

```bash
git commit -m "Add a detailed commit message"
```

## Step 6: Push Changes and Open a Pull Request

- Push your branch to the GitHub repository.

```bash
git push origin [your-branch-name]
```

- Go to the repository on GitHub. You'll typically see a prompt to open a pull request; if not, navigate to the "Pull requests" tab and click "New pull request".
- Compare your branch with the base branch (usually main).
- Create the pull request. Include a detailed description of your changes and link to the issue you're addressing (use # followed by the issue number).
- Request a review from a team member if required.

## Step 7: Code Review and Adjustments

- Once the pull request is open, other team members can review your code.
- Respond to comments, making any necessary changes.
- Push updates to the same branch; they will automatically be added to the pull request.

## Step 8: Merge the Pull Request

- After approval and passing any continuous integration checks, the pull request can be merged into the base branch.
- It’s usually a good practice to let the person who opened the pull request merge it, but this can vary based on the project's conventions.

## Step 9: Close the Issue and Update the Project Board

- Once the feature or fix is merged, close the associated GitHub issue.
- Move the issue to the "Done" column in the project board.

## Additional Notes

- Always keep your local and remote branches up to date with the base branch.
- Communicate effectively with your team, especially if you encounter problems or need to make significant changes to the project.
- This procedure helps maintain a structured workflow and clear communication within the team, ensuring that contributions are efficiently managed and integrated into the project.
