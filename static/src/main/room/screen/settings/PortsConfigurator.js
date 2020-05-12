// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file./**

wmsx.PortsConfigurator = function(controllersHub, peripheralControls, returnFocusElement) {
"use strict";

    var self = this;

    function init() {
        setup();
    }

    this.controllersSettingsStateUpdate = function() {
        this.refresh();
    };

    this.refresh = function() {
        var state = controllersHub.getSettingsState();
        joysticksModeElement.wmsxText.textContent = state.joysticksModeDesc;
        joykeysModeElement.wmsxText.textContent = state.joykeysModeDesc;
        mouseModeElement.wmsxText.textContent = state.mouseModeDesc;
        turboFireSpeedElement.wmsxText.textContent = state.turboFireSpeedDesc;

        for (var p = 0; p < 2; ++p) {
            var device = state.ports[p];
            var classList = deviceElements[p].classList;
            classList.remove.apply(classList, DEVICE_CLASSES);
            if (device.startsWith(wmsx.ControllersHub.MOUSE))
                classList.add("wmsx-mouse-device");
            else if (device.startsWith(wmsx.ControllersHub.JOY_ANY))
                classList.add(device.startsWith(wmsx.ControllersHub.JOYSTICK) ? "wmsx-joystick-device" : "wmsx-joykeys-device");
            else if (device.startsWith(wmsx.ControllersHub.TOUCH))
                classList.add("wmsx-touch-device");
            else
                classList.add("wmsx-none-device");
            deviceTitleElements[p].innerHTML = device;
        }

        for (var i = 0; i < buttonElements.length; ++i) {
            var but = buttonElements[i];
            var mapping = this.getMappingForControl(but.wmsxButton, but.wmsxPort);
            var unmapped = !mapping
                || (mapping.constructor === Array && mapping.length === 0)
                || (mapping.constructor === Object && (mapping.from.length === 0 || mapping.to.length === 0));       // Virtual button
            if (unmapped) but.classList.add("wmsx-joy-hs-unmapped");
            else but.classList.remove("wmsx-joy-hs-unmapped");
        }
    };

    this.getMappingForControl = function(button, port) {
        return controllersHub.getMappingForControl(button, port);
    };

    this.customizeControl = function(button, port, mapping) {
        controllersHub.customizeControl(button, port, mapping);
        this.refresh();
    };

    this.clearControlEditing = function() {
        if (!joyButtonEditing) return;
        controllersHub.clearControl(joyButtonEditing, portEditing);
        self.refresh();
        updatePopup();
    };

    function setup() {
        // Set mode fields
        joysticksModeElement = document.getElementById("wmsx-ports-joysticks-mode");
        joysticksModeElement.wmsxControl = wmsx.PeripheralControls.JOYSTICKS_TOGGLE_MODE;
        joysticksModeElement.wmsxText = joysticksModeElement.querySelector(":scope > span");
        joysticksModeElement.querySelector(":scope > button").wmsxDec = true;
        joykeysModeElement = document.getElementById("wmsx-ports-joykeys-mode");
        joykeysModeElement.wmsxControl = wmsx.PeripheralControls.JOYKEYS_TOGGLE_MODE;
        joykeysModeElement.wmsxText = joykeysModeElement.querySelector(":scope > span");
        joykeysModeElement.querySelector(":scope > button").wmsxDec = true;
        mouseModeElement = document.getElementById("wmsx-ports-mouse-mode");
        mouseModeElement.wmsxControl = wmsx.PeripheralControls.MOUSE_TOGGLE_MODE;
        mouseModeElement.wmsxText = mouseModeElement.querySelector(":scope > span");
        mouseModeElement.querySelector(":scope > button").wmsxDec = true;
        turboFireSpeedElement = document.getElementById("wmsx-ports-turbofire-speed");
        turboFireSpeedElement.wmsxControl = wmsx.PeripheralControls.TURBO_FIRE_TOGGLE;
        turboFireSpeedElement.wmsxText = turboFireSpeedElement.querySelector(":scope > span");
        turboFireSpeedElement.querySelector(":scope > button").wmsxDec = true;

        // Mode events
        function controlClicked(e) {
            if (e.target.tagName === "BUTTON") peripheralControls.processControlActivated(e.currentTarget.wmsxControl, false, e.target.wmsxDec);
        }
        wmsx.Util.onTapOrMouseDownWithBlock(joysticksModeElement, controlClicked);
        wmsx.Util.onTapOrMouseDownWithBlock(joykeysModeElement, controlClicked);
        wmsx.Util.onTapOrMouseDownWithBlock(mouseModeElement, controlClicked);
        wmsx.Util.onTapOrMouseDownWithBlock(turboFireSpeedElement, controlClicked);

        // Set device and buttons elements
        for (var p = 1; p <= 2; ++p) {
            var hubPort = p - 1;
            deviceElements[hubPort] = document.getElementById("wmsx-ports-device" + p);
            deviceTitleElements[hubPort] = document.getElementById("wmsx-ports-device" + p + "-title");
            for (var b in wmsx.JoystickButtons) {
                var buttonElement = document.getElementById("wmsx-joy" + p + "-" + wmsx.JoystickButtons[b].n);
                if (!buttonElement) continue;
                buttonElement.wmsxButton = b;
                buttonElement.wmsxPort = hubPort;
                setupButtonMouseEvents(buttonElement);
                buttonElements.push(buttonElement);
            }
            deviceElements[hubPort].addEventListener("mousedown", mouseDown);
            var mouseElement = document.getElementById("wmsx-mouse" + p);
            mouseElement.wmsxButton = "MOUSE";
            mouseElement.wmsxPort = hubPort;
            setupButtonMouseEvents(mouseElement);
        }
    }

    function setupButtonMouseEvents(buttonElement) {
        buttonElement.addEventListener("mouseenter", mouseEnterButton);
        buttonElement.addEventListener("mouseleave", mouseLeaveButton);
    }

    function mouseEnterButton(e) {
        if (e.target.wmsxButton) {
            buttonElementEditing = e.target;
            joyButtonEditing = buttonElementEditing.wmsxButton;
            portEditing = buttonElementEditing.wmsxPort;
            updatePopup()
        } else
            mouseLeaveButton();
    }

    function mouseLeaveButton() {
        buttonElementEditing = joyButtonEditing = portEditing = null;
        updatePopup();
    }

    function mouseDown(e) {
        if (joyButtonEditing && e.which === 3) controllersHub.clearControl(joyButtonEditing, portEditing);
        self.refresh();
        updatePopup();
    }

    function updatePopup() {
        if (!joyButtonEditing) {
            popup.hide();
            controllersHub.mappingPopupVisibility(popup, portEditing, false);
            returnFocusElement.focus();
            return;
        }

        // Position
        var keyRec = buttonElementEditing.getBoundingClientRect();
        var x = keyRec.left + keyRec.width / 2;
        var y = keyRec.top;

        var text = controllersHub.getMappingPopupText(joyButtonEditing, portEditing);
        popup.show(self, joyButtonEditing, portEditing, x, y, text.heading, text.footer);
        controllersHub.mappingPopupVisibility(popup, portEditing, true);
    }



    var mouseModeElement, joysticksModeElement, joykeysModeElement, turboFireSpeedElement;
    var deviceElements = [], deviceTitleElements = [], buttonElements = [];

    var buttonElementEditing = null, joyButtonEditing = null, portEditing = null;

    var popup = wmsx.ControlMappingPopup.get();

    var DEVICE_CLASSES = [ "wmsx-none-device", "wmsx-mouse-device", "wmsx-joystick-device", "wmsx-joykeys-device", "wmsx-touch-device"];


    init();

};
