"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs = require('fs');
var csv = require('csv-parser');
var mongoose = require('mongoose');
var InventoryModel_1 = require("../models/InventoryModel");
var linkMongo = 'mongodb://192.168.1.237:27017/spaceshooter_development';
mongoose
    .connect(linkMongo, {
//useNewUrlParser: true,
// useCreateIndex: true,
// useUnifiedTopology: true,
})
    .then(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log('Mongo Connected');
        return [2 /*return*/];
    });
}); }, function (err) {
    console.log(err);
});
var path1 = './src/Book1.csv';
var path2 = './src/EquipmentDuplicate.txt';
fs.createReadStream(path1)
    .pipe(csv())
    .on('data', function (row) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(row.Count >= 6)) return [3 /*break*/, 2];
                return [4 /*yield*/, InventoryModel_1.InventoryModel.findById(row.ID)
                        .then(function (data) { return __awaiter(void 0, void 0, void 0, function () {
                        var object, string, array_1, count, indexRemove, i, jsonUpdate;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!!data) return [3 /*break*/, 1];
                                    console.log('data not found');
                                    return [3 /*break*/, 3];
                                case 1:
                                    if (!data) return [3 /*break*/, 3];
                                    object = (_a = data === null || data === void 0 ? void 0 : data.Inventory) === null || _a === void 0 ? void 0 : _a.get('STR|INVENTORY_JSON');
                                    if (!(object !== undefined)) return [3 /*break*/, 3];
                                    string = JSON.stringify(object);
                                    array_1 = JSON.parse(JSON.parse(string));
                                    count = array_1.length;
                                    indexRemove = new Array();
                                    console.log(array_1.length);
                                    console.log(array_1);
                                    for (i = count - 1; i > count - row.Count + 4; i--) {
                                        if (array_1[i].level == 1) {
                                            indexRemove.push(i);
                                        }
                                    }
                                    indexRemove.forEach(function (e) {
                                        array_1.splice(e, 1);
                                    });
                                    console.log(array_1.length);
                                    console.log(array_1);
                                    jsonUpdate = JSON.stringify(array_1);
                                    return [4 /*yield*/, InventoryModel_1.InventoryModel.findOneAndUpdate({ _id: row.ID }, {
                                            $set: {
                                                'Inventory.STR|INVENTORY_JSON': jsonUpdate
                                            }
                                        }, function (err, doc) {
                                            if (err)
                                                throw err;
                                            else {
                                                console.log('Update Success!');
                                            }
                                        })];
                                case 2:
                                    _b.sent();
                                    _b.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })["catch"](function (err) {
                        console.log(err);
                    })];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); });
// .on('end', () => {
//   console.log('CSV file successfully processed');
// });
// fs.readFile(path2, 'utf8', function (err, data) {
//   if (err) throw err;
//   console.log(data);
// });
