import Phaser from 'phaser';
import { sounds } from '../../systems/SoundSystem.js';

/**
 * PatrolToy - Soldadinho de Chumbo patrulheiro.
 * Shows visible vision cone, alert bubble ("❗") with generous reaction window,
 * and balanced speed so the game is fun and fair.
 */
export default class PatrolToy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, waypoints) {
    super(scene, x, y, 'patrol_down_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(18, 16);
    this.body.setOffset(11, 38);

    this.waypoints = waypoints || [];
    this.currentWaypoint = 0;
    this.speed = 55; // Fair patrol speed
    this.chaseSpeed = 95; // Manageable chase speed
    this.state = 'PATROL'; // PATROL, ALERT, CHASE, SEARCH, RETURN
    this.visionRange = 130;
    this.direction = 'down';
    this.alertTimer = 0;

    // Vision cone graphics
    this.visionGfx = scene.add.graphics().setDepth(5);

    // Alert bubble ("❗" / "❓")
    this.alertBubble = scene.add.text(this.x, this.y - 35, '', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#B32D48',
      stroke: '#FFF8E7',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(15).setVisible(false);

    this.createAnimations(scene);
  }

  createAnimations(scene) {
    const directions = ['down', 'up', 'left', 'right'];
    directions.forEach(dir => {
      if (!scene.anims.exists(`patrol_walk_${dir}`)) {
        scene.anims.create({
          key: `patrol_walk_${dir}`,
          frames: [{ key: `patrol_${dir}_0` }, { key: `patrol_${dir}_1` }],
          frameRate: 4,
          repeat: -1,
        });
      }
      if (!scene.anims.exists(`patrol_idle_${dir}`)) {
        scene.anims.create({
          key: `patrol_idle_${dir}`,
          frames: [{ key: `patrol_${dir}_0` }],
          frameRate: 1,
          repeat: 0,
        });
      }
    });
  }

  update(player) {
    this.alertBubble.setPosition(this.x, this.y - 35);
    this.drawVisionCone();

    if (player.isHiding) {
      if (this.state === 'CHASE' || this.state === 'ALERT') {
        this.setSearchState();
      }
    }

    switch (this.state) {
      case 'PATROL':
        this.handlePatrol();
        this.checkVision(player);
        break;

      case 'ALERT':
        this.handleAlert(player);
        break;

      case 'CHASE':
        this.handleChase(player);
        break;

      case 'SEARCH':
        this.handleSearch();
        this.checkVision(player);
        break;
    }

    this.updateAnimation();
  }

  drawVisionCone() {
    this.visionGfx.clear();
    if (this.state === 'CHASE') {
      this.visionGfx.fillStyle(0xB32D48, 0.22); // Red when chasing
    } else if (this.state === 'ALERT') {
      this.visionGfx.fillStyle(0xF4D56D, 0.25); // Yellow when suspicious
    } else {
      this.visionGfx.fillStyle(0xF4D56D, 0.12); // Soft warm light
    }

    let angle = 0;
    if (this.direction === 'down') angle = Math.PI / 2;
    else if (this.direction === 'up') angle = -Math.PI / 2;
    else if (this.direction === 'left') angle = Math.PI;
    else if (this.direction === 'right') angle = 0;

    const fov = Math.PI / 3; // 60 degrees cone
    this.visionGfx.beginPath();
    this.visionGfx.moveTo(this.x, this.y);
    this.visionGfx.arc(this.x, this.y, this.visionRange, angle - fov / 2, angle + fov / 2);
    this.visionGfx.closePath();
    this.visionGfx.fill();
  }

  checkVision(player) {
    if (player.isHiding) return false;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist > this.visionRange) return false;

    const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    let facingAngle = 0;
    if (this.direction === 'down') facingAngle = Math.PI / 2;
    else if (this.direction === 'up') facingAngle = -Math.PI / 2;
    else if (this.direction === 'left') facingAngle = Math.PI;
    else if (this.direction === 'right') facingAngle = 0;

    let diff = Phaser.Math.Angle.Wrap(angleToPlayer - facingAngle);
    if (Math.abs(diff) < Math.PI / 4) {
      // Spotted player! Enter ALERT first so player has reaction time
      if (this.state !== 'ALERT' && this.state !== 'CHASE') {
        this.state = 'ALERT';
        this.alertTimer = this.scene.time.now + 800; // 0.8s warning
        this.alertBubble.setText('❓').setVisible(true);
        sounds.playAlertSound();
      }
      return true;
    }
    return false;
  }

  handleAlert(player) {
    this.setVelocity(0);
    // Face player
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.setDirectionFromAngle(angle);

    if (this.scene.time.now > this.alertTimer) {
      if (!player.isHiding) {
        this.state = 'CHASE';
        this.alertBubble.setText('❗');
      } else {
        this.setSearchState();
      }
    }
  }

  handleChase(player) {
    if (player.isHiding) {
      this.setSearchState();
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist > this.visionRange * 1.6) {
      this.setSearchState();
      return;
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.setVelocity(Math.cos(angle) * this.chaseSpeed, Math.sin(angle) * this.chaseSpeed);
    this.setDirectionFromAngle(angle);
  }

  setSearchState() {
    this.state = 'SEARCH';
    this.alertBubble.setText('...').setVisible(true);
    this.setVelocity(0);

    this.scene.time.delayedCall(2000, () => {
      this.alertBubble.setVisible(false);
      this.state = 'PATROL';
    });
  }

  handlePatrol() {
    this.alertBubble.setVisible(false);
    if (!this.waypoints.length) return;

    const target = this.waypoints[this.currentWaypoint];
    const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);

    if (dist < 15) {
      this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
    } else {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
      this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
      this.setDirectionFromAngle(angle);
    }
  }

  handleSearch() {
    this.setVelocity(0);
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
      this.play(`patrol_walk_${this.direction}`, true);
    } else {
      this.play(`patrol_idle_${this.direction}`, true);
    }
  }

  destroy(fromScene) {
    if (this.visionGfx) this.visionGfx.destroy();
    if (this.alertBubble) this.alertBubble.destroy();
    super.destroy(fromScene);
  }
}
