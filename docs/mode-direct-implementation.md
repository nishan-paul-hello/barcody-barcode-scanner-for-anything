---
description: Direct Implementation Mode - Execute tasks immediately without documentation or discussion, followed by a concise summary.
---

1. **Context Gathering**: Read the primary context files before starting:
    - `/home/nishan/Documents/barcody-barcode-scanner-for-anything/docs/architecture-plan.md`
    - `/home/nishan/Documents/barcody-barcode-scanner-for-anything/docs/task-list.md`
2. **Analyze the Request**: Briefly assess the technical requirements of the task.
3. **Execute immediately**: Implement the requested changes directly in the codebase.
    - Do NOT create any documentation (plans, walkthroughs, etc.).
    - Do NOT engage in discussion or ask for confirmation unless absolutely critical (e.g., destructive actions without clear intent).
    - Do NOT explain the code while writing it.
    - **Technical Requirements**:
        - Use path aliases instead of relative paths.
        - Use Docker Compose v2 syntax instead of v1.
4. **Verify**: Validate the changes thoroughly:
    - **Automated Verification**: Run relevant tests to ensure technical correctness.
    - **User Perspective Verification**: Run the application and simulate a regular user's workflow. Manually test the new functionality to ensure it behaves as expected in a real usage scenario, not just in code.
5. **Summary & User Verification**: After completion, provide:
    - **Changes**: Concise bullet points of exactly what was implemented.
    - **Verification**: Simple, single-line instructions for the user to test:
        - **Run**: The exact command to launch the app/service.
        - **Do**: The specific action to perform as a regular user.
        - **Expect**: The expected visible outcome to confirm success.
