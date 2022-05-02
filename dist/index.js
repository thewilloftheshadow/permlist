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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const csv_writer_1 = require("csv-writer");
const client = new discord_js_1.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
client.login(process.env.TOKEN);
client.on("ready", () => { var _a; return console.log(`Started: ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`); });
client.on("messageCreate", (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const args = message.content.split(" ");
    const prefix = args.shift() || "";
    const command = args.shift() || "";
    if (![`<@${(_a = client.user) === null || _a === void 0 ? void 0 : _a.id}>`, `<@!${(_b = client.user) === null || _b === void 0 ? void 0 : _b.id}>`].includes(prefix))
        return;
    if (!message.guild)
        return;
    if (command === "permlist") {
        const m = yield message.reply({ content: "Generating permission list..." });
        const chanList = (_c = message.guild) === null || _c === void 0 ? void 0 : _c.channels.cache;
        const roles = message.guild.roles.cache.map((x) => ({ title: x.name, id: x.id }));
        const path = `${process.cwd()}/temp/${message.guild.id}-${Date.now()}.csv`;
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: `${process.cwd()}/temp/${message.guild.id}-${Date.now()}.csv`,
            header: [{ id: "channel", title: "Channel" }, ...roles],
        });
        const out = [];
        yield Promise.all(chanList.map((channel) => __awaiter(void 0, void 0, void 0, function* () {
            const record = {};
            record.channel = channel.name;
            roles.forEach((role) => {
                const perms = channel.permissionsFor(role.id);
                const status = [];
                if (perms === null || perms === void 0 ? void 0 : perms.has("VIEW_CHANNEL"))
                    status.push("READ");
                if (perms === null || perms === void 0 ? void 0 : perms.has("SEND_MESSAGES"))
                    status.push("SEND");
                record[role.id] = status.join("/");
            });
            out.push(record);
        })));
        yield csvWriter.writeRecords(out);
        m.edit({ content: "Done", files: [path] });
    }
}));
