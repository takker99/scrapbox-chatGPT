/** create UUID for chatGPT */
export const uuid = (): string => {
  const chars = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];
  const selected: string[] = [];
  for (let n = 0; n < 36; n++) {
    selected[n] = n === 8 || n === 13 || n === 18 || n === 23
      ? "-"
      : chars[Math.ceil(Math.random() * chars.length - 1)];
  }
  return selected.join("");
};
