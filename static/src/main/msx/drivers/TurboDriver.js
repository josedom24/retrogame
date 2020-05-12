// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Turbo Control Driver
// Implements BIOS routines CHGCPU/GETCPU using the CPU extension protocol and the Panasonic MSX2+ Switched I/O Port for 1.5x CPU Turbo

wmsx.TurboDriver = function(bios) {
"use strict";

    var self = this;

    this.connect = function(pMachine) {
        machine = pMachine;
        ledsSocket = machine.getLedsSocket();
        var mt = machine.getMachineTypeSocket().getMachineType();
        fakeTRTurbo = mt < M_TYPES.MSXTR && (WMSX.CPU_FAKE_TR_TURBO === 1 || (WMSX.CPU_FAKE_TR_TURBO === -1 && mt === M_TYPES.MSX2P));       // Auto ON for >= MSX2P, never for turbo R
        panaTurbo =   mt < M_TYPES.MSXTR && (WMSX.CPU_PANA_TURBO === 1 || (WMSX.CPU_PANA_TURBO === -1 && mt === M_TYPES.MSX2P));             // Auto ON for >= MSX2P, never for turbo R
        updateSoftTurboDevices();
        this.turboModesUpdate();
    };

    this.disconnect = function(pBios, machine) {
        machine.bus.disconnectSwitchedDevice(0x08, this);
    };

    this.powerOff = function() {
        chgCpuValue = 0;
        softTurboON = false;
        this.turboModesUpdate();
    };

    this.reset = function() {
        if ((fakeTRTurbo || panaTurbo) && WMSX.CPU_SOFT_TURBO_AUTO_ON) {
            chgCpuValue = 0x82;
            softTurboON = true;
        } else {
            chgCpuValue = 0;
            softTurboON = false;
        }
        this.turboModesUpdate();
    };

    this.turboModesUpdate = function() {
        var softTurbo = fakeTRTurbo || panaTurbo;
        var z80Mode = machine.getZ80ClockMode();
        var r800Mode = machine.getR800ClockMode();
        var vdpMode = machine.getVDPClockMode();

        var z80Multi = z80Mode === 0 && softTurbo && softTurboON ? WMSX.Z80_SOFT_TURBO_MULTI : z80Mode > 0 ? z80Mode : 1;
        machine.cpu.setZ80ClockMulti(z80Multi);
        machine.cpu.setR800ClockMulti(r800Mode);
        machine.vdp.setVDPTurboMulti(vdpMode === 0 && softTurbo && softTurboON ? WMSX.VDP_SOFT_TURBO_MULTI : vdpMode > 0 ? vdpMode : 1);

        var r800Multi = machine.cpu.getR800ClockMulti();
        ledsSocket.ledStateChanged(3, z80Multi !== 1 ? 1 : 0);
        ledsSocket.ledInfoChanged(3, z80Multi !== 1 ? "" + z80Multi + "x" : "");
        ledsSocket.ledInfoChanged(4, r800Multi !== 1 ? "" + r800Multi + "x" : "");

        // console.error("TurboDriver modes update. z80Multi:", z80Multi);
    };

    this.cpuExtensionBegin = function(s) {
        if (machine.machineType <= 1) return;           // Only for >= MSX2. Defensive
        switch (s.extNum) {
            case 0xee:
                return CHGCPU(s.A);
            case 0xef:
                return GETCPU();
        }
    };

    this.cpuExtensionFinish = function(s) {
        // No Finish operation
    };

    function updateSoftTurboDevices() {
        if (fakeTRTurbo) {
            var bytes = bios.bytes;

            // CHGCPU routine JUMP
            bytes[0x0180] = 0xc3;
            bytes[0x0181] = 0x8d;
            bytes[0x0182] = 0x01;

            // GETCPU routine JUMP
            bytes[0x0183] = 0xc3;
            bytes[0x0184] = 0x90;
            bytes[0x0185] = 0x01;

            // CHGCPU routine (EXT e)
            bytes[0x018d] = 0xed;
            bytes[0x018e] = 0xee;
            bytes[0x018f] = 0xc9;

            // GETCPU routine (EXT f)
            bytes[0x0190] = 0xed;
            bytes[0x0191] = 0xef;
            bytes[0x0192] = 0xc9;
        }

        if (panaTurbo) machine.bus.connectSwitchedDevice(0x08, this);
        else machine.bus.disconnectSwitchedDevice(0x08, this);

        // console.error("TurboDriver devices updated:", fakeTRTurbo, panaTurbo);
    }

    function CHGCPU(A) {
        // console.log("CHGCPU: " + A.toString(16));

        chgCpuValue = A & 0x83;
        var newSoftON = (chgCpuValue & 0x03) > 0;
        if (softTurboON === newSoftON) return;

        softTurboON = newSoftON;

        if (machine.getZ80ClockMode() === 0) {
            self.turboModesUpdate();
            machine.showZ80ClockModeMessage();
        } else
            machine.showOSD("Could not set Z80 Turbo by software: mode is FORCED " + machine.getZ80ClockModeDesc(), true, true);
    }

    function GETCPU() {
        var res = chgCpuValue & 0x03;

        // console.log("GETCPU : " + res.toString(16));

        return { A: res };
    }

    this.switchedPortInput = function (port) {
        if (port !== 0x41) return 0xff;     // Only Panasonic MSX2+ Turbo port

        var res = softTurboON ? 0x00 : 0x01;

        // console.log("PANA Turbo read: " + res.toString(16));

        return res;
    };

    this.switchedPortOutput = function (val, port) {
        if (port !== 0x41) return;          // Only Panasonic MSX2+ Turbo port

        // console.log("PANA Turbo write: " + val.toString(16));

        CHGCPU((val & 0x01) === 0 ? 0x81 : 0x00);
    };


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            tt: fakeTRTurbo, pt: panaTurbo,
            st: softTurboON, cv: chgCpuValue
        };
    };

    this.loadState = function(s) {
        softTurboON = s && s.st ? s.st : false;                                 // Backward compatibility: On for MSX2+
        chgCpuValue = s && s.cv ? s.cv : 0;                                     // Backward compatibility: On for MSX2+

        var mt = machine && machine.getMachineTypeSocket().getMachineType();
        var softTurbo = mt === M_TYPES.MSX2P;                                   // Backward compatibility: On for MSX2+
        fakeTRTurbo = s && s.tt !== undefined ? s.tt : softTurbo;
        panaTurbo = s && s.pt !== undefined ? s.pt : softTurbo;

        if (machine) updateSoftTurboDevices();                                  // Already connected?
    };


    var ledsSocket;
    var machine;

    var fakeTRTurbo = false;
    var panaTurbo = false;

    var chgCpuValue = 0;
    var softTurboON = false;


    var M_TYPES = wmsx.Machine.MACHINE_TYPE;

};