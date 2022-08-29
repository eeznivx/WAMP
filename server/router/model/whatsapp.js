'use strict';
const _0x53cdf0 = _0x5f5b;
(function (_0x3d2668, _0x28b219) {
    const _0x104606 = _0x5f5b,
        _0x1dd4b6 = _0x3d2668();
    while (true) {
        try {
            const _0x2cf8ee = -parseInt(_0x104606(0x145)) / 0x1 + -parseInt(_0x104606(0x132)) / 0x2 + parseInt(_0x104606(0xfe)) / 0x3 + -parseInt(_0x104606(0x121)) / 0x4 * (parseInt(_0x104606(0x102)) / 0x5) + -parseInt(_0x104606(0xff)) / 0x6 + -parseInt(_0x104606(0x139)) / 0x7 + parseInt(_0x104606(0x114)) / 0x8;
            if (_0x2cf8ee === _0x28b219) break;
            else _0x1dd4b6.push(_0x1dd4b6.shift());
        } catch (_0x3ff965) {
            _0x1dd4b6.push(_0x1dd4b6.shift());
        }
    }
}(_0x3d17, 0xe76d4));
const {
    default: makeWASocket,
    makeWALegacySocket,
    downloadContentFromMessage
} = require('@adiwajshing/baileys'), {
    useSingleFileAuthState,
    makeInMemoryStore,
    fetchLatestBaileysVersion,
    AnyMessageContent,
    delay,
    MessageRetryMap,
    useMultiFileAuthState
} = require('@adiwajshing/baileys'), {
    DisconnectReason
} = require('@adiwajshing/baileys'), QRCode = require('qrcode'), lib = require('../../lib'), fs = require('fs');
let sock = [],
    qrcode = [],
    intervalStore = [];
const {
    setStatus
} = require('../../database/index'), {
    autoReply
} = require('./autoreply'), {
    formatReceipt
} = require('../helper'), axios = require('axios'), MAIN_LOGGER = require('../../lib/pino'), logger = MAIN_LOGGER.child({}), useStore = !process.argv.includes('--no-store'), msgRetryCounterMap = () => MessageRetryMap = {}, connectToWhatsApp = async (sender, socket = null) => {
    const _0x34ef30 = _0x53cdf0;
    if (typeof qrcode[sender] !== 'undefined') return socket !== null && socket.emit('qrcode', {
        'token': sender,
        'data': qrcode[sender],
        'message': 'Qrcode updated, please scann with your Whatsapp Device'
    }), {
        'status': false,
        'sock': sock[sender],
        'qrcode': qrcode[sender],
        'message': 'Please scan qrcode'
    };
    try {
        let receiver = sock[sender].user.id.split(':');
        receiver = receiver[0x0] + '@s.whatsapp.net';
        const profile_url = await getPpUrl(sender, receiver);
        return socket !== null && socket.emit('connection-open', {
            'token': sender,
            'user': sock[sender].user,
            'ppUrl': profile_url
        }), {
            'status': true,
            'message': 'Already connected'
        };
    } catch (err) {
        socket !== null && socket.emit('message', {
            'token': sender,
            'message': 'Try to connecting ' + sender
        }), console.log('Try to connecting ' + sender);
    }
    const {
        state: auth_state,
        saveCreds: cred_object
    } = await useMultiFileAuthState('./credentials/' + sender), browser = await getChromeLates();
    console.log('using Chrome v' + browser?. ['data']?. ['versions'][0x0]?. ['version'] + ', isLatest: ' + (browser?. ['data']?. ['versions'].length > 0x0 ? !![] : false));
    const {
        version: version_,
        isLatest: isLatest_
    } = await fetchLatestBaileysVersion();
    return console.log('using WA v' + version_.join('.') + ', isLatest: ' + isLatest_), sock[sender] = makeWASocket({
        'version': version_,
        'browser': ['M Pedia', 'Chrome', browser?. ['data']?. ['versions'][0x0]?. ['version']],
        'logger': logger,
        'printQRInTerminal': true,
        'auth': auth_state
    }), sock[sender].ev.on('messages.upsert', auto_message => {
        autoReply(auto_message, sock[sender]);
    }), sock[sender].ev.on('connection.update', async message_data => {
        const _0x1188bf = _0x34ef30,
            {
                connection: connector,
                qr: qr_data,
                lastDisconnect: last_session
            } = message_data;
        if (connector === 'close') {
            if (last_session.error?. ['output']?. ['statusCode'] !== DisconnectReason.loggedOut) {
                if (last_session.error?. ['output']?. ['payload']?. ['message'] === 'Stream Errored (restart required)') {
                    delete qrcode[sender], connectToWhatsApp(sender, socket);
                    if (socket != null) socket.emit('message', {
                        'token': sender,
                        'message': 'Reconnecting'
                    });
                } else {
                    if (last_session.error?. ['output']?. ['payload']?. ['message'] === 'QR refs attempts ended') {
                        delete qrcode[sender];
                        if (socket != null) socket.emit('message', {
                            'token': sender,
                            'message': last_session.error.output.payload.message,
                            'error': last_session.error.output.payload.error
                        });
                    }
                }
            } else last_session.error?. ['output']?. ['statusCode'] === 0x191 && (setStatus(sender, 'close'), console.log('Connection closed. You are logged out.'), socket !== null && socket.emit('message', {
                'token': sender,
                'message': 'Connection closed. You are logged out.'
            }), clearConnection(sender));
        }
        qr_data && QRCode.toDataURL(qr_data, function (sned_qr_data, rec_data) {

            sned_qr_data && console.log(sned_qr_data), qrcode[sender] = rec_data, socket !== null && socket.emit('qrcode', {
                'token': sender,
                'data': rec_data,
                'message': 'Qrcode updated, please scann with your Whatsapp Device'
            });
        });
        if (connector === 'open') {
            setStatus(sender, 'Connected');
            let output_splitted = sock[sender].user.id.split(':');
            output_splitted = output_splitted[0x0] + '@s.whatsapp.net';
            const dp_url = await getPpUrl(sender, output_splitted);
            socket !== null && socket.emit('connection-open', {
                'token': sender,
                'user': sock[sender].user,
                'ppUrl': dp_url
            }), delete qrcode[sender];
        }
    }), sock[sender].ev.on('creds.update', cred_object), {
        'sock': sock[sender],
        'qrcode': qrcode[sender]
    };
};

async function connectWaBeforeSend(data) {
    let result = undefined,
        client;
    client = await connectToWhatsApp(data), await client.sock.ev.on('connection.update', request => {
        const {
            connection: connector,
            qr: qr_code
        } = request;
        connector === 'open' && (result = true), qr_code && (result = false);
    });
    let count = 0;
    while (typeof result === 'undefined') {
        count++;
        if (count > 4) break;
        await new Promise(reconnect => setTimeout(reconnect, 0x3e8));
    }
    return result;
}
const sendText = async (sender, receiver, message) => {
    try {
        const result = await sock[sender].sendMessage(formatReceipt(receiver), {
            'text': message
        });
        return result;
    } catch (error) {
        return console.log(error), false;
    }
}, sendMessage = async (sender, receiver, message) => {
    const _0x4a1cbd = _0x53cdf0;
    try {
        const _0x523010 = JSON.parse(message);
        let is_alive = false;
        receiver.length > 0xe ? (receiver = receiver + '@g.us', is_alive = true) : is_alive = await isExist(sender, formatReceipt(receiver));
        if (is_alive) {
            const result = await sock[sender].sendMessage(formatReceipt(receiver), JSON.parse(message));
            return result;
        }
        return false;
    } catch (error) {
        return console.log(error), false;
    }
};

function _0x3d17() {
    const _0x198639 = ['xls', '../../database/index', 'application/pdf', ' connection was estabilished', 'child', 'log', 'Stream Errored (restart required)', 'readFileSync', 'creds.update', 'bizWapi', 'get', '@adiwajshing/baileys', 'length', '3284448TUdtXz', 'axios', 'open', 'logout', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'versions', '../helper', '6870878MSMRKt', 'connection.update', 'rmSync', 'Reconnecting', ' is deleted', 'Nothing deleted', 'application/msword', 'Already connected', 'video', '--no-store', 'docx', 'connection-open', '272287hRnbEV', 'argv', '@s.whatsapp.net', 'messages.upsert', 'url', 'src/public/temp/', 'slice', 'sendMessage', 'error', 'existsSync', 'qrcode', 'send', 'Qrcode updated, please scann with your Whatsapp Device', 'Try to connecting ', 'displayText', 'user', 'Deleting session and credential', 'close', 'Disconnect', 'payload', 'groupFetchAllParticipating', 'Please scann qrcode', '1439961qHlakO', '4759482zkFHia', './credentials/', 'message', '449035ZYiFlH', 'Chrome', 'map', 'includes', 'version', 'join', 'toDataURL', 'exports', 'Connection closed. You are logged out.', 'output', 'data', 'application/mp3', ', isLatest: ', 'xlsx', 'using Chrome v', 'undefined', 'using WA v', 'QR refs attempts ended', '45471744TqkmcE', '@g.us', 'application/excel', 'entries', 'split', 'Logout Progres..', 'Please add your won role of mimetype', ' Connection failed,please scan first', '../../lib', '../../lib/pino', 'emit', 'body', 'image', '68xnViIa', 'profilePictureUrl', 'statusCode', './autoreply'];
    _0x3d17 = function () {
        return _0x198639;
    };
    return _0x3d17();
}
async function sendMedia(sender, receiver, type, url, option, caption) {
    const getListType = _0x53cdf0,
        formatted_receiver = formatReceipt(receiver);
    try {
        if (type == 'image') var message = await sock[sender].sendMessage(formatted_receiver, {
            'image': url ? {
                'url': url
            } : fs.readFileSync('src/public/temp/' + option),
            'caption': caption ? caption : null
        });
        else {
            if (type == 'video') var message = await sock[sender].sendMessage(formatted_receiver, {
                'video': url ? {
                    'url': url
                } : fs.readFileSync('src/public/temp/' + option),
                'caption': caption ? caption : null
            });
            else {
                if (type == 'audio') var message = await sock[sender].sendMessage(formatted_receiver, {
                    'audio': url ? {
                        'url': url
                    } : fs.readFileSync('src/public/temp/' + option),
                    'caption': caption ? caption : null
                });
                else {
                    if (type == 'pdf') var message = await sock[sender].sendMessage(formatted_receiver, {
                        'document': {
                            'url': url
                        },
                        'mimetype': 'application/pdf'
                    }, {
                        'url': url
                    });
                    else {
                        if (type == 'xls') var message = await sock[sender].sendMessage(formatted_receiver, {
                            'document': {
                                'url': url
                            },
                            'mimetype': 'application/excel'
                        }, {
                            'url': url
                        });
                        else {
                            if (type == 'xls') var message = await sock[sender].sendMessage(formatted_receiver, {
                                'document': {
                                    'url': url
                                },
                                'mimetype': 'application/excel'
                            }, {
                                'url': url
                            });
                            else {
                                if (type == 'xlsx') var message = await sock[sender].sendMessage(formatted_receiver, {
                                    'document': {
                                        'url': url
                                    },
                                    'mimetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                }, {
                                    'url': url
                                });
                                else {
                                    if (type == 'doc') var message = await sock[sender].sendMessage(formatted_receiver, {
                                        'document': {
                                            'url': url
                                        },
                                        'mimetype': 'application/msword'
                                    }, {
                                        'url': url
                                    });
                                    else {
                                        if (type == 'docx') var message = await sock[sender].sendMessage(formatted_receiver, {
                                            'document': {
                                                'url': url
                                            },
                                            'mimetype': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                        }, {
                                            'url': url
                                        });
                                        else {
                                            if (type == 'zip') var message = await sock[sender].sendMessage(formatted_receiver, {
                                                'document': {
                                                    'url': url
                                                },
                                                'mimetype': 'application/zip'
                                            }, {
                                                'url': url
                                            });
                                            else {
                                                if (type == 'mp3') var message = await sock[sender].sendMessage(formatted_receiver, {
                                                    'document': {
                                                        'url': url
                                                    },
                                                    'mimetype': 'application/mp3'
                                                }, {
                                                    'url': url
                                                });
                                                else return console.log('Please add your won role of mimetype'), false;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return message;
    } catch (error) {
        return console.log(error), false;
    }
}

function _0x5f5b(_0x425622, _0x2aa1fb) {
    const _0x3d17aa = _0x3d17();
    return _0x5f5b = function (_0x5f5b5d, _0x2f1675) {
        _0x5f5b5d = _0x5f5b5d - 0xf2;
        let _0x43bf93 = _0x3d17aa[_0x5f5b5d];
        return _0x43bf93;
    }, _0x5f5b(_0x425622, _0x2aa1fb);
}

async function sendButtonMessage(sender, receiver, type, caption, footer, url) {
    const _0x2a7fed = _0x53cdf0;


    try {
        const button = type.map((displayText, Id) => {
            return console.log(displayText), {
                'buttonId': Id,
                'buttonText': {
                    'displayText': displayText.displayText
                },
                'type': 1
            };
        });
        if (url) var message = {
            'image': {
                'url': url
            },
            'caption': caption,
            'footer': footer,
            'buttons': button,
            'headerType': 4
        };
        else var message = {
            'text': caption,
            'footer': footer,
            'buttons': button,
            'headerType': 1
        };
        console.log('message: ', message)
        const result = await sock[sender].sendMessage(formatReceipt(receiver), message);
        return result;
    } catch (error) {
        return console.log(error), false;
    }
}
async function sendTemplateMessage(sender, receiver, button_obj, caption, footer, downloadFilePath) {
    try {
        console.log(button_obj);
        if (downloadFilePath) var message = {
            'caption': caption,
            'footer': footer,
            'templateButtons': button_obj,
            'image': {
                'url': downloadFilePath
            }
        };
        else var message = {
            'text': caption,
            'footer': footer,
            'templateButtons': button_obj
        };
        const result = await sock[sender].sendMessage(formatReceipt(receiver), message);
        return result;
    } catch (error) {
        return console.log(error), false;
    }
}
async function sendListMessage(sender, receiver, list, text, footer, title, button) {
    try {
        const message = {
                'text': text,
                'footer': footer,
                'title': title,
                'buttonText': button,
                'sections': [list]
            },
            result = await sock[sender].sendMessage(formatReceipt(receiver), message);
        return result;
    } catch (error) {
        return console.log(error), false;
    }
}
async function fetchGroups(sender) {
    const _0x23b434 = _0x53cdf0;
    try {
        let result = await sock[sender].groupFetchAllParticipating(),
            contacts = Object.entries(result).slice(0x0).map(_0x538ede => _0x538ede[0x1]);
        return contacts;
    } catch (err) {
        return false;
    }
}
async function isExist(sender, receiver) {
    const _0x55681a = _0x53cdf0;
    if (typeof sock[sender] === 'undefined') {
        const connector = await connectWaBeforeSend(sender);
        if (!connector) return false;
    }
    try {
        if (receiver.includes('@g.us')) return true;
        else {
            const [result] = await sock[sender].onWhatsApp(receiver);
            return result;
        }
    } catch (err) {
        return false;
    }
}
async function getPpUrl(phone_sender, whatsapp_id, dp_url) {
    const _0x26c4fb = _0x53cdf0;
    let result;
    try {
        return dp_url ? result = await sock[phone_sender].profilePictureUrl(whatsapp_id, 'image') : result = await sock[phone_sender].profilePictureUrl(whatsapp_id), result;
    } catch (err) {
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png';
    }
}
async function deleteCredentials(sender, new_socket = null) {
    const _0x4cb3fa = _0x53cdf0;
    new_socket !== null && new_socket.emit('message', {
        'token': sender,
        'message': 'Logout Progres..'
    });
    try {
        if (typeof sock[sender] === 'undefined') {
            const _0x11f88b = await connectWaBeforeSend(sender);
            _0x11f88b && (sock[sender].logout(), delete sock[sender]);
        } else sock[sender].logout(), delete sock[sender];
        return delete qrcode[sender], clearInterval(intervalStore[sender]), setStatus(sender, 'Disconnect'), new_socket != null && (new_socket.emit('Unauthorized', sender), new_socket.emit('message', {
            'token': sender,
            'message': 'Connection closed. You are logged out.'
        })), fs.existsSync('./credentials/' + sender) && fs.rmSync('./credentials/' + sender, {
            'recursive': true,
            'force': true
        }, success => {
            if (success) console.log(success);
        }), {
            'status': true,
            'message': 'Deleting session and credential'
        };
    } catch (error) {
        return console.log(error), {
            'status': true,
            'message': 'Nothing deleted'
        };
    }
}
async function getChromeLates() {
    const _0x2b49a9 = _0x53cdf0,
        result = await axios.get('https://versionhistory.googleapis.com/v1/chrome/platforms/linux/channels/stable/versions');
    return result;
}

function clearConnection(sender) {
    const _0x5c878a = _0x53cdf0;
    clearInterval(intervalStore[sender]), delete sock[sender], delete qrcode[sender], setStatus(sender, 'close'), fs.existsSync('./credentials/' + sender) && (fs.rmSync('./credentials/' + sender, {
        'recursive': true,
        'force': true
    }, _0x41de93 => {
        const _0x487767 = _0x5c878a;
        if (_0x41de93) console.log(_0x41de93);
    }), console.log('credentials/' + sender + ' is deleted'));
}
async function initialize(token, response) {
    const _0x198e90 = _0x53cdf0,
        {
            token: sender
        } = token.body;

    if (sender) {
        const fs = require('fs'),
            path = './credentials/' + sender;
        if (fs.existsSync(path)) {
            if (typeof sock[sender] === 'undefined') {
                const connect = await connectWaBeforeSend(sender);
                return connect ? response.send({
                    'status': true,
                    'message': sender + ' connection was estabilished'
                }) : response.send({
                    'status': false,
                    'message': sender + ' Connection failed,please scan first'
                });
            }
            return response.send({
                'status': true,
                'message': sender + ' connection was estabilished'
            });
        }
        return response.send({
            'status': false,
            'message': sender + ' Connection failed,please scan first'
        });
    }
    return response.send({
        'status': false,
        'message': 'Wrong Parameterss'
    });
}
module[_0x53cdf0(0x109)] = {
    'connectToWhatsApp': connectToWhatsApp,
    'sendText': sendText,
    'sendMedia': sendMedia,
    'sendButtonMessage': sendButtonMessage,
    'sendTemplateMessage': sendTemplateMessage,
    'sendListMessage': sendListMessage,
    'isExist': isExist,
    'getPpUrl': getPpUrl,
    'fetchGroups': fetchGroups,
    'deleteCredentials': deleteCredentials,
    'sendMessage': sendMessage,
    'initialize': initialize,
    'connectWaBeforeSend': connectWaBeforeSend
};
