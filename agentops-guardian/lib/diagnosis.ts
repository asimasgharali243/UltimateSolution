export type Severity = "critical" | "high" | "medium" | "low";
export type Triage = { severity: Severity; category: string; likelyCause: string; evidence: string[]; nextSteps: string[]; confidence: "low" | "medium"; };
type Rule = { pattern: RegExp; category: string; severity: Severity; cause: string; next: string[] };
const RULES: Rule[] = [
{pattern:/ECONNREFUSED|connection refused/i,category:"Connectivity",severity:"high",cause:"The target service refused a connection; verify address, readiness and firewall rules.",next:["Check host and port","Verify service health and network policy","Retry with bounded backoff"]},
{pattern:/Cannot read properties of (undefined|null)|TypeError.*undefined/i,category:"Null reference",severity:"high",cause:"Code accesses a property on a null or undefined value.",next:["Trace the invalid input","Add a type-safe guard","Test missing and malformed inputs"]},
{pattern:/out of memory|heap out of memory|OOMKilled/i,category:"Resource exhaustion",severity:"critical",cause:"The process may have exceeded available memory.",next:["Inspect memory metrics","Investigate leaks","Set resource limits"]},
{pattern:/401 Unauthorized|403 Forbidden|permission denied/i,category:"Authorization",severity:"high",cause:"A request lacks valid authorization or permission.",next:["Check token scopes without logging secrets","Verify resource ownership","Add authorization tests"]},
{pattern:/ETIMEDOUT|timeout exceeded|timed out/i,category:"Timeout",severity:"medium",cause:"An operation exceeded a deadline.",next:["Find slow dependency","Add bounded retry policy","Measure latency"]},
{pattern:/SyntaxError|Unexpected token|Module not found|Cannot find module/i,category:"Build or syntax",severity:"medium",cause:"Module loading or syntax validation failed.",next:["Inspect referenced file and line","Run build","Add regression test"]}
];
export function redactSecrets(text:string):string {return text.replace(/(Bearer\s+)[A-Za-z0-9._~+/=-]{8,}/gi,"$1[REDACTED]").replace(/(\b(?:api[_-]?key|password|secret|token)\s*[:=]\s*)["']?[^\s,"']{5,}["']?/gi,"$1[REDACTED]").replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g,"[REDACTED]");}
export function triage(logs:string):Triage {
const match=RULES.find(rule=>rule.pattern.test(logs));
const lines=redactSecrets(logs).split(/\r?\n/).filter(Boolean);
const evidence=(match?lines.filter(l=>match.pattern.test(l)):lines).slice(0,3).map(l=>l.slice(0,240));
return match?{severity:match.severity,category:match.category,likelyCause:match.cause,evidence,nextSteps:match.next,confidence:"medium"}:{severity:"low",category:"Unclassified",likelyCause:"Insufficient evidence for a specific diagnosis.",evidence,nextSteps:["Collect a reproducible error","Inspect first exception and stack trace","Run application tests"],confidence:"low"};
}
export function staticPatchChecks(patch:string){
const warnings:string[]=[];
if(!patch.trim())warnings.push("No proposed patch exists.");
if(/\beval\s*\(|\bexec\s*\(|child_process|shell\s*:\s*true/i.test(patch))warnings.push("Potential code-execution primitive; require manual review.");
if(/\b(?:sk-[A-Za-z0-9_-]{12,}|AKIA[0-9A-Z]{16})\b/.test(patch))warnings.push("Possible embedded credential.");
if(/\b(?:rm\s+-rf|DROP\s+TABLE|chmod\s+777)\b/i.test(patch))warnings.push("Potentially destructive operation.");
return{passed:warnings.length===0,warnings,level:"static_text_review_only" as const,testsExecuted:0};
}