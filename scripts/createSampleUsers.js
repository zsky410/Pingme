// Script to create sample users in Firebase
// Run this in Firebase Console or use Firebase Admin SDK

const sampleUsers = [
  {
    id: "ZiaDoNZXeQfl2qHdyiveFYMCfw03",
    fullName: "Test User 1",
    email: "test1@example.com",
    username: "testuser1",
    status: "Online"
  },
  {
    id: "1bdzb0EZ8HMO1Y6GWwsNDU7Pfal2",
    fullName: "Test User 2",
    email: "test2@example.com",
    username: "testuser2",
    status: "Online"
  },
  {
    id: "ozl1vXwbNkQfJfJ0mlrKc33k1MJ2",
    fullName: "Test User 3",
    email: "test3@example.com",
    username: "testuser3",
    status: "Online"
  }
];

// Instructions:
// 1. Go to Firebase Console
// 2. Go to Firestore Database
// 3. Go to 'users' collection
// 4. Create documents with the IDs and data above
// 5. Or use Firebase Admin SDK to run this script

console.log("Sample users to create:");
sampleUsers.forEach(user => {
  console.log(`ID: ${user.id}`);
  console.log(`Name: ${user.fullName}`);
  console.log(`Email: ${user.email}`);
  console.log("---");
});
