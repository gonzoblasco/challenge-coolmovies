import { extractErrorMessage } from "./errorHandling";

describe("extractErrorMessage", () => {
  it("returns message from Error object", () => {
    const error = new Error("Test error");
    expect(extractErrorMessage(error)).toBe("Test error");
  });

  it("returns message from RTK Query error object (data.message)", () => {
    const error = { data: { message: "RTK Error" } };
    expect(extractErrorMessage(error)).toBe("RTK Error");
  });

  it("returns message from object with message property", () => {
    const error = { message: "Object error" };
    expect(extractErrorMessage(error)).toBe("Object error");
  });

  it("returns 'Unknown error' for null", () => {
    expect(extractErrorMessage(null)).toBe("Unknown error");
  });

  it("returns 'Unknown error' for empty object", () => {
    expect(extractErrorMessage({})).toBe("Unknown error");
  });

  it("returns 'Unknown error' for primitive values", () => {
    expect(extractErrorMessage(123)).toBe("Unknown error");
    expect(extractErrorMessage("string error")).toBe("Unknown error");
  });
});
