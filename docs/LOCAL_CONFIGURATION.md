# Local configuration

- Replaced a tracked environment file with a local configuration example.
- Replaced embedded database/authentication credentials with local configuration placeholders.

Copy environment examples to their matching local filenames and provide your own values. Supply Firebase service-account credentials outside source control or through the deployment environment expected by the backend. Do not put real service keys into browser/mobile bundles. Removing a file from the current branch does not revoke its credential or erase Git history. No history was rewritten by this cleanup.
