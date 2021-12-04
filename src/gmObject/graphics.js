/* eslint-disable camelcase */
/* eslint-disable new-cap */
export default {
  init: function() {
    this.initBonkGraphics();
  },
  initBonkGraphics: function() {
    GameRendererClass.prototype.render = (function() {
      GameRendererClass.prototype.render_OLD = GameRendererClass.prototype.render;
      return function() {
        const result = this.render_OLD.apply(this, arguments);
        gm.graphics.rendererClass = this;

        if (gm.graphics.rendererClass) {
          for (let i = 0; i != gm.graphics.rendererClass.discGraphics.length; i++) {
            if (gm.graphics.rendererClass.discGraphics[i] && (!gm.graphics.additionalDiscGraphics[i] || gm.graphics.additionalDiscGraphics[i]._destroyed == true)) {
              const discGraphics = new PIXI.Graphics();

              gm.graphics.rendererClass.discGraphics[i].playerGraphic.addChild(discGraphics);
              gm.graphics.additionalDiscGraphics[i] = discGraphics;

              const worldGraphics = new PIXI.Graphics();

              gm.graphics.rendererClass.particleManager.container.addChild(worldGraphics);
              gm.graphics.additionalWorldGraphics[i] = worldGraphics;
            }
          }
        }

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

        return result;
      };
    })();
    GameRendererClass.prototype.destroy = (function() {
      GameRendererClass.prototype.destroy_OLD = GameRendererClass.prototype.destroy;
      return function() {
        if (gm.graphics.rendererClass) {
          for (let a = 0; a != gm.graphics.rendererClass.discGraphics.length; a++) {
            if (!gm.graphics.rendererClass.discGraphics[a]) continue;
            const discObject = gm.graphics.rendererClass.discGraphics[a].playerGraphic;
            while (discObject.children[0]) {
              discObject.removeChild(discObject.children[0]);
            }
          }

          const worldObject = gm.graphics.rendererClass.particleManager.container;
          while (worldObject.children[0]) {
            worldObject.removeChild(worldObject.children[0]);
          }

          gm.graphics.additionalDiscGraphics = [];
          gm.graphics.additionalWorldGraphics = [];
        }
        const result = this.destroy_OLD.apply(this, arguments);
        return result;
      };
    })();
  },
  rendererClass: null,
  additionalDiscGraphics: [],
  additionalWorldGraphics: [],
  onRender: function() { },
};
