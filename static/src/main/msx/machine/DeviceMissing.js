// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

wmsx.DeviceMissing = {

    inputPort: function (port) {
        // if (!wmsx.DeviceMissing.IGNORED_PORTS.has(port & 255))
        //    wmsx.Util.log("Missing IN " + (port & 255).toString(16));
        return 0xff;
    },

    outputPort: function (val, port) {
        // if (!wmsx.DeviceMissing.IGNORED_PORTS.has(port & 255))
        //    wmsx.Util.log("Missing OUT " + (port & 255).toString(16) + ", " + val.toString(16));
    },

    inputPortIgnored: function (port) {
        return 0xff;
    },

    outputPortIgnored: function (val, port) {
    },

    IGNORED_PORTS: new Set([

        //0x10, 0x11, 0x12,                 // Second PSG

        // 0x60, 0x61, 0x62, 0x63,          // V9990
        // 0x64, 0x65, 0x66, 0x67,
        // 0x68, 0x69, 0x6a, 0x6b,
        // 0x6c, 0x6d, 0x6e, 0x6f,

        // 0x7c, 0x7d,                      // MSX-MUSIC
        // 0x7e, 0x7f,                      // OPL4 Wave

        0x80, 0x81, 0x82, 0x83,             // RS-232
        0x84, 0x85, 0x86, 0x87,

        0x90, 0x91, 0x93,                   // Printer

        0xa4, 0xa5,                         // tR Internal PCM

        0xb8, 0xb9, 0xba, 0xbb,             // Card Reader?

        0xc0, 0xc1, 0xc2, 0xc3,             // MSX-AUDIO
        // 0xc4, 0xc5, 0xc6, 0xc7,          // OPL4 FM

        0xc8, 0xc9, 0xca, 0xcb,             // MSX-INTERFACE
        0xcc, 0xcd, 0xce, 0xcf,

        // 0xd8, 0xd9, 0xda, 0xdb,          // Kanji 16x16 Font ROM (JIS 1/2)
        0xdc, 0xdd,                         // Kanji 12x12 Font ROM (not supported, but that's OK)

        0xe8, 0xe9, 0xea, 0xeb,             // Internal MSX-MIDI
        0xec, 0xed, 0xee, 0xef

    ]),

    setDebugMode: function(mode) {
        // Nothing here
    }

};