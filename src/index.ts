// require("dotenv").config()
// const { Client } = require("discord.js")
// const client = new Client({ intents: [] })
// client.login(process.env.TOKEN)

import "dotenv/config"
import { Client } from "discord.js"

import { createObjectCsvWriter } from "csv-writer"

type Record = {
    [key: string]: string
}

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] })
client.login(process.env.TOKEN)

// eslint-disable-next-line no-console
client.on("ready", () => console.log(`Started: ${client.user?.tag}`))

client.on("messageCreate", async (message) => {
    const args = message.content.split(" ")
    const prefix = args.shift() || ""
    const command = args.shift() || ""

    if (![`<@${client.user?.id}>`, `<@!${client.user?.id}>`].includes(prefix)) return
    if (!message.guild) return

    if (command === "permlist") {
        const m = await message.reply({ content: "Generating permission list..." })
        const chanList = message.guild?.channels.cache
        const roles = message.guild.roles.cache.map((x) => ({ title: x.name, id: x.id }))
        const path = `${process.cwd()}/temp/${message.guild.id}-${Date.now()}.csv`
        const csvWriter = createObjectCsvWriter({
            path: `${process.cwd()}/temp/${message.guild.id}-${Date.now()}.csv`,
            header: [{ id: "channel", title: "Channel" }, ...roles],
        })

        const out: Record[] = []

        await Promise.all(
            chanList.map(async (channel) => {
                const record: Record = {}
                record.channel = `${channel.name} - ${channel.id}`
                roles.forEach((role) => {
                    const perms = channel.permissionsFor(role.id)
                    const status = []
                    if (perms?.has("VIEW_CHANNEL")) status.push("READ")
                    if (perms?.has("SEND_MESSAGES")) status.push("SEND")
                    record[role.id] = status.join("/")
                })
                out.push(record)
            }),
        )
        await csvWriter.writeRecords(out)

        m.edit({
            content: `Done! I've attached a CSV file of the Read and Send permissions for the channels in your server.
                The roles are along the top and the channels are along the side.
                Want to add more permissions to track? Just send a DM to TheShadow#8124.`,
            files: [path],
        })
    }
})
