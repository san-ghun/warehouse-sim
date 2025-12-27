import { SlottingManager } from '../managers/SlottingManager';
import { WarehouseManager } from '../managers/WarehouseManager';

export class GameScene extends Phaser.Scene {
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private interactKey!: Phaser.Input.Keyboard.Key;
    private slottingManager: SlottingManager;
    private warehouseManager: WarehouseManager;
    private statusText!: Phaser.GameObjects.Text;
    private orderText!: Phaser.GameObjects.Text;
    private inventoryFollowers: Phaser.GameObjects.Arc[] = [];
    private dialogueContainer!: Phaser.GameObjects.Container;
    private dialogueText!: Phaser.GameObjects.Text;
    private sparkles!: Phaser.GameObjects.Group;
    private shippingZone!: Phaser.GameObjects.Rectangle;
    private readonly speed = 160;
    private readonly tileSize = 32;
    private readonly shippingZonePos = { x: 21, y: 0, width: 4, height: 4 };

    constructor() {
        super('GameScene');
        this.slottingManager = new SlottingManager();
        this.warehouseManager = new WarehouseManager();
    }

    preload() {
        // Create a simple placeholder for the player
        const graphics = this.add.graphics();
        graphics.fillStyle(0xff0000);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('player_placeholder', 32, 32);
        graphics.destroy();
    }

    create() {
        // Simple Grid Background
        const gridGraphics = this.add.graphics();
        gridGraphics.lineStyle(1, 0x34495e, 0.5);
        for (let x = 0; x < 800; x += this.tileSize) {
            gridGraphics.moveTo(x, 0);
            gridGraphics.lineTo(x, 600);
        }
        for (let y = 0; y < 600; y += this.tileSize) {
            gridGraphics.moveTo(0, y);
            gridGraphics.lineTo(800, y);
        }
        gridGraphics.strokePath();

        // Draw Shipping Zone (Top Right)
        this.shippingZone = this.add.rectangle(
            this.shippingZonePos.x * this.tileSize,
            this.shippingZonePos.y * this.tileSize,
            this.shippingZonePos.width * this.tileSize,
            this.shippingZonePos.height * this.tileSize,
            0x3498db, 0.4
        ).setOrigin(0);
        this.shippingZone.setStrokeStyle(2, 0x2980b9);
        this.add.text(this.shippingZone.x + 10, this.shippingZone.y + 10, "SHIPPING ZONE", { fontSize: '12px', color: '#fff' });

        // Draw Racks
        const rackGraphics = this.add.graphics();
        rackGraphics.fillStyle(0x7f8c8d);
        this.slottingManager.getAllSlots().forEach(slot => {
            rackGraphics.fillRect(slot.x * this.tileSize, slot.y * this.tileSize, this.tileSize, this.tileSize);
            this.add.text(slot.x * this.tileSize, slot.y * this.tileSize, slot.id, { fontSize: '8px', color: '#000' });
        });

        this.player = this.physics.add.sprite(400, 300, 'player_placeholder');
        this.player.setCollideWorldBounds(true);
        this.player.setOrigin(0, 0);

        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        }

        this.statusText = this.add.text(10, 10, 'Location: -', { color: '#ffffff', backgroundColor: '#000000' });
        this.orderText = this.add.text(600, 10, 'Pick List:\n- ', { color: '#00ff00', backgroundColor: '#000000', fontSize: '14px' });

        // Setup Dialogue UI
        this.createDialogueUI();

        // Setup Sparkles
        this.sparkles = this.add.group();

        this.updateOrderDisplay();
        this.showDialogue("Welcome to the Warehouse! \nFollow the Pick List on the right.");
    }

    private createDialogueUI() {
        const width = 600;
        const height = 100;
        const x = (800 - width) / 2;
        const y = 600 - height - 20;

        const bg = this.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0);
        bg.setStrokeStyle(4, 0x000000);

        this.dialogueText = this.add.text(20, 20, '', {
            color: '#000000',
            fontSize: '18px',
            wordWrap: { width: width - 40 }
        });

        this.dialogueContainer = this.add.container(x, y, [bg, this.dialogueText]);
        this.dialogueContainer.setVisible(false);
        this.dialogueContainer.setScrollFactor(0);
        this.dialogueContainer.setDepth(100);
    }

    private showDialogue(message: string) {
        this.dialogueText.setText(message);
        this.dialogueContainer.setVisible(true);

        // Auto-hide after 3 seconds
        this.time.delayedCall(3000, () => {
            this.dialogueContainer.setVisible(false);
        });
    }

    private updateOrderDisplay() {
        const order = this.warehouseManager.getCurrentOrder();
        if (order) {
            let text = `Order: ${order.id}\nStatus: ${order.status}\n\nTasks:\n`;

            // Update Sparkles
            this.sparkles.clear(true, true);

            order.items.forEach(item => {
                const isPicked = item.picked >= item.quantity;
                const check = isPicked ? 'X' : ' ';
                text += `[${check}] ${item.itemType} (${item.slotId})\n`;

                if (!isPicked) {
                    const slot = this.slottingManager.getSlotById(item.slotId);
                    if (slot) {
                        this.createSparkle(slot.x * this.tileSize + 16, slot.y * this.tileSize + 16);
                    }
                }
            });
            this.orderText.setText(text);
        }
    }

    private createSparkle(x: number, y: number) {
        const sparkle = this.add.star(x, y, 5, 4, 8, 0xffff00);
        this.sparkles.add(sparkle);

        this.tweens.add({
            targets: sparkle,
            alpha: 0,
            scale: 1.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    update() {
        if (!this.player || !this.cursors) return;

        this.player.setVelocity(0);

        if (this.cursors.left?.isDown) {
            this.player.setVelocityX(-this.speed);
        } else if (this.cursors.right?.isDown) {
            this.player.setVelocityX(this.speed);
        }

        if (this.cursors.up?.isDown) {
            this.player.setVelocityY(-this.speed);
        } else if (this.cursors.down?.isDown) {
            this.player.setVelocityY(this.speed);
        }

        // Normalize and scale the velocity so that diagonal movement isn't faster
        // Check for Slot at current position
        const tileX = Math.floor(this.player.x / this.tileSize);
        const tileY = Math.floor(this.player.y / this.tileSize);
        const slot = this.slottingManager.getSlotAt(tileX, tileY);

        if (slot) {
            this.statusText.setText(`Location: ${slot.id} (${slot.zone} Zone)`);

            // Handle Interaction
            if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                if (this.warehouseManager.pickItem(slot.id)) {
                    this.updateOrderDisplay();
                    this.createFollower();
                    this.cameras.main.flash(200, 100, 255, 100);
                    this.showDialogue(`Picked up a ${slot.id}!`);

                    const order = this.warehouseManager.getCurrentOrder();
                    if (order?.status === 'PACKING') {
                        this.showDialogue("All items picked! \nGo to the Shipping Area (Top Right).");
                    }
                }
            }
        } else {
            this.statusText.setText(`Location: x:${tileX} y:${tileY}`);

            // Check if in Shipping Zone
            const isInShipping = (
                tileX >= this.shippingZonePos.x &&
                tileX < this.shippingZonePos.x + this.shippingZonePos.width &&
                tileY >= this.shippingZonePos.y &&
                tileY < this.shippingZonePos.y + this.shippingZonePos.height
            );

            if (isInShipping) {
                this.statusText.setText("Location: SHIPPING ZONE");
                if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                    if (this.warehouseManager.completeOrder()) {
                        this.showDialogue("Order Shipped Successfully! \nGood job!");
                        this.clearFollowers();
                        this.updateOrderDisplay();
                        this.cameras.main.shake(500, 0.01);
                    } else {
                        const order = this.warehouseManager.getCurrentOrder();
                        if (order?.status === 'PICKING') {
                            this.showDialogue("Order is incomplete! \nPick all items first.");
                        }
                    }
                }
            }
        }

        this.updateFollowers();
    }

    private clearFollowers() {
        this.inventoryFollowers.forEach(f => f.destroy());
        this.inventoryFollowers = [];
    }

    private createFollower() {
        const follower = this.add.arc(this.player.x, this.player.y, 8, 0, 360, false, 0x00ff00);
        this.inventoryFollowers.push(follower);
    }

    private updateFollowers() {
        let prevX = this.player.x + 16;
        let prevY = this.player.y + 16;

        this.inventoryFollowers.forEach((follower) => {
            const targetX = prevX;
            const targetY = prevY;

            // Simple smoothing
            follower.x += (targetX - 24 - follower.x) * 0.2;
            follower.y += (targetY - follower.y) * 0.2;

            prevX = follower.x;
            prevY = follower.y;
        });
    }
}
