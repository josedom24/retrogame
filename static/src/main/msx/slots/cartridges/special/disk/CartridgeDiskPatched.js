// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// Patched Disk ROM content >= 16K & <= 64K, starting at 0x0000 or 0x4000. Can be bundled with other BIOS/ROMs
// Disk ROM will be patched at 0x4000, depending on DISK_ROM_START parameter
// Multiple format, used for all Disk ROM manufacturers. Accesses and commands the Disk Drive
// 0x0000 - ????, 0x4000 - ????

wmsx.CartridgeDiskPatched = function(rom) {
"use strict";

    function init(self) {
        self.rom = rom;
        bytes = new Array(rom.content.length);
        wmsx.Util.arrayCopy(rom.content, 0, bytes);
        self.bytes = bytes;
        baseAddress = rom.content.length === 0x4000 ? 0x4000 : (WMSX.DISK_ROM_START_PAGE || 0) * 0x4000;
        topAddress = baseAddress + bytes.length;
        patchDiskBIOS();
    }

    this.connect = function(machine) {
        driver.connect(this, machine);
        machine.getDiskDriveSocket().diskInterfaceConnected(this);
    };

    this.disconnect = function(machine) {
        driver.disconnect(this, machine);
        machine.getDiskDriveSocket().diskInterfaceDisconnected(this);
    };

    this.powerOff = function() {
        driver.powerOff();
    };

    this.read = function(address) {
        if (address >= baseAddress && address < topAddress)
            return bytes[address - baseAddress];
        return 0xff;
    };

    this.cpuExtensionBegin = function(s) {
        // Receive all CPU Extensions and pass to the Disk Driver
        return driver.cpuExtensionBegin(s);
    };

    this.cpuExtensionFinish = function(s) {
        // Receive all CPU Extensions and pass to the Disk Driver
        return driver.cpuExtensionFinish(s);
    };

    function patchDiskBIOS() {
        driver.patchDiskBIOS(bytes, 0 - baseAddress, 0x4000, 0x576f, 0x5850, 0x7893);
    }


    var bytes;
    this.bytes = null;

    var baseAddress, topAddress;

    this.rom = null;
    this.format = wmsx.SlotFormats.DiskPatch;

    var driver = new wmsx.ImageDiskDriver(false);       // DOS1


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: this.lightState() ? null : wmsx.Util.compressInt8BitArrayToStringBase64(bytes),
            d: driver.saveState(),
            ba: baseAddress
        };
    };

    this.loadState = function(s) {
        this.rom = wmsx.ROM.loadState(s.r);
        baseAddress = s.ba !== undefined ? s.ba : 0x4000;       // backward compatibility
        if (s.b) {
            bytes = wmsx.Util.uncompressStringBase64ToInt8BitArray(s.b, bytes);
            // backward compatibility for old states: trunc to multiple of 16KB pages, thus removing extra CHOICE bytes of old impl and fix CPU Extension numbers
            bytes.length = bytes.length & ~0x3fff;
            driver.rePatchDiskBIOSOldStateForExtensions(bytes, 0 - baseAddress, 0x4000, 0x576f, 0x5850);
        } else {
            this.rom.reloadEmbeddedContent();
            var len = this.rom.content.length;
            if (!bytes || bytes.length !== len) bytes = new Array(len);
            wmsx.Util.arrayCopy(this.rom.content, 0, bytes);
            patchDiskBIOS();
        }
        this.bytes = bytes;
        topAddress = baseAddress + bytes.length;
        driver.loadState(s.d);
    };


    if (rom) init(this);

};

wmsx.CartridgeDiskPatched.prototype = wmsx.Slot.base;

wmsx.CartridgeDiskPatched.recreateFromSaveState = function(state, previousSlot) {
    var cart = previousSlot || new wmsx.CartridgeDiskPatched(null);
    cart.loadState(state);
    return cart;
};
