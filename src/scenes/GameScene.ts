import { SlottingManager } from '../managers/SlottingManager';

export class GameScene extends Phaser.Scene {
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private slottingManager: SlottingManager;
    private statusText!: Phaser.GameObjects.Text;
    private readonly speed = 160;
    private readonly tileSize = 32;

    constructor() {
        super('GameScene');
        this.slottingManager = new SlottingManager();
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
        }

        this.statusText = this.add.text(10, 10, 'Location: -', { color: '#ffffff', backgroundColor: '#000000' });
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
        } else {
            this.statusText.setText(`Location: x:${tileX} y:${tileY}`);
        }
    }
}
