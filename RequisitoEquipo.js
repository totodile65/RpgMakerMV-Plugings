/*:
 * @plugindesc Este pluging te permite poner requisitos a las armas, armaduras, si quiers darme creditos eres libre de hacerlo
 * @author totodile65
 *
 * @param Mensaje Error
 * @desc El mensaje que sale. Usa %1 para el objeto y %2 para el atributo.
 * @default No puedes equipar %1, te falta %2.
 *
 * @param Nombre Ataque
 * @desc Cómo quieres que se llame el atributo Ataque en el mensaje.
 * @default Ataque
 *
 * @param Nombre Defensa
 * @desc Cómo quieres que se llame el atributo Defensa en el mensaje.
 * @default Defensa
 *
 * @param Nombre Atk Magico
 * @desc Cómo quieres que se llame el atributo Mágico en el mensaje.
 * @default Atk Magico
 *
 * @param Nombre Def Magico
 * @desc Cómo quieres que se llame la Defensa Mágica en el mensaje.
 * @default Def Magico
 *
 * @param Nombre Agilidad
 * @desc Cómo quieres que se llame la Agilidad en el mensaje.
 * @default Agilidad
 *
 * @param Nombre Suerte
 * @desc Cómo quieres que se llame la Suerte en el mensaje.
 * @default Suerte
 *
 * @param Nombre Nivel
 * @desc Cómo quieres que se llame el Nivel en el mensaje.
 * @default Nivel
 *
 * @help 
 * Usa estas etiquetas en las Notas de Armas/Armaduras:
 * <reqAtk:50>, <reqDef:30>, <reqMat:20>, <reqMdf:20>, 
 * <reqAgi:15>, <reqLuk:10>, <reqLevel:5>
 */


(function() {
    var params = PluginManager.parameters('RequisitosEquipo');
    var reqText = String(params['Texto Requisito'] || "REQUISITO: ");
    var cOk = String(params['Color Cumplido'] || "3");
    var cNo = String(params['Color Faltante'] || "2");
    
    var statNames = {
        atk: String(params['Nombre Ataque'] || "Fuerza"),
        def: String(params['Nombre Defensa'] || "Defensa"),
        mat: String(params['Nombre Magia'] || "Magia"),
        mdf: String(params['Nombre Def Magica'] || "Espíritu"),
        agi: String(params['Nombre Agilidad'] || "Agilidad"),
        luk: String(params['Nombre Suerte'] || "Suerte"),
        level: String(params['Nombre Nivel'] || "Nivel")
    };

    // --- FUNCIÓN MAESTRA DE COMPROBACIÓN ---
    Game_Actor.prototype.getMissingStat = function(item) {
        if (!item || !item.meta) return null;
        if (item.meta.reqAtk && this.atk < Number(item.meta.reqAtk)) return statNames.atk;
        if (item.meta.reqDef && this.def < Number(item.meta.reqDef)) return statNames.def;
        if (item.meta.reqMat && this.mat < Number(item.meta.reqMat)) return statNames.mat;
        if (item.meta.reqMdf && this.mdf < Number(item.meta.reqMdf)) return statNames.mdf;
        if (item.meta.reqAgi && this.agi < Number(item.meta.reqAgi)) return statNames.agi;
        if (item.meta.reqLuk && this.luk < Number(item.meta.reqLuk)) return statNames.luk;
        if (item.meta.reqLevel && this.level < Number(item.meta.reqLevel)) return statNames.level;
        return null;
    };

    var _Window_EquipItem_isEnabled = Window_EquipItem.prototype.isEnabled;
    Window_EquipItem.prototype.isEnabled = function(item) {
        if (this._actor && item && this._actor.getMissingStat(item)) return false;
        return _Window_EquipItem_isEnabled.call(this, item);
    };

    var _Scene_Equip_onItemOk = Scene_Equip.prototype.onItemOk;
    Scene_Equip.prototype.onItemOk = function() {
        var item = this._itemWindow.item();
        var actor = this.actor();
        if (item && actor && actor.getMissingStat(item)) {
            SoundManager.playBuzzer();
            this._itemWindow.activate();
            return;
        }
        _Scene_Equip_onItemOk.call(this);
    };
    var _Window_Help_setItem = Window_Help.prototype.setItem;
    Window_Help.prototype.setItem = function(item) {
        var scene = SceneManager._scene;
        var actor = (scene instanceof Scene_Equip) ? scene.actor() : null;

        if (item && (item.wtypeId || item.atypeId) && actor) {
            var reqs = [];
            var stats = [
                { id: 'reqAtk', val: actor.atk, name: statNames.atk },
                { id: 'reqDef', val: actor.def, name: statNames.def },
                { id: 'reqMat', val: actor.mat, name: statNames.mat },
                { id: 'reqMdf', val: actor.mdf, name: statNames.mdf },
                { id: 'reqAgi', val: actor.agi, name: statNames.agi },
                { id: 'reqLuk', val: actor.luk, name: statNames.luk },
                { id: 'reqLevel', val: actor.level, name: statNames.level }
            ];

            stats.forEach(function(st) {
                if (item.meta[st.id]) {
                    var reqVal = Number(item.meta[st.id]);
                    var color = (st.val >= reqVal) ? cOk : cNo;
                    reqs.push("\\C[" + color + "]" + st.name + " " + reqVal + "\\C[0]");
                }
            });

            if (reqs.length > 0) {
                var newItem = JSON.parse(JSON.stringify(item));
                newItem.description = item.description + "\n" + reqText + reqs.join(", ");
                _Window_Help_setItem.call(this, newItem);
                return;
            }
        }
        _Window_Help_setItem.call(this, item);
    };

})();
