import dotenv from "dotenv";

dotenv.config({
  path: "./.env.test",
});

// Set default test MongoDB URI if not specified
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI =
    "mongodb://admin:admin123@localhost:27017/timetable_test?authSource=admin";
}

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
};

// Allow specific logs for debugging test failures
const originalLog = console.log;
global.testLog = originalLog;
