/** create UUID for chatGPT */
export const uuid = (): string => {
  const chars = "abcdef0123456789";
  const selected: string[] = [];
  for (let n = 0; n < 36; n++) {
    selected[n] = n === 8 || n === 13 || n === 18 || n === 23
      ? "-"
      : chars[Math.ceil(Math.random() * chars.length - 1)];
  }
  return selected.join("");
};
