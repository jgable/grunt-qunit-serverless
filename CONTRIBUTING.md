This project uses the following completely arbitrary but important none-the-less style guide:

- 4 space hard tab for code
- `var` statements near the top of the function scope; can be after early exit logic.
- Single var per multiple assignment.
- Commas at the end of assignments
- New line between variable assignments; not everything on one line.
- Semicolons please

Unit tests for new code are preferred.  See the existing tests for form and style.

Make sure the grunt default task passes before submitting PR; otherwise the travis build will fail.

Keep logic out of the registerWithGrunt function and move it into the Task class.

Pull requests should be made from a separate feature branch, not master, if possible.

Multiple commits are allowed, but a single compressed commit is better.

Thanks for the help!