const WORDS = [
  'BUS', 'RED', 'OAK', 'ELM', 'MAP', 'FOX', 'HUB', 'AID',
  'RIG', 'TAG', 'MED', 'VAN', 'COT', 'NET', 'RUN', 'CAP',
  'SET', 'BAY', 'ARC', 'DOC',
] as const;

export function generateJoinCode(): string {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const num = Math.floor(100 + Math.random() * 900); // 100-999
  return `${word}-${num}`;
}
