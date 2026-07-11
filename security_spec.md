# Security Spec

## Data Invariants
1. A User document can only be created by the user themselves or an admin.
2. A User's `role` and `active` status can only be modified by an Admin.
3. A Ride can be created by a Passenger.
4. A Driver can update a Ride to `accepted`, `in_progress`, `completed`.
5. Messages can only be sent by the passenger or driver involved in the ride.

## The "Dirty Dozen" Payloads
1. User creates profile with `role: "admin"`.
2. Driver creates profile with `active: true`.
3. User updates another user's profile.
4. Non-admin modifies `active` status.
5. Unauthenticated user creates a ride.
6. Passenger accepts their own ride.
7. Passenger changes the `driverId` of a ride.
8. Driver accepts a ride that is already accepted by someone else.
9. Message sent by someone not in the ride.
10. Unauthenticated read of PII data (users collection).
11. Unauthenticated creation of message.
12. Driver modifies the `price` of a ride.
