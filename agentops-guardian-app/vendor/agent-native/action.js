import { normalizeActionChatUIConfig, } from "./action-ui.js";
import { normalizeAuditConfig, resolveAuditAttach } from "./audit/config.js";
/**
 * A deterministic, caller-correctable action contract failure.
 *
 * Unlike an ordinary Error, its code and explicitly safe details survive the
 * framework HTTP transport. Internal failures remain generic 500 responses.
 */
export class ActionContractError extends Error {
    actionContractError = true;
    errorCode;
    details;
    statusCode;
    constructor(message, options) {
        super(message);
        this.name = "ActionContractError";
        this.errorCode = options.errorCode;
        this.details = options.details;
        this.statusCode = options.statusCode ?? 409;
    }
}
export function isActionContractError(error) {
    return (error instanceof ActionContractError ||
        (!!error &&
            typeof error === "object" &&
            error.actionContractError ===
                true &&
            typeof error.errorCode === "string"));
}
/**
 * Throw from an action when the agent should stop the current turn instead of
 * feeding the failure back to the model for another retry.
 */
export class AgentActionStopError extends Error {
    agentNativeStop = true;
    errorCode;
    toolResult;
    constructor(message, options = {}) {
        super(message);
        this.name = "AgentActionStopError";
        this.errorCode = options.errorCode;
        this.toolResult = options.toolResult;
    }
}
export function isAgentActionStopError(err) {
    return (err instanceof AgentActionStopError ||
        Boolean(err &&
            typeof err === "object" &&
            "agentNativeStop" in err &&
            err.agentNativeStop === true));
}
export const MCP_APP_EXTENSION_ID = "io.modelcontextprotocol/ui";
export const MCP_APP_MIME_TYPE = "text/html;profile=mcp-app";
export const MCP_APP_RESOURCE_URI_META_KEY = "ui/resourceUri";
export function defineAction(options) {
    const hasSchema = options.schema && "~standard" in options.schema;
    // Build tool definition for the Claude API
    let toolParameters;
    if (hasSchema) {
        // Convert Standard Schema to JSON Schema for Claude
        toolParameters = schemaToJsonSchema(options.schema, options.description);
    }
    else if (options.parameters) {
        toolParameters = {
            type: "object",
            properties: options.parameters,
        };
    }
    // `agentInputSchema` swaps in a compact JSON Schema for the ADVERTISED tool
    // definition only (what the model/MCP/A2A tool listings see). It never
    // touches validation below — `wrapWithValidation` is always called with
    // `options.schema`, the full schema, as the source of truth for what's
    // accepted. Passing the same (compact) `toolParameters` into it only
    // affects the top-level "Expected: { ... }" hint text and gateway string
    // coercion, both of which only look at top-level property names/types —
    // unaffected by trimming a nested union, so this stays safe either way.
    if (hasSchema &&
        options.agentInputSchema &&
        "~standard" in options.agentInputSchema) {
        toolParameters = schemaToJsonSchema(options.agentInputSchema, options.description);
    }
    // Authorization sits INSIDE input validation, so a gate that inspects `args`
    // is handed the parsed, coerced value its type promises rather than whatever
    // shape the caller sent. Putting it outside would have every guard reading
    // attacker-shaped input while typed as though it were validated.
    const guardedRun = typeof options.authorize === "function"
        ? wrapRunWithAuthorize(options.run, options.authorize)
        : options.run;
    // Wrap run() with INPUT validation when schema is provided.
    // Pass toolParameters so the validation error can echo the expected signature
    // (required vs optional fields) and help the caller self-correct.
    const inputValidatedRun = hasSchema
        ? wrapWithValidation(options.schema, guardedRun, toolParameters)
        : guardedRun;
    // Then wrap with OUTPUT validation when an outputSchema is provided. This
    // composes AROUND the input-validated run so the order is: validate input →
    // run() → validate output. When no outputSchema is present, the run is passed
    // through untouched and behavior is byte-for-byte unchanged.
    const hasOutputSchema = options.outputSchema && "~standard" in options.outputSchema;
    const outputErrorStrategy = options.outputErrorStrategy === "strict" ||
        options.outputErrorStrategy === "warn" ||
        options.outputErrorStrategy === "fallback"
        ? options.outputErrorStrategy
        : "warn";
    const run = hasOutputSchema
        ? wrapWithOutputValidation(options.outputSchema, inputValidatedRun, outputErrorStrategy, options.outputFallback, options.description)
        : inputValidatedRun;
    // Auto-infer readOnly from http.method === "GET" unless explicitly set.
    // GET actions are idempotent reads; their completion should NOT trigger a
    // screen refresh. Everything else is assumed to mutate — the dispatcher
    // emits a change event on success so the UI auto-refetches its queries.
    const httpConfig = options.http;
    const inferredReadOnly = httpConfig !== false &&
        httpConfig !== undefined &&
        httpConfig.method === "GET";
    // Explicit `readOnly` (true OR false) wins. Otherwise infer from http.method.
    // We store the resolved boolean so downstream checks can trust entry.readOnly
    // without re-running method inference — including when a caller explicitly
    // passes readOnly:false to override a GET (rare but valid).
    const readOnly = typeof options.readOnly === "boolean"
        ? options.readOnly
        : inferredReadOnly
            ? true
            : undefined;
    // Audit: wrap the validated run so every mutating call records an audit
    // event (who/what/when/from-where, and for the agent which run). Default-on
    // for mutations; read-only actions opt in via `audit.onRead`. The wrapper
    // lazily imports the DB-touching recorder so `action.ts` keeps no static DB
    // dependency.
    const auditConfig = normalizeAuditConfig(options.audit);
    const finalRun = resolveAuditAttach(auditConfig, readOnly)
        ? wrapRunWithAudit(run, auditConfig)
        : run;
    // toolCallable: thread through whatever the caller declared. We DO NOT
    // default to `true` here — the absence of an explicit field is meaningful
    // to the tools bridge: it lets us emit a one-shot warning when an action
    // without a declared `toolCallable` flag is invoked from a tool, so the
    // ecosystem can migrate over time. The bridge treats `undefined` as
    // "implicit allow with a deprecation warning"; only an explicit `false`
    // refuses the call. See `extensions/routes.ts` and audit H5.
    const toolCallable = typeof options.toolCallable === "boolean"
        ? options.toolCallable
        : undefined;
    // agentTool: default-allow opt-out. Only an explicit `false` hides the action
    // from the agent tool surfaces; undefined is preserved (treated as exposed).
    const agentTool = typeof options.agentTool === "boolean" ? options.agentTool : undefined;
    const parallelSafe = typeof options.parallelSafe === "boolean"
        ? options.parallelSafe
        : undefined;
    const dedupe = typeof options.dedupe === "boolean" ? options.dedupe : undefined;
    const publicAgent = options.publicAgent &&
        typeof options.publicAgent === "object" &&
        !Array.isArray(options.publicAgent)
        ? options.publicAgent
        : undefined;
    const link = typeof options.link === "function" ? options.link : undefined;
    const mcpApp = (() => {
        if (!options.mcpApp ||
            typeof options.mcpApp !== "object" ||
            Array.isArray(options.mcpApp)) {
            return undefined;
        }
        // compactCatalog-only: no resource required; just keep the flag.
        if (options.mcpApp.compactCatalog === true && !options.mcpApp.resource) {
            return options.mcpApp;
        }
        // Full resource: validate html is present.
        if (options.mcpApp.resource &&
            typeof options.mcpApp.resource === "object" &&
            !Array.isArray(options.mcpApp.resource) &&
            (typeof options.mcpApp.resource.html === "string" ||
                typeof options.mcpApp.resource.html === "function")) {
            return options.mcpApp;
        }
        return undefined;
    })();
    const chatUI = normalizeActionChatUIConfig(options.chatUI);
    return {
        tool: {
            description: options.description,
            parameters: toolParameters,
        },
        run: finalRun,
        ...(hasSchema ? { schema: options.schema } : {}),
        ...(options.http !== undefined ? { http: options.http } : {}),
        ...(typeof options.requiresAuth === "boolean"
            ? { requiresAuth: options.requiresAuth }
            : {}),
        ...(typeof options.maxBodyBytes === "number"
            ? { maxBodyBytes: options.maxBodyBytes }
            : {}),
        ...(typeof agentTool === "boolean" ? { agentTool } : {}),
        ...(typeof readOnly === "boolean" ? { readOnly } : {}),
        ...(typeof options.grounding === "boolean"
            ? { grounding: options.grounding }
            : {}),
        ...(typeof options.allowInPlanMode === "boolean"
            ? { allowInPlanMode: options.allowInPlanMode }
            : {}),
        ...(options.planMode &&
            typeof options.planMode === "object" &&
            !Array.isArray(options.planMode) &&
            (typeof options.planMode.effect === "function" ||
                options.planMode.effect === "read" ||
                options.planMode.effect === "write" ||
                options.planMode.effect === "unknown")
            ? { planMode: options.planMode }
            : {}),
        ...(typeof parallelSafe === "boolean" ? { parallelSafe } : {}),
        ...(typeof dedupe === "boolean" ? { dedupe } : {}),
        ...(typeof toolCallable === "boolean" ? { toolCallable } : {}),
        ...(publicAgent ? { publicAgent } : {}),
        ...(link ? { link } : {}),
        ...(mcpApp ? { mcpApp } : {}),
        ...(chatUI ? { chatUI } : {}),
        ...(typeof options.timeoutMs === "number"
            ? { timeoutMs: options.timeoutMs }
            : {}),
        ...(typeof options.maxResultChars === "number"
            ? { maxResultChars: options.maxResultChars }
            : {}),
        ...(hasOutputSchema
            ? {
                outputSchema: options.outputSchema,
                outputErrorStrategy,
                ...(outputErrorStrategy === "fallback"
                    ? { outputFallback: options.outputFallback }
                    : {}),
            }
            : {}),
        ...(typeof options.needsApproval === "boolean" ||
            typeof options.needsApproval === "function"
            ? { needsApproval: options.needsApproval }
            : {}),
        ...(auditConfig ? { audit: auditConfig } : {}),
    };
}
/**
 * Wrap an action's run with its `authorize` gate.
 *
 * The gate is applied here, around `run`, rather than exposed as a flag on the
 * action entry: `run` is the one thing all six dispatch sites (agent loop, HTTP
 * route, frontend, MCP, A2A, CLI) go through, so there is no caller that can
 * reach the body without passing the check. `needsApproval` took the flag route
 * and is consequently honoured only inside the agent loop.
 *
 * Composed so the full order is: validate input → authorize → run → validate
 * output → audit. The audit wrapper is outermost, so a denial is still recorded
 * as an attempt — which is precisely what an audit trail is for.
 *
 * A guard that throws denies with its own message. A guard that returns `false`
 * denies generically. Anything else — including `undefined` — allows.
 */
function wrapRunWithAuthorize(run, authorize) {
    return async function authorizedRun(args, ctx) {
        const verdict = await authorize(args, ctx);
        if (verdict === false) {
            const err = new Error("Not authorized");
            err.name = "ForbiddenError";
            err.statusCode = 403;
            throw err;
        }
        return run(args, ctx);
    };
}
/**
 * Wrap an action's (already input/output-validated) run so each call records an
 * audit event after it resolves — on success and on error. Best-effort: the
 * recorder swallows its own failures and the original result/throw is always
 * preserved, so auditing can never change an action's behavior. The DB-touching
 * recorder is imported lazily so merely defining an action pulls in no DB code.
 */
function wrapRunWithAudit(run, auditConfig) {
    return async function auditedRun(args, ctx) {
        let result;
        let error;
        let threw = false;
        try {
            result = await run(args, ctx);
        }
        catch (err) {
            error = err;
            threw = true;
        }
        try {
            const { recordActionAudit } = await import("./audit/record.js");
            await recordActionAudit(threw
                ? { config: auditConfig, args, ctx, status: "error", error }
                : { config: auditConfig, args, ctx, status: "success", result });
        }
        catch {
            // Recorder failed to load/run — never affect the action.
        }
        if (threw)
            throw error;
        return result;
    };
}
// ---------------------------------------------------------------------------
// Schema → JSON Schema conversion
// ---------------------------------------------------------------------------
// Keywords whose value is a single subschema.
const SUBSCHEMA_VALUE_KEYS = [
    "items",
    "additionalItems",
    "contains",
    "additionalProperties",
    "not",
    "if",
    "then",
    "else",
];
// Keywords whose value is an array of subschemas.
const SUBSCHEMA_ARRAY_KEYS = [
    "allOf",
    "anyOf",
    "oneOf",
    "prefixItems",
];
// Keywords whose value is a map of name → subschema.
const SUBSCHEMA_MAP_KEYS = [
    "properties",
    "patternProperties",
    "$defs",
    "definitions",
    "dependentSchemas",
];
/**
 * Remove JSON Schema keywords that some providers' function-calling schema
 * validators reject. OpenAI (and Gemini via the Builder gateway) reject
 * `propertyNames` — which Zod v4 emits for `z.record(z.string(), …)` — with a
 * `400 invalid_function_parameters` error, causing the model turn to produce no
 * content (surfacing as an empty assistant response). Anthropic ignores the
 * keyword, so stripping it is safe across providers and keeps action schemas
 * portable. `propertyNames` only constrained object *keys*; the value/shape of
 * the object is unaffected by its removal.
 *
 * Only descends through actual subschema positions (properties, items, union
 * branches, definitions, etc.) — never through value-bearing keywords like
 * `default`, `const`, `enum`, or `examples`, whose objects may legitimately
 * contain a `propertyNames` data key that must be preserved.
 */
function stripUnsupportedSchemaKeywords(node) {
    if (!node || typeof node !== "object" || Array.isArray(node))
        return node;
    const obj = node;
    delete obj.propertyNames;
    for (const key of SUBSCHEMA_VALUE_KEYS) {
        // `items`/`additionalItems` may also be an array of subschemas.
        const value = obj[key];
        if (Array.isArray(value)) {
            for (const sub of value)
                stripUnsupportedSchemaKeywords(sub);
        }
        else {
            stripUnsupportedSchemaKeywords(value);
        }
    }
    for (const key of SUBSCHEMA_ARRAY_KEYS) {
        const value = obj[key];
        if (Array.isArray(value)) {
            for (const sub of value)
                stripUnsupportedSchemaKeywords(sub);
        }
    }
    for (const key of SUBSCHEMA_MAP_KEYS) {
        const value = obj[key];
        if (value && typeof value === "object" && !Array.isArray(value)) {
            for (const sub of Object.values(value)) {
                stripUnsupportedSchemaKeywords(sub);
            }
        }
    }
    return node;
}
/**
 * Convert a Standard Schema to JSON Schema for the Claude API.
 * Tries vendor-specific toJSONSchema first (Zod v4), then falls back
 * to a basic introspection of the schema shape.
 */
function schemaToJsonSchema(schema, _description) {
    const s = schema;
    // Prefer Zod's own JSON Schema output — it handles descriptions,
    // enums, coerce, and all type wrappers correctly.
    if (s["~standard"]?.jsonSchema?.input) {
        try {
            const result = s["~standard"].jsonSchema.input({
                target: "draft-07",
            });
            // Strip $schema — the Claude API validates against draft 2020-12
            // and a mismatched $schema declaration can cause rejections.
            if (result && typeof result === "object") {
                delete result.$schema;
            }
            return stripUnsupportedSchemaKeywords(result);
        }
        catch {
            // Fall through to manual converter
        }
    }
    // Fallback: manual conversion from Zod v4 internal defs
    if (s._zod?.def) {
        return stripUnsupportedSchemaKeywords(zodDefToJsonSchema(s._zod.def));
    }
    // Last resort: empty object schema
    return { type: "object", properties: {} };
}
/**
 * Convert a Zod v4 internal def to JSON Schema.
 * Handles the common types used in action parameters.
 */
function zodDefToJsonSchema(def) {
    const type = def.type;
    if (type === "object") {
        const properties = {};
        const required = [];
        const shape = def.shape;
        if (shape) {
            for (const [key, fieldSchema] of Object.entries(shape)) {
                const fieldDef = fieldSchema?._zod?.def;
                if (fieldDef) {
                    const prop = zodDefToJsonSchema(fieldDef);
                    // Zod v4 stores .describe() on the schema object, not in the def
                    const desc = fieldSchema?.description;
                    if (desc && !prop.description)
                        prop.description = desc;
                    properties[key] = prop;
                    if (fieldDef.type !== "optional" &&
                        fieldDef.type !== "default" &&
                        fieldDef.type !== "nullable") {
                        required.push(key);
                    }
                }
            }
        }
        const result = { type: "object", properties };
        if (required.length > 0)
            result.required = required;
        return result;
    }
    if (type === "string") {
        const result = { type: "string" };
        if (def.description)
            result.description = def.description;
        return result;
    }
    if (type === "number" || type === "float" || type === "int") {
        const result = { type: type === "int" ? "integer" : "number" };
        if (def.description)
            result.description = def.description;
        return result;
    }
    if (type === "boolean") {
        const result = { type: "boolean" };
        if (def.description)
            result.description = def.description;
        return result;
    }
    if (type === "enum") {
        // Zod v4 stores enum entries as an object {a: "a", b: "b"};
        // JSON Schema requires an array.
        const entries = def.entries;
        const enumValues = Array.isArray(entries)
            ? entries
            : typeof entries === "object" && entries !== null
                ? Object.values(entries)
                : entries;
        const result = { type: "string", enum: enumValues };
        if (def.description)
            result.description = def.description;
        return result;
    }
    if (type === "literal") {
        return { type: typeof def.value, enum: [def.value] };
    }
    if (type === "array") {
        const result = { type: "array" };
        if (def.element?._zod?.def) {
            result.items = zodDefToJsonSchema(def.element._zod.def);
        }
        if (def.description)
            result.description = def.description;
        return result;
    }
    if (type === "optional") {
        if (def.innerType?._zod?.def) {
            return zodDefToJsonSchema(def.innerType._zod.def);
        }
    }
    if (type === "default") {
        if (def.innerType?._zod?.def) {
            const inner = zodDefToJsonSchema(def.innerType._zod.def);
            inner.default =
                typeof def.defaultValue === "function"
                    ? def.defaultValue()
                    : def.defaultValue;
            return inner;
        }
    }
    if (type === "nullable") {
        if (def.innerType?._zod?.def) {
            const inner = zodDefToJsonSchema(def.innerType._zod.def);
            // Surface null as a valid value so the model knows it may pass null
            // (and doesn't treat the field as a non-nullable required string).
            return { anyOf: [inner, { type: "null" }] };
        }
    }
    if (type === "union") {
        if (def.options?.length) {
            // Check if it's a simple enum-like union of literals
            const allLiterals = def.options.every((o) => o?._zod?.def?.type === "literal");
            if (allLiterals) {
                const values = def.options.map((o) => o._zod.def.value);
                const jsonTypeOf = (v) => typeof v === "number"
                    ? "number"
                    : typeof v === "boolean"
                        ? "boolean"
                        : "string";
                const uniqueTypes = [...new Set(values.map(jsonTypeOf))];
                if (uniqueTypes.length === 1) {
                    // Homogeneous literal union (e.g. all numbers) — derive the JSON
                    // type instead of hardcoding "string", which would contradict the
                    // enum values and make the model coerce/round-trip them wrongly.
                    return { type: uniqueTypes[0], enum: values };
                }
                // Mixed literal types: emit anyOf so each branch stays self-consistent.
                return {
                    anyOf: values.map((v) => ({ type: jsonTypeOf(v), enum: [v] })),
                };
            }
            return {
                anyOf: def.options.map((o) => zodDefToJsonSchema(o._zod?.def ?? {})),
            };
        }
    }
    // z.preprocess / z.pipe / .superRefine / .transform all produce a "pipe"
    // def with `in` (pre-transform) and `out` (post-transform). For JSON Schema
    // purposes, use `out` — it reflects the validated output shape the model
    // should populate.
    if (type === "pipe") {
        if (def.out?._zod?.def) {
            return zodDefToJsonSchema(def.out._zod.def);
        }
        if (def.in?._zod?.def) {
            return zodDefToJsonSchema(def.in._zod.def);
        }
    }
    // Fallback
    return { type: "string" };
}
// ---------------------------------------------------------------------------
// Runtime validation wrapper
// ---------------------------------------------------------------------------
const NO_COERCE = Symbol("no-coerce");
/**
 * Coerce a single stringified value to one of the JSON-schema types the field
 * expects. Returns NO_COERCE when nothing safe applies, so the caller leaves
 * the original value untouched and the normal validation error still surfaces.
 */
function coerceStringToSchemaType(raw, types) {
    const trimmed = raw.trim();
    if (types.includes("boolean")) {
        if (trimmed === "true")
            return true;
        if (trimmed === "false")
            return false;
    }
    if ((types.includes("array") &&
        trimmed.startsWith("[") &&
        trimmed.endsWith("]")) ||
        (types.includes("object") &&
            trimmed.startsWith("{") &&
            trimmed.endsWith("}"))) {
        try {
            const parsed = JSON.parse(trimmed);
            if (types.includes("array") && Array.isArray(parsed))
                return parsed;
            if (types.includes("object") &&
                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)) {
                return parsed;
            }
        }
        catch {
            // fall through — leave the original so validation reports the real error
        }
    }
    if ((types.includes("number") || types.includes("integer")) &&
        trimmed !== "" &&
        Number.isFinite(Number(trimmed))) {
        const n = Number(trimmed);
        if (types.includes("number") || Number.isInteger(n))
            return n;
    }
    return NO_COERCE;
}
/**
 * Defensively coerce stringified action arguments to the types the schema
 * expects. Two callers depend on this:
 *
 *   1. Model gateways (notably Builder's Gemini-backed gateway) hand back
 *      structured tool-call arguments as JSON strings — an array param arrives
 *      as `"[{...}]"`, a boolean as `"true"`.
 *   2. GET actions called from the browser via `useActionQuery` / `callAction`.
 *      Those serialize params into the query string, where `URLSearchParams`
 *      stringifies everything — so `includeSeries: true` arrives as the string
 *      `"true"` and `limit: 5` as `"5"` (see `action-routes.ts`).
 *
 * In both cases Standard Schema (zod) `validate` does not coerce, so the call
 * fails validation ("expected boolean, received string") — the agent thrashes
 * retrying shapes and the frontend query errors. We only touch a string value
 * when the schema expects a non-string type and the string parses cleanly to
 * it; anything ambiguous (schema also allows string) or unparseable is left
 * as-is. Operates on top-level properties only — once an array/object param is
 * parsed, its nested members are already native and validate normally.
 *
 * Do NOT narrow this to "gateway-only": the GET query-string path relies on it
 * too, and `action-routes.spec.ts` guards that round-trip.
 */
function coerceGatewayStringifiedArgs(args, parameters) {
    const properties = parameters?.properties;
    if (!properties)
        return args;
    if (!args || typeof args !== "object" || Array.isArray(args))
        return args;
    let out = null;
    for (const [key, raw] of Object.entries(args)) {
        if (typeof raw !== "string")
            continue;
        const spec = properties[key];
        if (!spec)
            continue;
        const types = Array.isArray(spec.type)
            ? spec.type
            : spec.type
                ? [spec.type]
                : [];
        // No declared type, or the field legitimately accepts a string → leave it.
        if (types.length === 0 || types.includes("string"))
            continue;
        const coerced = coerceStringToSchemaType(raw, types);
        if (coerced === NO_COERCE)
            continue;
        if (!out)
            out = { ...args };
        out[key] = coerced;
    }
    return out ?? args;
}
// The enums and required members that actually explain a rejection are usually
// nested inside `items`/`oneOf` (a discriminated union of operations), not on
// the top-level property, so rendering only the top level prints `operations*:
// array` — true and useless. Bounded depth keeps a deep schema from crowding out
// the validation errors it is meant to explain.
const MAX_SIGNATURE_DEPTH = 4;
const MAX_SIGNATURE_LENGTH = 1200;
function describeSchemaType(spec, depth) {
    if (!spec)
        return "any";
    if (spec.const !== undefined)
        return JSON.stringify(spec.const);
    if (Array.isArray(spec.enum)) {
        return spec.enum.map((value) => JSON.stringify(value)).join("|");
    }
    const branches = spec.oneOf ?? spec.anyOf;
    if (branches?.length) {
        if (depth >= MAX_SIGNATURE_DEPTH)
            return "object";
        return branches
            .map((branch) => describeSchemaType(branch, depth))
            .join(" | ");
    }
    if (spec.properties && Object.keys(spec.properties).length > 0) {
        if (depth >= MAX_SIGNATURE_DEPTH)
            return "object";
        const required = new Set(spec.required ?? []);
        const members = Object.entries(spec.properties)
            .map(([key, value]) => `${key}${required.has(key) ? "*" : "?"}: ${describeSchemaType(value, depth + 1)}`)
            .join(", ");
        return `{ ${members} }`;
    }
    if (spec.items) {
        if (depth >= MAX_SIGNATURE_DEPTH)
            return "array";
        return `array<${describeSchemaType(spec.items, depth + 1)}>`;
    }
    return Array.isArray(spec.type) ? spec.type.join("|") : (spec.type ?? "any");
}
/**
 * Compact signature of an action's parameters, e.g.
 * `{ deckId*: string, operation*: "edit"|"replace", slideId?: string }` where
 * `*` = required and `?` = optional.
 *
 * Enum values are spelled out because a rejected call is usually a wrong enum:
 * gateways that pre-fill optional fields reach for the first allowed value, and
 * a model that only learns "must be equal to one of the allowed values" re-sends
 * the same guess until the identical-error breaker kills the turn.
 *
 * Shared so the raw-JSON-schema tool path in the agent loop describes a
 * rejection the same way `wrapWithValidation` does for Zod actions.
 */
export function describeToolParameterSignature(parameters, only) {
    const properties = parameters?.properties;
    if (!properties)
        return null;
    const required = new Set(parameters?.required ?? []);
    const keys = Object.keys(properties).filter((key) => !only?.length || only.includes(key));
    const sig = (keys.length ? keys : Object.keys(properties))
        .map((key) => `${key}${required.has(key) ? "*" : "?"}: ${describeSchemaType(properties[key], 1)}`)
        .join(", ");
    if (!sig)
        return null;
    return `{ ${sig.length > MAX_SIGNATURE_LENGTH ? `${sig.slice(0, MAX_SIGNATURE_LENGTH)}…` : sig} }`;
}
/**
 * Wrap an action's run function with schema validation.
 * Invalid inputs get a clear error message (including what was actually passed)
 * so the agent can see its own mistake and correct it on the next turn.
 */
function wrapWithValidation(schema, run, toolParameters) {
    return async (args, ctx) => {
        args = coerceGatewayStringifiedArgs(args, toolParameters);
        const result = await schema["~standard"].validate(args);
        if (result.issues) {
            // Split issues into "missing required field" vs other validation errors
            // so the error message reads naturally rather than as "fieldName: Required".
            const missing = [];
            const other = [];
            for (const issue of result.issues) {
                const pathStr = issue.path
                    ? issue.path.map((p) => (typeof p === "object" ? p.key : p)).join(".")
                    : "";
                const msg = String(issue.message ?? "");
                // Zod emits "Required" for missing fields; other libraries may use
                // similar wording. Treat any variant as "missing".
                if (pathStr &&
                    (msg === "Required" ||
                        /invalid.*undefined/i.test(msg) ||
                        /expected.*received undefined/i.test(msg))) {
                    missing.push(pathStr);
                }
                else {
                    other.push(pathStr ? `${pathStr}: ${msg}` : msg);
                }
            }
            const parts = [];
            if (missing.length > 0) {
                parts.push(`Missing required parameter${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`);
            }
            if (other.length > 0) {
                parts.push(other.join("; "));
            }
            // Echo the args that were actually passed so the caller (usually an
            // agent) can see exactly what it sent and fix its next call.
            let received;
            try {
                received = JSON.stringify(args);
                if (received.length > 500)
                    received = received.slice(0, 500) + "…";
            }
            catch {
                received = String(args);
            }
            const signature = describeToolParameterSignature(toolParameters);
            const expected = signature
                ? ` Expected: ${signature} (where * = required, ? = optional).`
                : "";
            throw new Error(`Invalid action parameters — ${parts.join(". ")}. Received: ${received}.${expected}`);
        }
        return run(result.value, ctx);
    };
}
/**
 * Wrap an action's run function with RETURN-value validation. Runs AFTER the
 * (already input-validated) `run` resolves and validates the result against
 * `outputSchema` using the Standard Schema `~standard.validate` contract.
 *
 * Behavior is governed by `strategy`:
 * - `"strict"`  — throw a clear error when the result doesn't match.
 * - `"warn"`    — `console.warn` the issues and return the ORIGINAL result
 *                 unchanged (default; never alters runtime behavior).
 * - `"fallback"`— return `fallback` in place of the invalid result.
 *
 * On success the validated value is returned (so schema-applied coercion /
 * defaults take effect, mirroring the input path).
 */
function wrapWithOutputValidation(outputSchema, run, strategy, fallback, description) {
    return async (args, ctx) => {
        const output = await run(args, ctx);
        const result = await outputSchema["~standard"].validate(output);
        if (!result.issues) {
            // Return the validated value so coercion / defaults defined on the
            // outputSchema are applied, consistent with the input path.
            return result.value;
        }
        const issues = result.issues
            .map((issue) => {
            const pathStr = issue.path
                ? issue.path.map((p) => (typeof p === "object" ? p.key : p)).join(".")
                : "";
            const msg = String(issue.message ?? "");
            return pathStr ? `${pathStr}: ${msg}` : msg;
        })
            .join("; ");
        const label = description ? ` (${description})` : "";
        const summary = `Action output did not match outputSchema${label}: ${issues}`;
        if (strategy === "strict") {
            throw new Error(summary);
        }
        if (strategy === "fallback") {
            return fallback;
        }
        // "warn" (default): surface the mismatch but never change behavior.
        console.warn(summary);
        return output;
    };
}
