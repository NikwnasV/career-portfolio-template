export type Direction = 'IN' | 'OUT';
export type Person = { barcode: string; fullname: string; room: string; profession: string };
export type Visit = Person & { id: number; direction: Direction; createdOn: number };

/** Browser-only model of the supplied Swing application's barcode and log workflow. */
export class CareVisitDemo {
  cards = new Map<string, Person>();
  logs: Visit[] = [];
  private nextId = 1;
  constructor(private clock: () => number = Date.now) { this.reset(); }
  reset() {
    this.cards.clear(); this.logs = []; this.nextId = 1;
    for (const person of [
      { barcode: 'CV-1001', fullname: 'Demo Collaborator', room: 'A-101', profession: 'Collaborator' },
      { barcode: 'CV-1002', fullname: 'Demo Doctor', room: '', profession: 'Doctor' },
    ]) this.cards.set(person.barcode, person);
  }
  scan(barcode: string): Visit | null {
    barcode = barcode.trim();
    const last = this.logs.find(log => log.barcode === barcode);
    if (last?.direction === 'IN') return this.save(last, 'OUT');
    const card = this.cards.get(barcode);
    return card ? this.save(card, 'IN') : null;
  }
  save(person: Person, direction: Direction): Visit {
    const clean = { ...person, barcode: person.barcode.trim(), fullname: person.fullname.trim(), room: person.room.trim() };
    if (!clean.barcode || !clean.fullname) throw new Error('Barcode and name are required.');
    if (direction !== 'IN' && direction !== 'OUT') throw new Error('Choose IN or OUT.');
    const visit = { ...clean, id: this.nextId++, direction, createdOn: this.clock() };
    this.logs.unshift(visit);
    return visit;
  }
  saveCard(person: Person) {
    const clean = { ...person, barcode: person.barcode.trim(), fullname: person.fullname.trim(), room: person.room.trim() };
    if (!clean.barcode || !clean.fullname) throw new Error('Barcode and name are required.');
    this.cards.set(clean.barcode, clean);
  }
  removeCard(barcode: string) { this.cards.delete(barcode); }
  get current(): Visit[] {
    const latest = new Map<string, Visit>();
    for (const log of this.logs) if (!latest.has(log.barcode)) latest.set(log.barcode, log);
    return [...latest.values()].filter(log => log.direction === 'IN');
  }
  canDelete(id: number) {
    const log = this.logs.find(log => log.id === id);
    return !!log && this.clock() - log.createdOn <= 5 * 60 * 1000;
  }
  removeLog(id: number) {
    if (!this.canDelete(id)) throw new Error('Only records created within the last five minutes can be deleted.');
    this.logs = this.logs.filter(log => log.id !== id);
  }
}

export function visitCsv(visits: Visit[]) {
  const cell = (value: unknown) => {
    let text = String(value ?? '');
    if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  const rows: unknown[][] = [['ID', 'Barcode', 'Direction', 'Date & time', 'Full name', 'Room', 'Role']];
  for (const visit of visits) rows.push([visit.id, visit.barcode, visit.direction, new Date(visit.createdOn).toISOString(), visit.fullname, visit.room, visit.profession]);
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n');
}
