export const sortByPosition = <T extends { position?: number }>(arr: T[]): T[] => {
  return arr.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
}
