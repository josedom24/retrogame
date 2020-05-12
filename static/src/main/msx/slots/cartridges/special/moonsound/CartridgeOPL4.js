// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// OPL4 Music Cartridge with 2M ROM + 2M SRAM
// Controls a YMF278B sound chip
// ROM and RAM here will be accessed by the OPL4 directly, not mapped to MSX memory space

wmsx.CartridgeOPL4 = function(rom) {
"use strict";

    function init(self) {
        self.rom = rom;
        bytes = wmsx.Util.asNormalArray(rom.content, 0, 0x400000);
        wmsx.Util.arrayFill(bytes, 0, 0x200000);
        self.bytes = bytes;
    }

    this.connect = function(machine) {
        opl4.connect(machine);
    };

    this.disconnect = function(machine) {
        opl4.disconnect(machine);
    };

    this.powerOn = function() {
        opl4.powerOn();
        this.reset();
    };

    this.powerOff = function() {
        opl4.powerOff();
    };

    this.reset = function() {
        opl4.reset();
    };

    this.opl4ReadMemory = function(address) {
        return bytes[address & 0x3fffff];
    };

    this.opl4WriteMemory = function(address, val) {
        if ((address & 0x3fffff) < 0x200000) return;    // ROM

        bytes[address & 0x3fffff] = val;                // RAM
    };


    var bytes;
    this.bytes = null;

    this.rom = null;
    this.format = wmsx.SlotFormats.OPL4;

    var opl4 = new wmsx.OPL4Audio("OPL4", this);
    this.opl4 = opl4;


    // Savestate  -------------------------------------------

    this.saveState = function() {
        var light = this.lightState();
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: light ? null : wmsx.Util.compressInt8BitArrayToStringBase64(bytes),                          // ROM + RAM
            ra: !light ? null : wmsx.Util.compressInt8BitArrayToStringBase64(bytes, 0x200000, 0x200000),    // only RAM
            opl4: opl4.saveState()
        };
    };

    this.loadState = function(s) {
        this.rom = wmsx.ROM.loadState(s.r);
        if (s.b)
            bytes = wmsx.Util.uncompressStringBase64ToInt8BitArray(s.b, bytes);                           // ROM + RAM
        else {
            this.rom.reloadEmbeddedContent();
            if (!bytes) bytes = new Array(0x400000);
            bytes = wmsx.Util.uncompressStringBase64ToInt8BitArray(s.ra, bytes, true, null, 0x200000);    // RAM
            wmsx.Util.arrayCopy(this.rom.content, 0, bytes);                                              // ROM
        }
        this.bytes = bytes;
        opl4.loadState(s.opl4);

        //console.log("OPL4 LoadState length:", JSON.stringify(s).length);
    };


    if (rom) init(this);

};

wmsx.CartridgeOPL4.prototype = wmsx.Slot.base;

wmsx.CartridgeOPL4.recreateFromSaveState = function(state, previousSlot) {
    var cart = previousSlot || new wmsx.CartridgeOPL4();
    cart.loadState(state);
    return cart;
};
