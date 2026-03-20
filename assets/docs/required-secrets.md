# GitHub Secrets Configuration

To enable the automated CI/CD pipelines, the following secrets must be configured in your GitHub repository settings (**Settings > Secrets and variables > Actions**).

## Expo Secrets (Mobile)

Required for building and releasing the mobile application via EAS.

| Secret Name  | Description                                    |
| ------------ | ---------------------------------------------- |
| `EXPO_TOKEN` | Your Expo access token for EAS build services. |

---

## Workflow Integration

The workflows are configured to use these secrets automatically:

- **Backend Tests**: No secrets required.
- **Mobile Build**: Uses `EXPO_TOKEN`.

---

> **Note:** Docker image publishing (Docker Hub) has been removed. Registry publishing will be re-added via GHCR in a future update.