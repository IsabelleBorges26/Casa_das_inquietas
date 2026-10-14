import Phaser from 'phaser';

/**
 * Doll - The protagonist. A living doll with walk animations in 4 directions.
 */
export default class Doll extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'doll_down_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setScale(0.85);
    this.body.setSize(22, 20);
    this.body.setOffset(13, 40);

    this.speed = 135;
    this.isHiding = false;
    this.direction = 'down';
    this.isMoving = false;

    this.createAnimations(scene);
  }

  createAnimations(scene) {
    const directions = ['down', 'up', 'left', 'right'];

    directions.forEach(dir => {
      // Walking animation
      if (!scene.anims.exists(`doll_walk_${dir}`)) {
        scene.anims.create({
          key: `doll_walk_${dir}`,
          frames: [
            { key: `doll_${dir}_0` },
            { key: `doll_${dir}_1` },
            { key: `doll_${dir}_0` },
            { key: `doll_${dir}_2` }
          ],
          frameRate: 6,
          repeat: -1,
        });
      }

      // Idle
      if (!scene.anims.exists(`doll_idle_${dir}`)) {
        scene.anims.create({
          key: `doll_idle_${dir}`,
          frames: [{ key: `doll_${dir}_0` }],
          frameRate: 1,
          repeat: 0,
        });
      }
    });
  }

  update(cursors, wasd, joystickData) {
    if (this.isHiding) {
      this.setVelocity(0);
      this.setAlpha(0.2);
      return;
    }

    this.setAlpha(1);

    let vx = 0;
    let vy = 0;

    // Keyboard input
    if (cursors.left.isDown || wasd.A.isDown) vx = -1;
    else if (cursors.right.isDown || wasd.D.isDown) vx = 1;

    if (cursors.up.isDown || wasd.W.isDown) vy = -1;
    else if (cursors.down.isDown || wasd.S.isDown) vy = 1;

    // Virtual joystick override
    if (joystickData && joystickData.force > 0) {
      vx = joystickData.x;
      vy = joystickData.y;
    }

    if (vx !== 0 || vy !== 0) {
      const length = Math.sqrt(vx * vx + vy * vy);
      vx /= length;
      vy /= length;

      this.setVelocityX(vx * this.speed);
      this.setVelocityY(vy * this.speed);

      if (Math.abs(vx) > Math.abs(vy)) {
        this.direction = vx > 0 ? 'right' : 'left';
      } else {
        this.direction = vy > 0 ? 'down' : 'up';
      }

      if (!this.isMoving) {
        this.isMoving = true;
      }
      this.play(`doll_walk_${this.direction}`, true);

    } else {
      this.setVelocity(0);
      if (this.isMoving) {
        this.isMoving = false;
        this.play(`doll_idle_${this.direction}`, true);
      }
    }
  }
}
