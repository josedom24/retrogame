// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

wmsx.EmbeddedFiles = {

    get: function(fileName) {
        // Special concatenation divider in fileName?
        if (fileName.indexOf("|") < 0) return this.getFile(fileName);   // No, get single file

        // Yes, concatenate several files
        var fileNames = fileName.split(/\s*\|\s*/);
        var allContents = new Array(fileNames.length);
        for (var i = 0; i < fileNames.length; ++i) {
            var file = this.getFile(fileNames[i]);
            if (file === undefined) return undefined;
            allContents[i] = file.content;
        }
        return { name: fileName, content: wmsx.Util.arraysConcatAll(allContents) };
    },

    getFile: function(fileName) {
        //wmsx.Util.log("Getting Embedded file: " + fileName);
        fileName = fileName.substr(1);

        var comp = this.compressedContent[fileName];
        if (comp !== undefined) return { name: fileName, content: wmsx.Util.uncompressStringBase64ToInt8BitArray(comp) };

        var diff = this.diffsContent[fileName];
        if (diff === undefined) return undefined;

        var base = this.getFile(diff.based);
        if (base === undefined) return undefined;

        var content = base.content;
        for (var add in diff.diffs) {
            var bytes = diff.diffs[add];
            for (var i = 0; i < bytes.length; ++i) content[(add | 0) + i] = bytes[i];
        }
        return { name: fileName, content: content };
    },

    embedFileCompressedContent: function(fileName, compressedContent) {
        this.compressedContent[fileName] = compressedContent;
    },

    embedFileDiff: function(fileName, diffs) {
        this.diffsContent[fileName] = diffs;
    },

    isEmbeddedURL: function(url) {
        return url && url[0] === "@";
    },

    compressedContent: {},

    diffsContent: {}

};
