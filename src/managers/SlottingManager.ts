export interface Slot {
    id: string; // e.g., "A-01-1"
    x: number;  // Tile X
    y: number;  // Tile Y
    zone: string;
    occupied: boolean;
    item?: string;
}

export class SlottingManager {
    private slots: Map<string, Slot> = new Map();

    constructor() {
        this.initializeMockSlots();
    }

    private initializeMockSlots() {
        // Zone A: Racks at (5, 5) to (5, 10)
        for (let i = 0; i < 6; i++) {
            const id = `A-01-${i + 1}`;
            this.slots.set(id, {
                id,
                x: 5,
                y: 5 + i,
                zone: 'A',
                occupied: false
            });
        }

        // Zone B: Racks at (10, 5) to (10, 10)
        for (let i = 0; i < 6; i++) {
            const id = `B-01-${i + 1}`;
            this.slots.set(id, {
                id,
                x: 10,
                y: 5 + i,
                zone: 'B',
                occupied: false
            });
        }
    }

    getSlotAt(x: number, y: number): Slot | undefined {
        for (const slot of this.slots.values()) {
            if (slot.x === x && slot.y === y) {
                return slot;
            }
        }
        return undefined;
    }

    getSlotById(id: string): Slot | undefined {
        return this.slots.get(id);
    }

    getAllSlots(): Slot[] {
        return Array.from(this.slots.values());
    }
}
