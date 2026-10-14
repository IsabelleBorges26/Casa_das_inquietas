import Phaser from 'phaser';
import { sounds } from '../../systems/SoundSystem.js';

/**
 * NoiseToy - Palhacinho mecânico ouvinte.
 * Fica parado mas reage com curiosidade a ruídos da caixinha de música ou passos perto.
 */
export default class NoiseToy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'noise_down_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(18, 16);
    this.body.setOffset(11, 38);

    this.homePos = { x, y };
    this.speed = 50;
    this.state = 'IDLE'; // IDLE, INVESTIGATE, SEARCH, RETURN
    this.direction = 'down';

    // Hearing wave indicator
    this.soundWaveGfx = scene.add.graphics().setDepth(5);

    // Alert text
    this.alertBubble = scene.add.text(this.x, this.y - 35, '', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#79C9D0',
      stroke: '#382C3A',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(15).setVisible(false);

    this.createAnimations(scene);
  }

  createAnimations(scene) {
    const directions = ['down', 'up', 'left', 'right'];
    directions.forEach(dir => {
      if (!scene.anims.exists(`noise_walk_${dir}`)) {
        scene.anims.create({
          key: `noise_walk_${dir}`,
          frames: [{ key: `noise_${dir}_0` }, { key: `noise_${dir}_1` }],
          frameRate: 4,
          repeat: -1,
        });
      }
      if (!scene.anims.exists(`noise_idle_${dir}`)) {
        scene.anims.create({
          key: `noise_idle_${dir}`,
          frames: [{ key: `noise_${dir}_0` }],
          frameRate: 1,
          repeat: 0,
        });
      }
    });
  }

  hearNoise(targetX, targetY) {
    if (this.state === 'INVESTIGATE') return;

    this.state = 'INVESTIGATE';
    this.targetPos = { x: targetX, y: targetY };
    this.alertBubble.setText('🎵?').setVisible(true);
    sounds.playAlertSound();

    // Pulse hearing circle
    this.soundWaveGfx.clear();
    this.soundWaveGfx.lineStyle(2, 0x79C9D0, 0.7);
    this.soundWaveGfx.strokeCircle(this.x, this.y, 40);

    this.scene.tweens.add({
      targets: this.soundWaveGfx,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      onComplete: () => this.soundWaveGfx.clear()
    });
  }

  update(player) {
    this.alertBubble.setPosition(this.x, this.y - 35);

    if (this.state === 'INVESTIGATE' && this.targetPos) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
      if (dist < 20) {
        this.setVelocity(0);
        this.state = 'SEARCH';
        this.alertBubble.setText('...');
        this.scene.time.delayedCall(2500, () => {
          this.state = 'RETURN';
          this.alertBubble.setVisible(false);
        });
      } else {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
        this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
        this.setDirectionFromAngle(angle);
      }
    } else if (this.state === 'RETURN') {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.homePos.x, this.homePos.y);
      if (dist < 15) {
        this.setVelocity(0);
        this.state = 'IDLE';
        this.direction = 'down';
      } else {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.homePos.x, this.homePos.y);
        this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
        this.setDirectionFromAngle(angle);
      }
    } else {
      this.setVelocity(0);
    }

    this.updateAnimation();
  }

  setDirectionFromAngle(angle) {
    const deg = Phaser.Math.RadToDeg(angle);
    if (deg >= -45 && deg < 45) this.direction = 'right';
    else if (deg >= 45 && deg < 135) this.direction = 'down';
    else if (deg >= -135 && deg < -45) this.direction = 'up';
    else this.direction = 'left';
  }

  updateAnimation() {
    if (this.body.velocity.length() > 2) {
      this.play(`noise_walk_${this.direction}`, true);
    } else {
      this.play(`noise_idle_${this.direction}`, true);
    }
  }

  destroy(fromScene) {
    if (this.soundWaveGfx) this.soundWaveGfx.destroy();
    if (this.alertBubble) this.alertBubble.destroy();
    super.destroy(fromScene);
  }
}
