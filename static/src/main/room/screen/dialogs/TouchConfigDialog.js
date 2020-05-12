// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

wmsx.TouchConfigDialog = function(fsElement, mainElement, controllersHub, peripheralControls) {
    "use strict";

    var self = this;

    this.show = function () {
        if (!dialog) {
            create();
            return setTimeout(self.show, 0);
        }

        visible = true;
        fsElement.classList.add("wmsx-touch-config-active");
        dialog.focus();
        editing = editingSequence = null; editingSeqIndex = -1;
        touchControls.startTouchDetection(self);
        refresh();
        refreshOptions();

        wmsx.Util.scaleToFitParentHeight(dialog, mainElement, 0);
    };

    this.hide = function() {
        if (!visible) return;
        touchControls.stopTouchDetection(self);
        WMSX.userPreferences.save();
        fsElement.classList.remove("wmsx-touch-config-active");
        visible = false;
        WMSX.room.screen.focus();
    };

    this.touchControlDetected = function(control, e) {
        controllersHub.hapticFeedbackOnTouch(e);

        editing = control;
        var isDirectional = editing === "T_DIR";
        editingSequence = isDirectional ? dirSequence : buttonSequence;
        var mapping = isDirectional ? prefs.directional : prefs.buttons[editing];
        var curMapping = isDirectional ? mapping : mapping && (mapping.button || mapping.key);
        editingSeqIndex = wmsx.Util.arrayFindIndex(editingSequence, function (x) {
            return x === curMapping
        });

        refresh();
    };

    this.controllersSettingsStateUpdate = function() {
        if (visible) refreshOptions();
    };

    function refresh() {
        if (editing === "T_DIR") {
            directional.classList.add("wmsx-show");
            button.classList.remove("wmsx-show");
            wmsx.DOMTouchControls.styleDirectionalMapping(directional, prefs.directional);
        } else {
            button.classList.add("wmsx-show");
            directional.classList.remove("wmsx-show");
            wmsx.DOMTouchControls.styleButtonMapping(button, prefs.buttons[editing]);
        }
        minus.classList.toggle("wmsx-disabled", editingSeqIndex <= 0);
        plus.classList.toggle("wmsx-disabled", !editingSequence || editingSeqIndex >= editingSequence.length - 1);
    }

    function refreshOptions() {
        var state = controllersHub.getSettingsState();
        var port = state.touchPortSet;
        var active = state.touchActive;
        optionsItems[0].wmsxText.innerText = port === 0 ? "Port 1" : port === 1 ? "Port 2" : "OFF";
        optionsItems[0].classList.toggle("wmsx-selected", port >= 0);
        optionsItems[0].classList.toggle("wmsx-inactive", !active);

        for (var i = 1; i < options.length; ++i) {
            var option = options[i];
            var report = peripheralControls.getControlReport(option.control);
            option.value = report.label;
            option.selected = report.active;
            optionsItems[i].wmsxText.innerText = option.value;
            optionsItems[i].classList.toggle("wmsx-selected", !!option.selected);
        }
    }

    function create() {
        dialog = document.createElement("div");
        dialog.id = "wmsx-touch-config";
        dialog.tabIndex = -1;

        minus = document.createElement("div");
        minus.id = "wmsx-touch-config-minus";
        dialog.appendChild(minus);

        plus = document.createElement("div");
        plus.id = "wmsx-touch-config-plus";
        dialog.appendChild(plus);

        directional = wmsx.DOMTouchControls.createDirectional("wmsx-touch-config-dir");
        dialog.appendChild(directional);

        button = wmsx.DOMTouchControls.createButton("wmsx-touch-config-button");
        dialog.appendChild(button);

        // Options and modes
        options = [
            { label: "Touch Controller",                  control: wmsx.PeripheralControls.TOUCH_TOGGLE_MODE },
            { label: "Turbo Fire",                        control: wmsx.PeripheralControls.TURBO_FIRE_TOGGLE },
            { label: "&#128190;&nbsp; Big Directional",   control: wmsx.PeripheralControls.TOUCH_TOGGLE_DIR_BIG },
            { label: "&#128190;&nbsp; Right Directional", control: wmsx.PeripheralControls.TOUCH_TOGGLE_MIRRORED },
            { label: "&#128190;&nbsp; Haptic Feedback",   control: wmsx.PeripheralControls.HAPTIC_FEEDBACK_TOGGLE_MODE }
        ];

        // Define list
        var list = document.createElement('ul');
        list.classList.add("wmsx-quick-options-list");

        for (var i = 0; i < options.length; ++i) {
            var li = document.createElement("li");
            var label = document.createElement("div");
            label.innerHTML = options[i].label;
            li.appendChild(label);
            var control = document.createElement("div");
            control.classList.add("wmsx-control");
            var b = document.createElement("button");
            b.wmsxControlItem = options[i];
            b.wmsxDec = true;
            b.classList.add("wmsx-control-dec");
            control.appendChild(b);
            var text = document.createElement("span");
            control.wmsxText = text;
            control.appendChild(text);
            b = document.createElement("button");
            b.wmsxControlItem = options[i];
            b.classList.add("wmsx-control-inc");
            control.appendChild(b);
            li.appendChild(control);
            list.appendChild(li);
            optionsItems.push(control);
        }
        dialog.appendChild(list);

        setupEvents();

        mainElement.appendChild(dialog);

        dirSequence = [ "JOYSTICK", "KEYBOARD"];

        buttonSequence = [ null ];
        buttonSequence.push(wmsx.JoystickButtons.J_A.button);
        buttonSequence.push(wmsx.JoystickButtons.J_B.button);
        buttonSequence.push(wmsx.JoystickButtons.J_AB.button);
        for (var k in wmsx.KeyboardKeys) buttonSequence.push(k);
    }

    function modifyControl(inc, e) {
        if (!editing) return;
        editingSeqIndex += inc;
        if (editingSeqIndex < 0) return editingSeqIndex = 0;
        else if (editingSeqIndex >= editingSequence.length) return editingSeqIndex = editingSequence.length - 1;

        controllersHub.hapticFeedbackOnTouch(e);
        var newMapping = editingSequence[editingSeqIndex];
        if (!(editing === "T_DIR")) newMapping = newMapping && (wmsx.JoystickButtons[newMapping] || wmsx.KeyboardKeys[newMapping]);
        touchControls.customizeControl(editing, newMapping);
        refresh();
    }

    function setupEvents() {
        // Do not close with taps or clicks inside, select options buttons
        wmsx.Util.onTapOrMouseDownWithBlock(dialog, function(e) {
            if (e.target.wmsxControlItem) {
                peripheralControls.processControlActivated(e.target.wmsxControlItem.control, true, e.target.wmsxDec);     // true = skip auto in TouchControls mode
                controllersHub.hapticFeedbackOnTouch(e);
                refreshOptions();
            } else
                dialog.focus();
        });

        // Trap keys, respond to some
        dialog.addEventListener("keydown", function(e) {
            var keyCode = domKeys.codeNewForKeyboardEvent(e);
            // Exit
            if (EXIT_KEYS.indexOf(keyCode) >= 0) self.hide();
            // Select
            else if (SELECT_KEYS[keyCode]) modifyControl(SELECT_KEYS[keyCode], e);
            return wmsx.Util.blockEvent(e);
        });

        // Clicking or tapping arrow buttons modify control
        wmsx.Util.addEventsListener(minus, "touchstart mousedown", function(e) { modifyButtonPressed(e, -1); });
        wmsx.Util.addEventsListener(plus,  "touchstart mousedown", function(e) { modifyButtonPressed(e, +1); });
        wmsx.Util.addEventsListener(minus, "touchend mouseup", modifyButtonReleased);
        wmsx.Util.addEventsListener(plus,  "touchend mouseup", modifyButtonReleased);
    }

    function modifyButtonPressed(e, inc) {
        modifyButtonReleased(e);
        modifyControl(inc, e);
        modifyKeyTimeout = setTimeout(function repeat() {
            modifyKeyInterval = setInterval(function () {
                modifyControl(inc, e);
            }, 35);
        }, 415);
    }

    function modifyButtonReleased(e) {
        wmsx.Util.blockEvent(e);
        if (modifyKeyTimeout) { clearTimeout(modifyKeyTimeout); modifyKeyTimeout = null }
        if (modifyKeyInterval) { clearInterval(modifyKeyInterval); modifyKeyInterval = null }
    }


    var visible = false;
    var dialog, directional, button, minus, plus;
    var options, optionsItems = [];

    var editing, editingSequence, editingSeqIndex;
    var modifyKeyTimeout, modifyKeyInterval;
    var dirSequence, buttonSequence;

    var prefs = WMSX.userPreferences.current.touch;
    var touchControls = controllersHub.getTouchControls();

    var domKeys = wmsx.DOMKeys;

    var EXIT_KEYS = [ domKeys.VK_ESCAPE.wc, domKeys.VK_ENTER.wc, domKeys.VK_SPACE.wc ];
    var SELECT_KEYS = {};
    SELECT_KEYS[domKeys.VK_LEFT.wc] = -1;
    SELECT_KEYS[domKeys.VK_RIGHT.wc] = 1;

};
