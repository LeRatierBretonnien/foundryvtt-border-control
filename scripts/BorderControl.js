
import { libWrapper } from './shim.js';

Hooks.once('init', async function () {

    game.settings.register("Border-Control", "removeBorders", {
        name: 'Remove Borders',
        hint: 'Remove the border from specific tokens',
        scope: 'world',
        type: String,
        choices: {
            "0": "None",
            "1": "Non Owned",
            "2": "All",
        },
        default: "0",
        config: true,
    });
    game.settings.register("Border-Control", "borderWidth", {
        name: 'Border Width',
        hint: 'Override border width',
        scope: 'client',
        type: Number,
        default: 4,
        config: true,
    });

    game.settings.register("Border-Control", "circleBorders", {
        name: 'Circular Borders',
        scope: 'client',
        type: Boolean,
        default: false,
        config: true,
    });

    game.settings.register("Border-Control", "controlledColor", {
        name: 'Color: Controlled',
        scope: 'client',
        type: String,
        default: "#FF9829",
        config: true,
    });
    game.settings.register("Border-Control", "controlledColorEx", {
        name: 'Color: Controlled External',
        scope: 'client',
        type: String,
        default: "#000000",
        config: true,
    });
    game.settings.register("Border-Control", "hostileColor", {
        name: 'Color: Hostile',
        scope: 'client',
        type: String,
        default: "#E72124",
        config: true,
    });
    game.settings.register("Border-Control", "hostileColorEx", {
        name: 'Color: Hostile External',
        scope: 'client',
        type: String,
        default: "#000000",
        config: true,
    });
    game.settings.register("Border-Control", "friendlyColor", {
        name: 'Color: Friendly',
        scope: 'client',
        type: String,
        default: "#43DFDF",
        config: true,
    });
    game.settings.register("Border-Control", "friendlyColorEx", {
        name: 'Color: Friendly External',
        scope: 'client',
        type: String,
        default: "#000000",
        config: true,
    });
    game.settings.register("Border-Control", "neutralColor", {
        name: 'Color: Neutral',
        scope: 'client',
        type: String,
        default: "#F1D836",
        config: true,
    });
    game.settings.register("Border-Control", "neutralColorEx", {
        name: 'Color: Neutral External',
        scope: 'client',
        type: String,
        default: "#000000",
        config: true,
    });
    game.settings.register("Border-Control", "partyColor", {
        name: 'Color: Party',
        scope: 'client',
        type: String,
        default: "#33BC4E",
        config: true,
    });
    game.settings.register("Border-Control", "partyColorEx", {
        name: 'Color: Party External',
        scope: 'client',
        type: String,
        default: "#000000",
        config: true,
    });



    libWrapper.register('Border-Control', 'Token.prototype._refreshBorder', BorderFrame.newBorder, 'OVERRIDE')
    libWrapper.register('Border-Control', 'Token.prototype._getBorderColor', BorderFrame.newBorderColor, 'OVERRIDE')
});

Hooks.on('renderTokenHUD', (app, html, data) => {
    BorderFrame.AddBorderToggle(app, html, data)
})
Hooks.on('renderSettingsConfig', (app, el, data) => {
    let nC = game.settings.get("Border-Control", "neutralColor");
    let fC = game.settings.get("Border-Control", "friendlyColor");
    let hC = game.settings.get("Border-Control", "hostileColor");
    let cC = game.settings.get("Border-Control", "controlledColor");
    let pC = game.settings.get("Border-Control", "partyColor");
    let nCE = game.settings.get("Border-Control", "neutralColorEx");
    let fCE = game.settings.get("Border-Control", "friendlyColorEx");
    let hCE = game.settings.get("Border-Control", "hostileColorEx");
    let cCE = game.settings.get("Border-Control", "controlledColorEx");
    let pCE = game.settings.get("Border-Control", "partyColorEx");
    el.find('[name="Border-Control.neutralColor"]').parent().append(`<input type="color" value="${nC}" data-edit="Border-Control.neutralColor">`)
    el.find('[name="Border-Control.friendlyColor"]').parent().append(`<input type="color" value="${fC}" data-edit="Border-Control.friendlyColor">`)
    el.find('[name="Border-Control.hostileColor"]').parent().append(`<input type="color" value="${hC}" data-edit="Border-Control.hostileColor">`)
    el.find('[name="Border-Control.controlledColor"]').parent().append(`<input type="color"value="${cC}" data-edit="Border-Control.controlledColor">`)
    el.find('[name="Border-Control.partyColor"]').parent().append(`<input type="color"value="${pC}" data-edit="Border-Control.partyColor">`)
    el.find('[name="Border-Control.neutralColorEx"]').parent().append(`<input type="color" value="${nCE}" data-edit="Border-Control.neutralColorEx">`)
    el.find('[name="Border-Control.friendlyColorEx"]').parent().append(`<input type="color" value="${fCE}" data-edit="Border-Control.friendlyColorEx">`)
    el.find('[name="Border-Control.hostileColorEx"]').parent().append(`<input type="color" value="${hCE}" data-edit="Border-Control.hostileColorEx">`)
    el.find('[name="Border-Control.controlledColorEx"]').parent().append(`<input type="color"value="${cCE}" data-edit="Border-Control.controlledColorEx">`)
    el.find('[name="Border-Control.partyColorEx"]').parent().append(`<input type="color"value="${pCE}" data-edit="Border-Control.partyColorEx">`)

});


Hooks.on("createToken", (_scene, data) => {
    setTimeout(function () {
        let token = canvas.tokens.get(data._id)
        if (!token.owner) token.cursor = "default"
    }, 500)
})

Hooks.once("ready", () => {
    canvas.tokens.placeables.forEach(t => {
        if (!t.owner) t.cursor = "default"
    })
})



class BorderFrame {
    static AddBorderToggle(app, html, data) {
        if(!game.user.isGM) return;
        const borderButton = `<div class="control-icon border ${app.object.data.flags["Border-Control"]?.noBorder ? "active" : ""}" title="Toggle Border"> <i class="fas fa-border-style"></i></div>`
        let rightCol = html.find('.right')
        rightCol.append(borderButton)
        html.find('.border').click(this.ToggleBorder.bind(app))
    }

    static async ToggleBorder(event) {
        const border = this.object.getFlag("Border-Control", "noBorder")
        await this.object.setFlag("Border-Control", "noBorder", !border)
        event.currentTarget.classList.toggle("active", !border);

    }
    static newBorder() {
        this.border.clear();
        const borderColor = this._getBorderColor();
        if (!borderColor) return;
        switch (game.settings.get("Border-Control", "removeBorders")) {
            case "0": break;
            case "1": if (!this.owner) return;
                break;
            case "2": return;
        }
        if (this.getFlag("Border-Control", "noBorder")) return;
        const t = game.settings.get("Border-Control", "borderWidth") || CONFIG.Canvas.objectBorderThickness;

        // Draw Hex border for size 1 tokens on a hex grid
        const gt = CONST.GRID_TYPES;
        const hexTypes = [gt.HEXEVENQ, gt.HEXEVENR, gt.HEXODDQ, gt.HEXODDR];
        if(game.settings.get("Border-Control", "circleBorders")){
            const h = Math.round(t / 2);
            const o = Math.round(h / 2);
            this.border.lineStyle(t, borderColor.EX, 0.8).drawCircle(this.w/2, this.h/2, this.w/2 + t);
            this.border.lineStyle(h, borderColor.INT, 1.0).drawCircle(this.w/2, this.h/2, this.w/2 + h+t/2);
        }
        else if (hexTypes.includes(canvas.grid.type) && (this.data.width === 1) && (this.data.height === 1)) {
            const polygon = canvas.grid.grid.getPolygon(-1, -1, this.w + 2, this.h + 2);
            this.border.lineStyle(t, borderColor.EX, 0.8).drawPolygon(polygon);
            this.border.lineStyle(t / 2, borderColor.INT, 1.0).drawPolygon(polygon);
        }

        // Otherwise Draw Square border
        else {
            const h = Math.round(t / 2);
            const o = Math.round(h / 2);
            this.border.lineStyle(t, borderColor.EX, 0.8).drawRoundedRect(-o, -o, this.w + h, this.h + h, 3);
            this.border.lineStyle(h, borderColor.INT, 1.0).drawRoundedRect(-o, -o, this.w + h, this.h + h, 3);
        }
        return;
    }

    static newBorderColor() {

        const overrides = {
            CONTROLLED: {
                INT: parseInt(game.settings.get("Border-Control", "controlledColor").substr(1),16),
                EX : parseInt(game.settings.get("Border-Control", "controlledColorEx").substr(1),16),
            },
            FRIENDLY: {
                INT: parseInt(game.settings.get("Border-Control", "friendlyColor").substr(1),16),
                EX: parseInt(game.settings.get("Border-Control", "friendlyColorEx").substr(1),16),
            },
            NEUTRAL: {
                INT: parseInt(game.settings.get("Border-Control", "neutralColor").substr(1),16),
                EXT: parseInt(game.settings.get("Border-Control", "neutralColorEx").substr(1),16),
            },
            HOSTILE: {
                INT: parseInt(game.settings.get("Border-Control", "hostileColor").substr(1),16),
                EX: parseInt(game.settings.get("Border-Control", "hostileColorEx").substr(1),16),
            },
            PARTY: {
                INT: parseInt(game.settings.get("Border-Control", "partyColor").substr(1),16),
                EXT: parseInt(game.settings.get("Border-Control", "partyColorEx").substr(1),16),
            },
        }
        if (this._controlled) return overrides.CONTROLLED;
        else if (this._hover) {
            let d = parseInt(this.data.disposition);
            if (!game.user.isGM && this.owner) return overrides.CONTROLLED;
            else if (this.actor?.hasPlayerOwner) return overrides.PARTY;
            else if (d === CONST.TOKEN_DISPLAY_MODES.FRIENDLY) return overrides.FRIENDLY;
            else if (d === CONST.TOKEN_DISPLAY_MODES.NEUTRAL) return overrides.NEUTRAL;
            else return overrides.HOSTILE;
        }
        else return null;
    }
}