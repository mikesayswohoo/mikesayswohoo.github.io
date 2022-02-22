/* eslint-disable camelcase */
/* eslint-disable new-cap */
import seedrandom from 'seedrandom';
import * as PIXI from 'pixi.js-legacy';

export default {
  init: function() {
    this.initBonkGraphics();
  },
  initBonkGraphics: function() {
    GameRendererClass.prototype.render = (function() {
      GameRendererClass.prototype.render_OLD = GameRendererClass.prototype.render;
      return function() {
        if (arguments[0].physics.shapes.length != arguments[1].physics.shapes.length) {
          for (let i = 0; i != arguments[1].physics.shapes.length; i++) {
            if (!arguments[0].physics.shapes[i]) arguments[0].physics.shapes[i] = arguments[1].physics.shapes[i];
          }
          for (let i = 0; i != arguments[1].physics.bodies.length; i++) {
            if (!arguments[0].physics.bodies[i]) arguments[0].physics.bodies[i] = arguments[1].physics.bodies[i];
          }
          for (let i = 0; i != arguments[1].physics.fixtures.length; i++) {
            if (!arguments[0].physics.fixtures[i]) arguments[0].physics.fixtures[i] = arguments[1].physics.fixtures[i];
          }
        }

        // remove arrows from camera container
        for (let i = 0; i < this.arrowGraphics.length; i++) {
          if (this.arrowGraphics[i] && gm.graphics.cameraContainer.children.includes(this.arrowGraphics[i].graphic) &&
            ((!arguments[0].projectiles[i] || !arguments[1].projectiles[i] || arguments[1].projectiles[i].did != this.arrowGraphics[i].ownerID))) {
            gm.graphics.cameraContainer.removeChild(this.arrowGraphics[i].graphic);
          }
        }

        const result = this.render_OLD.apply(this, arguments);

        if (!gm.graphics.bodyGraphicsClass) gm.graphics.bodyGraphicsClass = this.roundGraphics.bodyGraphics[0]?.constructor;

        gm.graphics.rendererClass = this;

        gm.graphics.rendering = true;

        // camera container creation
        if (!gm.graphics.cameraContainer || gm.graphics.cameraContainer._destroyed || !this.blurContainer.children.includes(gm.graphics.cameraContainer)) {
          gm.graphics.cameraContainer = new PIXI.Container();

          this.blurContainer.addChild(gm.graphics.cameraContainer);

          gm.graphics.cameraContainer.addChild(this.environmentContainer);
          gm.graphics.cameraContainer.addChild(this.discContainer);

          gm.graphics.cameraContainer.pivot.x = 365 * gm.graphics.rendererClass.scaleRatio;
          gm.graphics.cameraContainer.pivot.y = 250 * gm.graphics.rendererClass.scaleRatio;
        }

        if (!gm.graphics.cameraContainer.children.includes(this.particleManager.container)) gm.graphics.cameraContainer.addChild(this.particleManager.container);

        if (this.blurContainer && (this.blurContainer.pivot.x != gm.graphics.rendererClass.domLastWidth / 2 || this.blurContainer.pivot.y != gm.graphics.rendererClass.domLastHeight / 2)) {
          this.blurContainer.pivot.x = -365 * gm.graphics.rendererClass.scaleRatio;
          this.blurContainer.pivot.y = -250 * gm.graphics.rendererClass.scaleRatio;
        }

        // move arrows to camera container
        for (let i = 0; i < this.arrowGraphics.length; i++) {
          if (this.arrowGraphics[i] && !gm.graphics.cameraContainer.children.includes(this.arrowGraphics[i].graphic)) {
            gm.graphics.cameraContainer.addChild(this.arrowGraphics[i].graphic);
          }
        }

        // world and disc drawing objects add to stage
        if (gm.graphics.rendererClass) {
          for (let i = 0; i != gm.graphics.rendererClass.discGraphics.length; i++) {
            if (gm.graphics.additionalWorldGraphics[i] && !gm.graphics.additionalWorldGraphics[i]._destroyed && !gm.graphics.rendererClass.discGraphics[i]) {
              gm.graphics.additionalWorldGraphics[i].clear();
              gm.graphics.additionalWorldGraphics[i].removeChildren();
            }
            if (arguments[0].discs[i] && gm.graphics.rendererClass.discGraphics[i] && gm.graphics.additionalDiscGraphics[i] && !gm.graphics.rendererClass.discGraphics[i].container.children.includes(gm.graphics.additionalDiscGraphics[i])) {
              gm.graphics.additionalDiscGraphics[i].scale.x = gm.graphics.rendererClass.scaleRatio;
              gm.graphics.additionalDiscGraphics[i].scale.y = gm.graphics.rendererClass.scaleRatio;
              gm.graphics.rendererClass.discGraphics[i].container.addChild(gm.graphics.additionalDiscGraphics[i]);
            }
            if (arguments[0].discs[i] && gm.graphics.rendererClass.blurContainer && gm.graphics.additionalWorldGraphics[i] && gm.lobby.roundStarting && !gm.graphics.cameraContainer.children.includes(gm.graphics.additionalWorldGraphics[i])) {
              gm.graphics.additionalWorldGraphics[i].scale.x = gm.graphics.rendererClass.scaleRatio;
              gm.graphics.additionalWorldGraphics[i].scale.y = gm.graphics.rendererClass.scaleRatio;
              gm.graphics.cameraContainer.addChild(gm.graphics.additionalWorldGraphics[i]);
            }
          }
        }

        // make seed based on scene element positions and game state seed
        const gst = gm.physics.gameState;
        let randomSeed = 0;
        for (let i = 0; i != gst.physics.bodies.length; i++) {
          if (gst.physics.bodies[i]) {
            randomSeed = randomSeed + gst.physics.bodies[i].p[0] + gst.physics.bodies[i].p[1] + gst.physics.bodies[i].a;
          }
        }
        for (let i = 0; i != gst.discs.length; i++) {
          if (gst.discs[i]) {
            randomSeed = randomSeed + gst.discs[i].x + gst.discs[i].y + gst.discs[i].xv + gst.discs[i].yv;
          }
        }
        randomSeed += gst.rl;
        randomSeed /= gst.seed;
        gm.physics.pseudoRandom = new seedrandom(randomSeed);

        if (gm.physics.gameState && gm.physics.gameState.discs) {
          for (let i = 0; i != gm.physics.gameState.discs.length; i++) {
            if (gm.physics.gameState.discs[i]) {
              if (!gm.inputs.allPlayerInputs[i]) {
                gm.inputs.allPlayerInputs[i] = {left: false, right: false, up: false, down: false, action: false, action2: false};
              }
              gm.graphics.onRender(i);
            }
          }
        }
        gm.graphics.rendering = false;

        return result;
      };
    })();
    GameRendererClass.prototype.destroy = (function() {
      GameRendererClass.prototype.destroy_OLD = GameRendererClass.prototype.destroy;
      return function() {
        if (gm.graphics.rendererClass) {
          for (let a = 0; a != gm.graphics.rendererClass.discGraphics.length; a++) {
            if (!gm.graphics.rendererClass.discGraphics[a]) continue;

            gm.graphics.additionalDiscGraphics[a]?.removeChildren();
            gm.graphics.additionalWorldGraphics[a]?.removeChildren();

            const discObject = gm.graphics.rendererClass.discGraphics[a].container;
            while (discObject.children[0]) {
              discObject.removeChild(discObject.children[0]);
            }
          }

          const worldObject = gm.graphics.cameraContainer;
          while (worldObject.children[0]) {
            worldObject.removeChild(worldObject.children[0]);
          }

          gm.graphics.cameraContainer?.destroy();

          gm.graphics.additionalDiscGraphics = [];
          gm.graphics.additionalWorldGraphics = [];
        }
        const result = this.destroy_OLD.apply(this, arguments);
        gm.graphics.renderUpdates = [];
        return result;
      };
    })();
    GameRendererClass.prototype.resizeRenderer = (function() {
      GameRendererClass.prototype.resizeRenderer_OLD = GameRendererClass.prototype.resizeRenderer;
      return function() {
        for (let i = 0; i != gm.graphics.additionalDiscGraphics.length; i++) {
          if (!gm.graphics.additionalDiscGraphics[i]) continue;
          gm.graphics.rendererClass?.discGraphics[i]?.container.removeChild(gm.graphics.additionalDiscGraphics[i]);
        }
        for (let i = 0; i != gm.graphics.additionalWorldGraphics.length; i++) {
          if (!gm.graphics.additionalWorldGraphics[i]) continue;
          gm.graphics.cameraContainer?.removeChild(gm.graphics.additionalWorldGraphics[i]);
        }
        const result = this.resizeRenderer_OLD.apply(this, arguments);
        for (let i = 0; i != gm.graphics.additionalDiscGraphics.length; i++) {
          if (!gm.graphics.additionalDiscGraphics[i]) continue;

          gm.graphics.additionalDiscGraphics[i].scale.x = gm.graphics.rendererClass.scaleRatio;
          gm.graphics.additionalDiscGraphics[i].scale.y = gm.graphics.rendererClass.scaleRatio;
          gm.graphics.rendererClass?.discGraphics[i]?.container.addChild(gm.graphics.additionalDiscGraphics[i]);
        }
        for (let i = 0; i != gm.graphics.additionalWorldGraphics.length; i++) {
          if (!gm.graphics.additionalWorldGraphics[i]) continue;

          gm.graphics.additionalWorldGraphics[i].scale.x = gm.graphics.rendererClass.scaleRatio;
          gm.graphics.additionalWorldGraphics[i].scale.y = gm.graphics.rendererClass.scaleRatio;
          gm.graphics.cameraContainer?.addChild(gm.graphics.additionalWorldGraphics[i]);
        }

        if (gm.graphics.cameraContainer && !gm.graphics.cameraContainer._destroyed) {
          gm.graphics.cameraContainer.pivot.x = 365 * gm.graphics.rendererClass.scaleRatio;
          gm.graphics.cameraContainer.pivot.y = 250 * gm.graphics.rendererClass.scaleRatio;
        }
        return result;
      };
    })();
  },
  onPhysStep: function(gameState) {
    // world and disc drawing objects creation
    for (let i = 0; i != gameState.discs.length; i++) {
      if (gameState.discs[i] && (!gm.graphics.additionalDiscGraphics[i] || gm.graphics.additionalDiscGraphics[i]._destroyed)) {
        gm.graphics.additionalDiscGraphics[i] = new PIXI.Graphics();
      }
      if (gameState.discs[i] && (!gm.graphics.additionalWorldGraphics[i] || gm.graphics.additionalWorldGraphics[i]._destroyed)) {
        gm.graphics.additionalWorldGraphics[i] = new PIXI.Graphics();
      }
    }
  },
  doRollback: function(fromStepCount, toStepCount) {
    for (let i = fromStepCount; i > toStepCount; i--) {
      const previousGameState = window.gmReplaceAccessors.gameStateList[i - 1];
      const gameState = window.gmReplaceAccessors.gameStateList[i];
      if (gm.graphics.renderUpdates[gameState.rl] && previousGameState) {
        const alreadyDone = [];

        for (let a = 0; a != gm.graphics.renderUpdates[gameState.rl].length; a++) {
          const update = gm.graphics.renderUpdates[gameState.rl][a];

          if (alreadyDone.includes(update)) continue;

          switch (update.action) {
            case 'create': {
              if (this.rendererClass.roundGraphics.bodyGraphics[update.id]) {
                this.rendererClass.roundGraphics.displayObject.removeChild(this.rendererClass.roundGraphics.bodyGraphics[update.id].jointContainer);
                this.rendererClass.roundGraphics.displayObject.removeChild(this.rendererClass.roundGraphics.bodyGraphics[update.id].displayObject);
                this.rendererClass.roundGraphics.bodyGraphics[update.id].destroy();
                delete this.rendererClass.roundGraphics.bodyGraphics[update.id];
              }
              break;
            }
            case 'delete': {
              const newBodyGraphics = new gm.graphics.bodyGraphicsClass(previousGameState, update.id, this.rendererClass.scaleRatio, this.rendererClass.renderer, gm.lobby.mpSession.getGameSettings(), this.rendererClass.playerArray);

              this.rendererClass.roundGraphics.bodyGraphics[update.id] = newBodyGraphics;

              if (this.rendererClass.roundGraphics.bodyGraphics[previousGameState.physics.bro[update.id - 1]]) {
                const index = this.rendererClass.roundGraphics.displayObject.children.indexOf(this.rendererClass.roundGraphics.bodyGraphics[previousGameState.physics.bro[update.id - 1]]);
                this.rendererClass.roundGraphics.displayObject.addChildAt(newBodyGraphics.displayObject, index);
                if (newBodyGraphics.jointContainer.children.length > 0) this.rendererClass.roundGraphics.displayObject.addChildAt(newBodyGraphics.jointContainer, index);
              } else {
                if (newBodyGraphics.jointContainer.children.length > 0) this.rendererClass.roundGraphics.displayObject.addChild(newBodyGraphics.jointContainer);
                this.rendererClass.roundGraphics.displayObject.addChildAt(newBodyGraphics.displayObject, 0);
              }

              break;
            }
            case 'update': {
              if (this.rendererClass.roundGraphics.bodyGraphics[update.id]) {
                this.rendererClass.roundGraphics.displayObject.removeChild(this.rendererClass.roundGraphics.displayObject[update.id]);
                this.rendererClass.roundGraphics.bodyGraphics[update.id]?.destroy();
              }

              const newBodyGraphics = new gm.graphics.bodyGraphicsClass(previousGameState, update.id, this.rendererClass.scaleRatio, this.rendererClass.renderer, gm.lobby.mpSession.getGameSettings(), this.rendererClass.playerArray);

              this.rendererClass.roundGraphics.bodyGraphics[update.id] = newBodyGraphics;

              if (this.rendererClass.roundGraphics.bodyGraphics[previousGameState.physics.bro[update.id - 1]]) {
                const index = this.rendererClass.roundGraphics.displayObject.children.indexOf(this.rendererClass.roundGraphics.bodyGraphics[previousGameState.physics.bro[update.id - 1]]);
                this.rendererClass.roundGraphics.displayObject.addChildAt(newBodyGraphics.displayObject, index);
                if (newBodyGraphics.jointContainer.children.length > 0) this.rendererClass.roundGraphics.displayObject.addChildAt(newBodyGraphics.jointContainer, index);
              } else {
                if (newBodyGraphics.jointContainer.children.length > 0) this.rendererClass.roundGraphics.displayObject.addChild(newBodyGraphics.jointContainer);
                this.rendererClass.roundGraphics.displayObject.addChildAt(newBodyGraphics.displayObject, 0);
              }

              break;
            }
          }

          alreadyDone.push(update);
        }

        delete gm.graphics.renderUpdates[gameState.rl];
      }
    }
  },
  doRenderUpdates: function(gameState) {
    if (gm.graphics.renderUpdates[gameState.rl]) {
      const alreadyDone = [];

      for (let i = 0; i != gm.graphics.renderUpdates[gameState.rl].length; i++) {
        const update = gm.graphics.renderUpdates[gameState.rl][i];

        if (alreadyDone.includes(update)) continue;
        if (update.done) continue;

        switch (update.action) {
          case 'create': {
            const newBodyGraphics = new gm.graphics.bodyGraphicsClass(gameState, update.id, this.rendererClass.scaleRatio, this.rendererClass.renderer, gm.lobby.mpSession.getGameSettings(), this.rendererClass.playerArray);

            this.rendererClass.roundGraphics.bodyGraphics[update.id] = newBodyGraphics;

            if (this.rendererClass.roundGraphics.bodyGraphics[gameState.physics.bro[update.id - 1]]) {
              const index = this.rendererClass.roundGraphics.displayObject.children.indexOf(this.rendererClass.roundGraphics.bodyGraphics[gameState.physics.bro[update.id - 1]]);
              this.rendererClass.roundGraphics.displayObject.addChildAt(newBodyGraphics.displayObject, index);
              if (newBodyGraphics.jointContainer.children.length > 0) this.rendererClass.roundGraphics.displayObject.addChildAt(newBodyGraphics.jointContainer, index);
            } else {
              if (newBodyGraphics.jointContainer.children.length > 0) this.rendererClass.roundGraphics.displayObject.addChild(newBodyGraphics.jointContainer);
              this.rendererClass.roundGraphics.displayObject.addChildAt(newBodyGraphics.displayObject, 0);
            }

            break;
          }
          case 'delete': {
            if (this.rendererClass.roundGraphics.bodyGraphics[update.id]) {
              this.rendererClass.roundGraphics.displayObject.removeChild(this.rendererClass.roundGraphics.bodyGraphics[update.id].jointContainer);
              this.rendererClass.roundGraphics.displayObject.removeChild(this.rendererClass.roundGraphics.bodyGraphics[update.id].displayObject);
              this.rendererClass.roundGraphics.bodyGraphics[update.id].destroy();
              delete this.rendererClass.roundGraphics.bodyGraphics[update.id];
            }
            break;
          }
          case 'update': {
            if (this.rendererClass.roundGraphics.bodyGraphics[update.id]) {
              this.rendererClass.roundGraphics.displayObject.removeChild(this.rendererClass.roundGraphics.displayObject[update.id]);
              this.rendererClass.roundGraphics.bodyGraphics[update.id]?.destroy();
            }

            const newBodyGraphics = new gm.graphics.bodyGraphicsClass(gameState, update.id, this.rendererClass.scaleRatio, this.rendererClass.renderer, gm.lobby.mpSession.getGameSettings(), this.rendererClass.playerArray);

            if (this.rendererClass.roundGraphics.bodyGraphics[gameState.physics.bro[update.id - 1]]) {
              const index = this.rendererClass.roundGraphics.displayObject.children.indexOf(this.rendererClass.roundGraphics.bodyGraphics[gameState.physics.bro[update.id - 1]]);
              this.rendererClass.roundGraphics.displayObject.addChildAt(newBodyGraphics.displayObject, index);
              if (newBodyGraphics.jointContainer.children.length > 0) this.rendererClass.roundGraphics.displayObject.addChildAt(newBodyGraphics.jointContainer, index);
            } else {
              if (newBodyGraphics.jointContainer.children.length > 0) this.rendererClass.roundGraphics.displayObject.addChild(newBodyGraphics.jointContainer);
              this.rendererClass.roundGraphics.displayObject.addChildAt(newBodyGraphics.displayObject, 0);
            }

            break;
          }
        }

        gm.graphics.renderUpdates[gameState.rl][i].done = true;
        update.done = true;
        alreadyDone.push(update);
      }
    }
  },
  rendererClass: null,
  bodyGraphicsClass: null,
  cameraContainer: null,
  rendering: false,
  renderUpdates: [],
  additionalDiscGraphics: [],
  additionalWorldGraphics: [],
  availableText: [],
  usedText: [],
  onRender: function() { },
};
