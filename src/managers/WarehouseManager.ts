export interface OrderItem {
    id: string;
    itemType: string;
    quantity: number;
    picked: number;
    slotId: string;
}

export interface Order {
    id: string;
    items: OrderItem[];
    status: 'PENDING' | 'PICKING' | 'PACKING' | 'SHIPPED';
}

export class WarehouseManager {
    private currentOrder: Order | null = null;
    private inventory: string[] = [];
    private readonly maxInventory = 3;

    constructor() {
        this.generateNewOrder();
    }

    private generateNewOrder() {
        this.currentOrder = {
            id: `ORD-${Math.floor(Math.random() * 1000)}`,
            items: [
                { id: '1', itemType: 'Red Box', quantity: 1, picked: 0, slotId: 'A-01-1' },
                { id: '2', itemType: 'Blue Box', quantity: 1, picked: 0, slotId: 'B-01-3' }
            ],
            status: 'PENDING'
        };
    }

    getCurrentOrder(): Order | null {
        return this.currentOrder;
    }

    getInventory(): string[] {
        return this.inventory;
    }

    canPickItem(): boolean {
        return this.inventory.length < this.maxInventory;
    }

    pickItem(slotId: string): boolean {
        if (!this.currentOrder || !this.canPickItem()) return false;

        const itemToPick = this.currentOrder.items.find(item => item.slotId === slotId && item.picked < item.quantity);

        if (itemToPick) {
            itemToPick.picked++;
            this.inventory.push(itemToPick.itemType);

            // Check if all items in order are picked
            const allPicked = this.currentOrder.items.every(item => item.picked === item.quantity);
            if (allPicked) {
                this.currentOrder.status = 'PACKING';
            }
            return true;
        }
        return false;
    }

    clearInventory() {
        this.inventory = [];
    }

    completeOrder(): boolean {
        if (this.currentOrder && this.currentOrder.status === 'PACKING') {
            this.currentOrder.status = 'SHIPPED';
            this.clearInventory();
            return true;
        }
        return false;
    }
}
