import cors from "cors";
import http from "node:http";
import { setGlobalDispatcher, EnvHttpProxyAgent } from "undici";
import { getCommit, getBranch, getRemote, getVersion } from "@imput/version-info";

import jwt from "../security/jwt.js";
import stream from "../stream/stream.js";
import match from "../processing/match.js";

import authRoutes from '../routes/auth.js';
import { unifiedPolicyEngine } from '../middleware/policy.js';
import { identityMiddleware } from '../middleware/identity.js';

import { env } from "../config.js";
import { extract } from "../processing/url.js";
import { Bright, Cyan } from "../misc/console-text.js";
import { hashHmac } from "../security/secrets.js";
import { randomizeCiphers } from "../misc/randomize-ciphers.js";
import { verifyTurnstileToken } from "../security/turnstile.js";
import { friendlyServiceName } from "../processing/service-alias.js";
import { verifyStream } from "../stream/manage.js";
import { createResponse, normalizeRequest, getIP } from "../processing/request.js";
import { setupTunnelHandler } from "./itunnel.js";

import * as APIKeys from "../security/api-keys.js";
import * as Cookies from "../processing/cookie/manager.js";
import * as YouTubeSession from "../processing/helpers/youtube-session.js";

const git = {
    branch: await getBranch(),
    commit: await getCommit(),
    remote: await getRemote(),
}

const version = await getVersion();

const acceptRegex = /^application\/json(; charset=utf-8)?$/;

const corsConfig = env.corsWildcard ? {} : {
    origin: env.corsURL,
    optionsSuccessStatus: 200
}

const fail = (res, code, context) => {
    const { status, body } = createResponse("error", { code, context });
    res.status(status).json(body);
}

export const runAPI = async (express, app, __dirname, isPrimary = true) => {
    const startTime = new Date();
    const startTimestamp = startTime.getTime();

    const getServerInfo = () => {
        return JSON.stringify({
            CyberCygan: {
                version: version,
                url: env.apiURL,
                startTime: `${startTimestamp}`,
                turnstileSitekey: env.sessionEnabled ? env.turnstileSitekey : undefined,
                services: [...env.enabledServices].map(e => {
                    return friendlyServiceName(e);
                }),
            },
            git,
        });
    }

    const serverInfo = getServerInfo();

    app.set('trust proxy', ['loopback', 'uniquelocal']);

    app.use('/', cors({
        methods: ['GET', 'POST'],
        exposedHeaders: [
            'Ratelimit-Limit',
            'Ratelimit-Policy',
            'Ratelimit-Remaining',
            'Ratelimit-Reset'
        ],
        ...corsConfig,
    }));

    app.use('/auth', express.json({ limit: 1024 }), authRoutes);

    app.post('/', (req, res, next) => {
        if (!acceptRegex.test(req.header('Accept'))) {
            return fail(res, "error.api.header.accept");
        }
        if (!acceptRegex.test(req.header('Content-Type'))) {
            return fail(res, "error.api.header.content_type");
        }
        next();
    });

    app.post('/', identityMiddleware, unifiedPolicyEngine);

    app.use('/', express.json({ limit: 1024 }));

    app.use('/', (err, _, res, next) => {
        if (err) {
            const { status, body } = createResponse("error", {
                code: "error.api.invalid_body",
            });
            return res.status(status).json(body);
        }

        next();
    });

    app.post("/session", sessionLimiter, async (req, res) => {
        if (!env.sessionEnabled) {
            return fail(res, "error.api.auth.not_configured")
        }

        const turnstileResponse = req.header("cf-turnstile-response");

        if (!turnstileResponse) {
            return fail(res, "error.api.auth.turnstile.missing");
        }

        const turnstileResult = await verifyTurnstileToken(
            turnstileResponse,
            req.ip
        );

        if (!turnstileResult) {
            return fail(res, "error.api.auth.turnstile.invalid");
        }

        try {
            res.json(jwt.generate(getIP(req, 32)));
        } catch {
            return fail(res, "error.api.generic");
        }
    });

    app.post('/', async (req, res) => {
        const request = req.body;

        if (!request.url) {
            return fail(res, "error.api.link.missing");
        }

        const { success, data: normalizedRequest } = await normalizeRequest(request);
        if (!success) {
            return fail(res, "error.api.invalid_body");
        }

        const parsed = extract(
            normalizedRequest.url,
            APIKeys.getAllowedServices(req.rateLimitKey),
        );

        if (!parsed) {
            return fail(res, "error.api.link.invalid");
        }

        if ("error" in parsed) {
            let context;
            if (parsed?.context) {
                context = parsed.context;
            }
            return fail(res, `error.api.${parsed.error}`, context);
        }

        try {
            const result = await match({
                host: parsed.host,
                patternMatch: parsed.patternMatch,
                params: normalizedRequest,
                authType: req.authType ?? "none",
            });

            res.status(result.status).json(result.body);
        } catch {
            fail(res, "error.api.generic");
        }
    });

    app.use('/tunnel', cors({
        methods: ['GET'],
        exposedHeaders: [
            'Estimated-Content-Length',
            'Content-Disposition'
        ],
        ...corsConfig,
    }));

    app.get('/tunnel', apiTunnelLimiter, async (req, res) => {
        const id = String(req.query.id);
        const exp = String(req.query.exp);
        const sig = String(req.query.sig);
        const sec = String(req.query.sec);
        const iv = String(req.query.iv);

        const checkQueries = id && exp && sig && sec && iv;
        const checkBaseLength = id.length === 21 && exp.length === 13;
        const checkSafeLength = sig.length === 43 && sec.length === 43 && iv.length === 22;

        if (!checkQueries || !checkBaseLength || !checkSafeLength) {
            return res.status(400).end();
        }

        if (req.query.p) {
            return res.status(200).end();
        }

        const streamInfo = await verifyStream(id, sig, exp, sec, iv);
        if (!streamInfo?.service) {
            return res.status(streamInfo.status).end();
        }

        if (streamInfo.type === 'proxy') {
            streamInfo.range = req.headers['range'];
        }

        return stream(res, streamInfo);
    });

    app.get('/', (_, res) => {
        res.type('json');
        res.status(200).send(env.envFile ? getServerInfo() : serverInfo);
    })

    app.get('/favicon.ico', (req, res) => {
        res.status(404).end();
    })

    app.get('/*', (req, res) => {
        res.redirect('/');
    })

    // handle all express errors
    app.use((_, __, res, ___) => {
        return fail(res, "error.api.generic");
    })

    randomizeCiphers();
    setInterval(randomizeCiphers, 1000 * 60 * 30); // shuffle ciphers every 30 minutes

    env.subscribe(['externalProxy', 'httpProxyValues'], () => {
        // TODO: remove env.externalProxy in a future version
        const options = {};
        if (env.externalProxy) {
            options.httpProxy = env.externalProxy;
        }

        setGlobalDispatcher(
            new EnvHttpProxyAgent(options)
        );
    });

    http.createServer(app).listen({
        port: env.apiPort,
        host: env.listenAddress,
        reusePort: env.instanceCount > 1 || undefined
    }, () => {
        if (isPrimary) {
            console.log(`\n` +
                Bright(Cyan("CyberCygan ")) + Bright("API ^ω^") + "\n" +

                "~~~~~~\n" +
                Bright("version: ") + version + "\n" +
                Bright("commit: ") + git.commit + "\n" +
                Bright("branch: ") + git.branch + "\n" +
                Bright("remote: ") + git.remote + "\n" +
                Bright("start time: ") + startTime.toUTCString() + "\n" +
                "~~~~~~\n" +

                Bright("url: ") + Bright(Cyan(env.apiURL)) + "\n" +
                Bright("port: ") + env.apiPort + "\n"
            );
        }

        if (env.apiKeyURL) {
            APIKeys.setup(env.apiKeyURL);
        }

        if (env.cookiePath) {
            Cookies.setup(env.cookiePath);
        }

        if (env.ytSessionServer) {
            YouTubeSession.setup();
        }
    });

    setupTunnelHandler();
}
