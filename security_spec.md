# Security Specification

## 1. Data Invariants
1. A Project document can only exist within the user's isolated subcollection `/users/{userId}/projects/{projectId}` where `userId == request.auth.uid`.
2. The project's internal `userId` must strictly match `request.auth.uid`.
3. The project `id` must be a valid alphanumeric/dash/underscore string up to 128 characters matching the document path variable `{projectId}`.
4. The title must be a non-empty string up to 120 characters.
5. The `objects` field must be a list containing up to 500 items, representing architectural elements.
6. The `objectCount` must be an integer/number matching or representing the item count.
7. Unauthenticated users cannot read, create, update, or delete any project documents.
8. Authenticated users cannot read, modify, or delete another user's projects.
9. `createdAt` must be immutable and cannot be altered on update.
10. `userId` and `id` are immutable once written.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated Read**: Attempting to read `/users/user123/projects/proj1` without authentication.
2. **Cross-User Snooping**: Authenticated user `user_attacker` attempting to read `/users/user_victim/projects/proj1`.
3. **Cross-User Write**: Authenticated user `user_attacker` attempting to create `/users/user_victim/projects/proj1`.
4. **Mismatched Path UID**: Authenticated user `user_1` writes to `/users/user_1/projects/proj1` with payload `userId: "user_2"`.
5. **Mismatched Doc ID**: Payload contains `id: "proj2"` when writing to `/users/user_1/projects/proj1`.
6. **Path Traversal / Malicious ID**: Writing to an invalid path ID with special characters like `/users/user_1/projects/../../bad`.
7. **Giant Title Overflow**: Payload with `title` exceeding 120 characters to cause buffer/wallet exhaustion.
8. **Negative / Non-Number Count**: Payload with `objectCount: "fifty"` (invalid type).
9. **Unbounded Object Flooding**: Payload with `objects` array exceeding 500 items.
10. **Tampered Creation Date**: Updating an existing document with a changed `createdAt` timestamp.
11. **Owner Hijack on Update**: Attempting to update `userId` to transfer ownership to another account.
12. **Missing Required Fields**: Creating a project omitting required fields like `title` or `objects`.
