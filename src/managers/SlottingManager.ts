export interface Slot {
    id: string; // e.g., "A-01-1"
    x: number;  // Tile X
    y: number;  // Tile Y
    zone: string;
    occupied: boolean;
    itemType?: string;
    quantity: number;
}

export class SlottingManager {
    private slots: Map<string, Slot> = new Map();
    private readonly itemTypes = ['Red Box', 'Blue Box', 'Green Box', 'Yellow Box'];
    private stockSnapshot: Map<string, { itemType?: string, quantity: number }> = new Map();

    constructor() {
        this.initializeMockSlots();
    }

    private initializeMockSlots() {
        // Zone A: Racks at (5, 5) to (5, 10)
        for (let i = 0; i < 6; i++) {
            const id = `A-01-${i + 1}`;
            const hasStock = Math.random() > 0.5;
            this.slots.set(id, {
                id,
                x: 5,
                y: 5 + i,
                zone: 'A',
                occupied: false,
                itemType: hasStock ? this.itemTypes[Math.floor(Math.random() * this.itemTypes.length)] : undefined,
                quantity: hasStock ? Math.floor(Math.random() * 10) + 1 : 0
            });
        }

        // Zone B: Racks at (10, 5) to (10, 10)
        for (let i = 0; i < 6; i++) {
            const id = `B-01-${i + 1}`;
            const hasStock = Math.random() > 0.5;
            this.slots.set(id, {
                id,
                x: 10,
                y: 5 + i,
                zone: 'B',
                occupied: false,
                itemType: hasStock ? this.itemTypes[Math.floor(Math.random() * this.itemTypes.length)] : undefined,
                quantity: hasStock ? Math.floor(Math.random() * 10) + 1 : 0
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

    reserveSlot(id: string): boolean {
        const slot = this.slots.get(id);
        if (slot && !slot.occupied) {
            slot.occupied = true;
            return true;
        }
        return false;
    }

    clearSlot(id: string) {
        const slot = this.slots.get(id);
        if (slot) {
            slot.occupied = false;
        }
    }

    addStock(id: string, itemType: string, quantity: number): boolean {
        const slot = this.slots.get(id);
        if (!slot) return false;

        if (slot.quantity === 0) {
            slot.itemType = itemType;
        } else if (slot.itemType !== itemType) {
            return false; // Can't mix items in one slot for now
        }

        slot.quantity += quantity;
        return true;
    }

    removeStock(id: string, quantity: number): boolean {
        const slot = this.slots.get(id);
        if (!slot || slot.quantity < quantity) return false;

        slot.quantity -= quantity;
        if (slot.quantity === 0) {
            slot.itemType = undefined;
        }
        return true;
    }

    snapshotStock() {
        this.stockSnapshot.clear();
        this.slots.forEach((slot, id) => {
            this.stockSnapshot.set(id, {
                itemType: slot.itemType,
                quantity: slot.quantity
            });
        });
    }

    restoreStock() {
        this.stockSnapshot.forEach((snapshot, id) => {
            const slot = this.slots.get(id);
            if (slot) {
                slot.itemType = snapshot.itemType;
                slot.quantity = snapshot.quantity;
            }
        });
    }
}
